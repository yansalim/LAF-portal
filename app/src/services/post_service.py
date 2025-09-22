from __future__ import annotations

from datetime import datetime
from typing import Optional, Tuple

from sqlalchemy import asc, desc, func, or_

from ..extensions import db
from ..models import Category, Post, PostStatus, User, UserRole
from ..schemas import PostCreateSchema, PostSchema, PostUpdateSchema
from ..utils.clock import ensure_tz, has_passed, utcnow
from ..utils.responses import ApiError


class PostService:
    schema = PostSchema()
    create_schema = PostCreateSchema()
    update_schema = PostUpdateSchema()

    @staticmethod
    def list_posts(
        *,
        requesting_user: User,
        page: int = 1,
        page_size: int = 20,
        status: Optional[str] = None,
        category: Optional[str] = None,
        author: Optional[str] = None,
        query: Optional[str] = None,
        order: Optional[str] = None,
    ) -> Tuple[list[Post], int]:
        q = Post.query.join(Category).join(User)

        if status:
            q = q.filter(Post.status == PostStatus(status))
        if category:
            q = q.filter(or_(Category.slug == category, Category.id == category))
        if author:
            q = q.filter(Post.author_id == author)
        if query:
            term = f"%{query.lower()}%"
            q = q.filter(
                or_(
                    func.lower(Post.title).ilike(term),
                    func.lower(Post.excerpt).ilike(term),
                    func.lower(Category.name).ilike(term),
                    func.lower(Category.slug).ilike(term),
                )
            )

        q = PostService._apply_user_scope(q, requesting_user)

        sort_field, sort_dir = PostService._parse_order(order)
        sort_column = getattr(Post, sort_field)
        q = q.order_by(asc(sort_column) if sort_dir == 'asc' else desc(sort_column))

        total = q.count()
        items = q.offset((page - 1) * page_size).limit(page_size).all()
        return items, total

    @staticmethod
    def create_post(data: dict, requesting_user: User) -> Post:
        payload = PostService.create_schema.load(data)
        category = Category.query.get(payload['category_id'])
        if not category:
            raise ApiError('CATEGORY_NOT_FOUND', 'Categoria não encontrada', status=404)

        author = User.query.get(payload['author_id'])
        if not author:
            raise ApiError('AUTHOR_NOT_FOUND', 'Autor não encontrado', status=404)

        PostService._assert_user_can_write(requesting_user, category, author_id=author.id)
        PostService._ensure_unique_slug(payload['slug'])

        status = PostStatus(payload.get('status', PostStatus.DRAFT.value))
        published_at = ensure_tz(payload.get('published_at')) if payload.get('published_at') else None
        if status == PostStatus.SCHEDULED and not published_at:
            raise ApiError('VALIDATION_ERROR', 'Informe a data de publicação para agendamento', status=422)
        if status == PostStatus.SCHEDULED and published_at and has_passed(published_at):
            raise ApiError('VALIDATION_ERROR', 'Data de agendamento deve ser futura', status=422)
        if status == PostStatus.PUBLISHED and not published_at:
            published_at = utcnow()

        post = Post(
            slug=payload['slug'],
            title=payload['title'],
            excerpt=payload.get('excerpt'),
            cover_image_url=payload.get('cover_image_url'),
            content_markdown=payload['content_markdown'],
            status=status,
            category_id=category.id,
            author_id=author.id,
            published_at=published_at,
        )
        db.session.add(post)
        db.session.commit()
        return post

    @staticmethod
    def get_post(identifier: str, *, requesting_user: Optional[User] = None) -> Post:
        post = Post.query.filter((Post.id == identifier) | (Post.slug == identifier)).first()
        if not post:
            raise ApiError('NOT_FOUND', 'Post não encontrado', status=404)
        if requesting_user:
            PostService._assert_user_can_read(requesting_user, post)
        return post

    @staticmethod
    def update_post(post_id: str, data: dict, requesting_user: User) -> Post:
        post = PostService.get_post(post_id)
        payload = PostService.update_schema.load(data)

        if 'slug' in payload and payload['slug'] != post.slug:
            PostService._ensure_unique_slug(payload['slug'])
            post.slug = payload['slug']
        if 'title' in payload:
            post.title = payload['title']
        if 'excerpt' in payload:
            post.excerpt = payload['excerpt']
        if 'cover_image_url' in payload:
            post.cover_image_url = payload['cover_image_url']
        if 'content_markdown' in payload:
            post.content_markdown = payload['content_markdown']
        if 'category_id' in payload:
            new_category = Category.query.get(payload['category_id'])
            if not new_category:
                raise ApiError('CATEGORY_NOT_FOUND', 'Categoria não encontrada', status=404)
            PostService._assert_user_can_write(requesting_user, new_category, author_id=post.author_id)
            post.category_id = new_category.id
        if 'author_id' in payload:
            author = User.query.get(payload['author_id'])
            if not author:
                raise ApiError('AUTHOR_NOT_FOUND', 'Autor não encontrado', status=404)
            PostService._assert_user_can_write(requesting_user, post.category, author_id=author.id)
            post.author_id = author.id
        if 'status' in payload:
            post.status = PostStatus(payload['status'])
        if 'published_at' in payload:
            post.published_at = ensure_tz(payload['published_at']) if payload['published_at'] else None

        PostService._assert_user_can_write(requesting_user, post.category, author_id=post.author_id)

        if post.status == PostStatus.SCHEDULED:
            if not post.published_at:
                raise ApiError('VALIDATION_ERROR', 'Informe a data de agendamento', status=422)
            if has_passed(post.published_at):
                raise ApiError('VALIDATION_ERROR', 'Data de agendamento deve ser futura', status=422)
        if post.status == PostStatus.PUBLISHED and not post.published_at:
            post.published_at = utcnow()

        db.session.commit()
        return post

    @staticmethod
    def delete_post(post_id: str, requesting_user: User) -> None:
        post = PostService.get_post(post_id)
        PostService._assert_user_can_write(requesting_user, post.category, author_id=post.author_id)
        db.session.delete(post)
        db.session.commit()

    @staticmethod
    def publish_post(post_id: str, requesting_user: User) -> Post:
        post = PostService.get_post(post_id)
        PostService._assert_user_can_write(requesting_user, post.category, author_id=post.author_id)
        post.status = PostStatus.PUBLISHED
        if not post.published_at:
            post.published_at = utcnow()
        db.session.commit()
        return post

    @staticmethod
    def schedule_post(post_id: str, requesting_user: User, published_at: datetime) -> Post:
        post = PostService.get_post(post_id)
        PostService._assert_user_can_write(requesting_user, post.category, author_id=post.author_id)
        if not published_at:
            raise ApiError('VALIDATION_ERROR', 'Informe a data de agendamento', status=422)
        published_at = ensure_tz(published_at)
        if has_passed(published_at):
            raise ApiError('VALIDATION_ERROR', 'Data deve ser futura para agendamento', status=422)
        post.status = PostStatus.SCHEDULED
        post.published_at = published_at
        db.session.commit()
        return post

    @staticmethod
    def list_public_posts(
        page: int = 1,
        page_size: int = 12,
        category_slug: Optional[str] = None,
        query: Optional[str] = None,
        order: Optional[str] = None,
    ) -> Tuple[list[Post], int]:
        q = Post.query.join(Category).join(User).filter(Post.status == PostStatus.PUBLISHED)
        q = q.filter(or_(Post.published_at.is_(None), Post.published_at <= utcnow()))
        q = q.filter(Category.is_active.is_(True))
        if category_slug:
            q = q.filter(Category.slug == category_slug)
        if query:
            term = f"%{query.lower()}%"
            q = q.filter(or_(func.lower(Post.title).ilike(term), func.lower(Post.excerpt).ilike(term)))

        sort_field, sort_dir = PostService._parse_order(order or 'published_at:desc')
        sort_column = getattr(Post, sort_field)
        q = q.order_by(asc(sort_column) if sort_dir == 'asc' else desc(sort_column))

        total = q.count()
        items = q.offset((page - 1) * page_size).limit(page_size).all()
        return items, total

    @staticmethod
    def get_public_post(slug: str) -> Post:
        post = (
            Post.query.join(Category)
            .filter(Post.slug == slug, Post.status == PostStatus.PUBLISHED)
            .filter(or_(Post.published_at.is_(None), Post.published_at <= utcnow()))
            .filter(Category.is_active.is_(True))
            .first()
        )
        if not post:
            raise ApiError('NOT_FOUND', 'Post não encontrado ou indisponível', status=404)
        return post

    @staticmethod
    def _ensure_unique_slug(slug: str) -> None:
        if Post.query.filter_by(slug=slug).first():
            raise ApiError('POST_EXISTS', 'Slug de post já cadastrado', status=409)

    @staticmethod
    def _parse_order(order: Optional[str]) -> Tuple[str, str]:
        default = ('created_at', 'desc')
        if not order:
            return default
        if ':' in order:
            field, direction = order.split(':', 1)
        else:
            field, direction = order, 'desc'
        field = field if field in {'created_at', 'published_at', 'title'} else 'created_at'
        direction = direction if direction in {'asc', 'desc'} else 'desc'
        return field, direction

    @staticmethod
    def _apply_user_scope(query, user: User):
        if user.role in {UserRole.ADMIN, UserRole.SECRETARIA, UserRole.EDITOR}:
            return query
        allowed_slugs = set(user.allowed_category_slugs or [])
        if user.role == UserRole.TJD:
            allowed_slugs.add('tjd')
            extra = [c.slug for c in Category.query.all() if c.allowed_roles and 'tjd' in c.allowed_roles]
            allowed_slugs.update(extra)
        if user.role == UserRole.EDITOR:
            extra = [c.slug for c in Category.query.all() if c.allowed_roles and 'editor' in c.allowed_roles]
            allowed_slugs.update(extra)
        if not allowed_slugs:
            allowed_slugs = {'__empty__'}
        return query.filter(Category.slug.in_(allowed_slugs))

    @staticmethod
    def _assert_user_can_read(user: User, post: Post) -> None:
        if post.is_public():
            return
        PostService._assert_user_can_write(user, post.category, author_id=post.author_id)

    @staticmethod
    def _assert_user_can_write(user: User, category: Category, *, author_id: str) -> None:
        if not user.is_active:
            raise ApiError('FORBIDDEN', 'Usuário inativo', status=403)

        if user.role in {UserRole.ADMIN, UserRole.SECRETARIA, UserRole.EDITOR}:
            return

        if user.role == UserRole.TJD:
            if category.slug != 'tjd' and (not category.allowed_roles or 'tjd' not in category.allowed_roles):
                raise ApiError('FORBIDDEN', 'Usuário TJD não pode publicar nesta categoria', status=403)
            if author_id != user.id:
                raise ApiError('FORBIDDEN', 'Usuário não pode atribuir outro autor', status=403)
            return

        raise ApiError('FORBIDDEN', 'Usuário sem permissão para esta operação', status=403)
