from __future__ import annotations

from http import HTTPStatus

from flask_jwt_extended import create_access_token, get_jwt_identity

from ..extensions import db
from ..models.user import User
from ..schemas import UserSchema
from ..utils.responses import ApiError


class AuthService:
    user_schema = UserSchema()

    @staticmethod
    def login(email: str, password: str):
        user = User.query.filter_by(email=email.lower()).first()
        if not user or not user.check_password(password):
            raise ApiError('INVALID_CREDENTIALS', 'E-mail ou senha inválidos', status=HTTPStatus.UNAUTHORIZED)
        if not user.is_active:
            raise ApiError('USER_INACTIVE', 'Usuário inativo', status=HTTPStatus.FORBIDDEN)

        additional_claims = {'role': user.role.value}
        token = create_access_token(identity=user.id, additional_claims=additional_claims)
        return token, AuthService.user_schema.dump(user)

    @staticmethod
    def get_current_user() -> User:
        identity = get_jwt_identity()
        if not identity:
            raise ApiError('UNAUTHORIZED', 'Token inválido ou ausente', status=HTTPStatus.UNAUTHORIZED)
        user = User.query.get(identity)
        if not user:
            raise ApiError('UNAUTHORIZED', 'Usuário não encontrado para este token', status=HTTPStatus.UNAUTHORIZED)
        if not user.is_active:
            raise ApiError('USER_INACTIVE', 'Usuário inativo', status=HTTPStatus.FORBIDDEN)
        return user

    @staticmethod
    def logout():
        db.session.commit()
