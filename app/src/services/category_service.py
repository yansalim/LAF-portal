from __future__ import annotations

from sqlalchemy import or_

from ..extensions import db
from ..models import Category
from ..schemas import CategoryCreateSchema, CategorySchema, CategoryUpdateSchema
from ..utils.responses import ApiError


class CategoryService:
    schema = CategorySchema()
    list_schema = CategorySchema(many=True)
    create_schema = CategoryCreateSchema()
    update_schema = CategoryUpdateSchema()

    @staticmethod
    def list_categories(page: int = 1, page_size: int = 20, *, include_inactive: bool = True, query: str | None = None):
        q = Category.query
        if not include_inactive:
            q = q.filter(Category.is_active.is_(True))
        if query:
            term = f"%{query.lower()}%"
            q = q.filter(or_(Category.name.ilike(term), Category.slug.ilike(term)))

        total = q.count()
        items = (
            q.order_by(Category.name.asc())
            .offset((page - 1) * page_size)
            .limit(page_size)
            .all()
        )
        return items, total

    @staticmethod
    def create_category(data: dict) -> Category:
        payload = CategoryService.create_schema.load(data)
        CategoryService._ensure_unique(payload['name'], payload['slug'])
        category = Category(**payload)
        db.session.add(category)
        db.session.commit()
        return category

    @staticmethod
    def get_category(identifier: str) -> Category:
        category = Category.query.filter(
            (Category.id == identifier) | (Category.slug == identifier)
        ).first()
        if not category:
            raise ApiError('NOT_FOUND', 'Categoria não encontrada', status=404)
        return category

    @staticmethod
    def update_category(category_id: str, data: dict) -> Category:
        payload = CategoryService.update_schema.load(data)
        category = CategoryService.get_category(category_id)
        if 'name' in payload and payload['name'] != category.name:
            CategoryService._ensure_unique(payload['name'], None)
            category.name = payload['name']
        if 'slug' in payload and payload['slug'] != category.slug:
            CategoryService._ensure_unique(None, payload['slug'])
            category.slug = payload['slug']
        for field in ['description', 'is_active', 'allowed_roles']:
            if field in payload:
                setattr(category, field, payload[field])
        db.session.commit()
        return category

    @staticmethod
    def delete_category(category_id: str) -> None:
        category = CategoryService.get_category(category_id)
        if category.posts.count() > 0:
            raise ApiError('CATEGORY_IN_USE', 'Categoria possui posts associados', status=409)
        db.session.delete(category)
        db.session.commit()

    @staticmethod
    def _ensure_unique(name: str | None, slug: str | None) -> None:
        if name and Category.query.filter_by(name=name).first():
            raise ApiError('CATEGORY_EXISTS', 'Nome de categoria já cadastrado', status=409)
        if slug and Category.query.filter_by(slug=slug).first():
            raise ApiError('CATEGORY_EXISTS', 'Slug de categoria já cadastrado', status=409)
