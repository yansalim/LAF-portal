from __future__ import annotations

from math import ceil

from sqlalchemy import or_

from ..extensions import db
from ..models import User, UserRole
from ..schemas import UserCreateSchema, UserSchema, UserUpdateSchema
from ..utils.responses import ApiError


class UserService:
    user_schema = UserSchema()
    users_schema = UserSchema(many=True)
    user_create_schema = UserCreateSchema()
    user_update_schema = UserUpdateSchema()

    @staticmethod
    def list_users(page: int = 1, page_size: int = 20, role: str | None = None, query: str | None = None):
        q = User.query
        if role:
            q = q.filter(User.role == UserRole(role))
        if query:
            term = f"%{query.lower()}%"
            q = q.filter(or_(User.email.ilike(term), User.name.ilike(term)))

        total = q.count()
        items = q.order_by(User.created_at.desc()).offset((page - 1) * page_size).limit(page_size).all()
        return items, total

    @staticmethod
    def create_user(data: dict) -> User:
        payload = UserService.user_create_schema.load(data)
        payload['password'] = payload['password'].strip()
        role = UserRole(payload['role'])
        if User.query.filter_by(email=payload['email'].lower()).first():
            raise ApiError('EMAIL_EXISTS', 'E-mail já cadastrado', status=409)

        user = User(
            name=payload['name'],
            email=payload['email'].lower(),
            role=role,
            is_active=payload.get('is_active', True),
        )
        user.set_password(payload['password'])
        user.allowed_category_slugs = UserService._sanitize_allowed_categories(role, payload.get('allowed_category_slugs'))
        db.session.add(user)
        db.session.commit()
        return user

    @staticmethod
    def get_user(user_id: str) -> User:
        user = User.query.get(user_id)
        if not user:
            raise ApiError('NOT_FOUND', 'Usuário não encontrado', status=404)
        return user

    @staticmethod
    def update_user(user_id: str, data: dict) -> User:
        payload = UserService.user_update_schema.load(data)
        user = UserService.get_user(user_id)

        if 'email' in payload:
            email = payload['email'].lower()
            existing = User.query.filter(User.email == email, User.id != user.id).first()
            if existing:
                raise ApiError('EMAIL_EXISTS', 'E-mail já cadastrado', status=409)
            user.email = email

        if 'name' in payload:
            user.name = payload['name']
        if 'role' in payload:
            user.role = UserRole(payload['role'])
        if 'is_active' in payload:
            user.is_active = payload['is_active']
        if 'password' in payload and payload['password']:
            payload['password'] = payload['password'].strip()
            if payload['password']:
                user.set_password(payload['password'])
        if 'allowed_category_slugs' in payload:
            user.allowed_category_slugs = UserService._sanitize_allowed_categories(user.role, payload['allowed_category_slugs'])

        db.session.commit()
        return user

    @staticmethod
    def delete_user(user_id: str) -> None:
        user = UserService.get_user(user_id)
        db.session.delete(user)
        db.session.commit()

    @staticmethod
    def _sanitize_allowed_categories(role: UserRole, slugs):
        if role in {UserRole.ADMIN, UserRole.SECRETARIA}:
            return None
        if role == UserRole.TJD:
            return ['tjd']
        if not slugs:
            raise ApiError('VALIDATION_ERROR', 'Selecione ao menos uma categoria para este usuário', status=422)
        unique = sorted({slug for slug in slugs if slug})
        if not unique:
            raise ApiError('VALIDATION_ERROR', 'Selecione ao menos uma categoria para este usuário', status=422)
        return unique
