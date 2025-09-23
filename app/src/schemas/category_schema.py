from __future__ import annotations

from marshmallow import Schema, fields, validate


class CategorySchema(Schema):
    id = fields.Str(dump_only=True)
    name = fields.Str(required=True)
    slug = fields.Str(required=True)
    description = fields.Str(allow_none=True)
    is_active = fields.Bool(required=True)
    allowed_roles = fields.List(fields.Str(), allow_none=True)
    created_at = fields.DateTime(dump_only=True)
    updated_at = fields.DateTime(dump_only=True)


class CategoryCreateSchema(Schema):
    name = fields.Str(required=True, validate=validate.Length(min=2, max=120))
    slug = fields.Str(required=True, validate=validate.Length(min=2, max=150))
    description = fields.Str(allow_none=True)
    is_active = fields.Bool(load_default=True)
    allowed_roles = fields.List(fields.Str(), allow_none=True)


class CategoryUpdateSchema(Schema):
    name = fields.Str(validate=validate.Length(min=2, max=120))
    slug = fields.Str(validate=validate.Length(min=2, max=150))
    description = fields.Str(allow_none=True)
    is_active = fields.Bool()
    allowed_roles = fields.List(fields.Str(), allow_none=True)
