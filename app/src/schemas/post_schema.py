from __future__ import annotations

from marshmallow import Schema, fields, validate

from ..models.post import PostStatus


class PostAuthorSchema(Schema):
    id = fields.Str()
    name = fields.Str()
    email = fields.Email()


class PostCategorySchema(Schema):
    id = fields.Str()
    name = fields.Str()
    slug = fields.Str()


class PostSchema(Schema):
    id = fields.Str(dump_only=True)
    slug = fields.Str(required=True)
    title = fields.Str(required=True)
    excerpt = fields.Str(allow_none=True)
    cover_image_url = fields.Str(allow_none=True)
    content_markdown = fields.Str(required=True)
    status = fields.Str(required=True, validate=validate.OneOf([status.value for status in PostStatus]))
    category = fields.Nested(PostCategorySchema)
    author = fields.Nested(PostAuthorSchema)
    published_at = fields.DateTime(allow_none=True)
    created_at = fields.DateTime(dump_only=True)
    updated_at = fields.DateTime(dump_only=True)


class PostListSchema(PostSchema):
    content_markdown = fields.Str(dump_only=True)


class PostCreateSchema(Schema):
    slug = fields.Str(required=True, validate=validate.Length(min=2, max=160))
    title = fields.Str(required=True, validate=validate.Length(min=3, max=255))
    excerpt = fields.Str(allow_none=True)
    cover_image_url = fields.Str(allow_none=True)
    content_markdown = fields.Str(required=True)
    status = fields.Str(load_default=PostStatus.DRAFT.value, validate=validate.OneOf([status.value for status in PostStatus]))
    category_id = fields.Str(required=True)
    author_id = fields.Str(required=True)
    published_at = fields.DateTime(allow_none=True)


class PostUpdateSchema(Schema):
    slug = fields.Str(validate=validate.Length(min=2, max=160))
    title = fields.Str(validate=validate.Length(min=3, max=255))
    excerpt = fields.Str(allow_none=True)
    cover_image_url = fields.Str(allow_none=True)
    content_markdown = fields.Str()
    status = fields.Str(validate=validate.OneOf([status.value for status in PostStatus]))
    category_id = fields.Str()
    author_id = fields.Str()
    published_at = fields.DateTime(allow_none=True)
