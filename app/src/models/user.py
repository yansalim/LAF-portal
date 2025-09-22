from __future__ import annotations

import uuid
from datetime import datetime
from enum import Enum

from werkzeug.security import check_password_hash, generate_password_hash

from ..extensions import db
from ..utils.clock import utcnow


class UserRole(str, Enum):
    ADMIN = 'admin'
    SECRETARIA = 'secretaria'
    TJD = 'tjd'
    EDITOR = 'editor'


class User(db.Model):
    __tablename__ = 'users'

    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    name = db.Column(db.String(120), nullable=False)
    email = db.Column(db.String(255), unique=True, nullable=False, index=True)
    password_hash = db.Column(db.String(255), nullable=False)
    role = db.Column(
        db.Enum(
            UserRole,
            native_enum=False,
            length=20,
            values_callable=lambda enum_cls: [member.value for member in enum_cls],
        ),
        nullable=False,
    )
    is_active = db.Column(db.Boolean, default=True, nullable=False)
    allowed_category_slugs = db.Column(db.JSON, nullable=True)
    created_at = db.Column(db.DateTime(timezone=True), default=utcnow, nullable=False)
    updated_at = db.Column(db.DateTime(timezone=True), default=utcnow, onupdate=utcnow, nullable=False)

    posts = db.relationship('Post', back_populates='author', lazy='dynamic')

    PASSWORD_METHOD = 'pbkdf2:sha256:600000'

    def set_password(self, password: str) -> None:
        cleaned = (password or '').strip()
        self.password_hash = generate_password_hash(cleaned, method=self.PASSWORD_METHOD)

    def check_password(self, password: str) -> bool:
        candidate = (password or '').strip()
        try:
            return check_password_hash(self.password_hash, candidate)
        except ValueError:
            return False

    def to_dict(self) -> dict:
        return {
            'id': self.id,
            'name': self.name,
            'email': self.email,
            'role': self.role.value,
            'is_active': self.is_active,
            'allowed_category_slugs': list(self.allowed_category_slugs or []),
            'created_at': self.created_at.isoformat() if isinstance(self.created_at, datetime) else self.created_at,
            'updated_at': self.updated_at.isoformat() if isinstance(self.updated_at, datetime) else self.updated_at,
        }

    @property
    def has_full_access(self) -> bool:
        return self.role in {UserRole.ADMIN, UserRole.SECRETARIA}
