from __future__ import annotations

from marshmallow import Schema, fields, validate

from ..models.user import UserRole


class UserSchema(Schema):
    id = fields.Str(dump_only=True)
    name = fields.Str(required=True)
    email = fields.Email(required=True)
    role = fields.Function(lambda obj: obj.role.value if obj.role else None)
    is_active = fields.Bool()
    created_at = fields.DateTime(dump_only=True)
    updated_at = fields.DateTime(dump_only=True)
    allowed_category_slugs = fields.List(fields.Str(), attribute='allowed_category_slugs', dump_only=True)


class UserCreateSchema(Schema):
    name = fields.Str(required=True, validate=validate.Length(min=2, max=120))
    email = fields.Email(required=True)
    password = fields.Str(required=True, load_only=True, validate=validate.Length(min=6))
    role = fields.Str(required=True, validate=validate.OneOf([role.value for role in UserRole]))
    is_active = fields.Bool(load_default=True)
    allowed_category_slugs = fields.List(fields.Str(), load_default=list)


class UserUpdateSchema(Schema):
    name = fields.Str(validate=validate.Length(min=2, max=120))
    email = fields.Email()
    password = fields.Str(load_only=True, validate=validate.Length(min=6))
    role = fields.Str(validate=validate.OneOf([role.value for role in UserRole]))
    is_active = fields.Bool()
    allowed_category_slugs = fields.List(fields.Str())
