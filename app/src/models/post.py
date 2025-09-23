from __future__ import annotations

import uuid
from datetime import datetime
from enum import Enum

from sqlalchemy import Index

from ..extensions import db
from ..utils.clock import has_passed, utcnow


class PostStatus(str, Enum):
    DRAFT = 'DRAFT'
    PUBLISHED = 'PUBLISHED'
    SCHEDULED = 'SCHEDULED'


class Post(db.Model):
    __tablename__ = 'posts'

    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    slug = db.Column(db.String(160), nullable=False, unique=True, index=True)
    title = db.Column(db.String(255), nullable=False)
    excerpt = db.Column(db.String(500), nullable=True)
    cover_image_url = db.Column(db.String(500), nullable=True)
    content_markdown = db.Column(db.Text, nullable=False)
    status = db.Column(db.Enum(PostStatus, native_enum=False, length=20), default=PostStatus.DRAFT, nullable=False)
    category_id = db.Column(db.String(36), db.ForeignKey('categories.id'), nullable=False, index=True)
    author_id = db.Column(db.String(36), db.ForeignKey('users.id'), nullable=False, index=True)
    published_at = db.Column(db.DateTime(timezone=True), nullable=True)
    created_at = db.Column(db.DateTime(timezone=True), default=utcnow, nullable=False)
    updated_at = db.Column(db.DateTime(timezone=True), default=utcnow, onupdate=utcnow, nullable=False)

    category = db.relationship('Category', back_populates='posts')
    author = db.relationship('User', back_populates='posts')

    __table_args__ = (
        Index('ix_posts_status', 'status'),
        Index('ix_posts_published_at', 'published_at'),
    )

    def is_public(self) -> bool:
        return self.status == PostStatus.PUBLISHED and has_passed(self.published_at)

    def to_dict(self, include_content: bool = True) -> dict:
        data = {
            'id': self.id,
            'slug': self.slug,
            'title': self.title,
            'excerpt': self.excerpt,
            'cover_image_url': self.cover_image_url,
            'status': self.status.value,
            'category': self.category.to_dict() if self.category else None,
            'author': self.author.to_dict() if self.author else None,
            'published_at': self.published_at.isoformat() if isinstance(self.published_at, datetime) else self.published_at,
            'created_at': self.created_at.isoformat() if isinstance(self.created_at, datetime) else self.created_at,
            'updated_at': self.updated_at.isoformat() if isinstance(self.updated_at, datetime) else self.updated_at,
        }
        if include_content:
            data['content_markdown'] = self.content_markdown
        return data
