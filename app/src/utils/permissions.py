from __future__ import annotations

from functools import wraps
from typing import Callable

from flask_jwt_extended import jwt_required

from ..models.user import UserRole
from ..services.auth_service import AuthService
from ..utils.responses import ApiError


def require_roles(*roles: UserRole | str):
    allowed = {role if isinstance(role, str) else role.value for role in roles}

    def decorator(fn: Callable):
        @jwt_required()
        @wraps(fn)
        def wrapper(*args, **kwargs):
            user = AuthService.get_current_user()
            if allowed and user.role.value not in allowed:
                raise ApiError('FORBIDDEN', 'Usuário sem permissão', status=403)
            return fn(*args, current_user=user, **kwargs)

        return wrapper

    return decorator


def require_authenticated(fn: Callable):
    @jwt_required()
    @wraps(fn)
    def wrapper(*args, **kwargs):
        user = AuthService.get_current_user()
        return fn(*args, current_user=user, **kwargs)

    return wrapper
