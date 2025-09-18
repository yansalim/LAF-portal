from flask import Blueprint, request
from flask_jwt_extended import jwt_required

from ..services import AuthService
from ..utils.responses import ApiError, success_response

auth_bp = Blueprint('auth', __name__)


@auth_bp.post('/login')
def login():
    """Realiza login com e-mail e senha
    ---
    tags:
      - Auth
    consumes:
      - application/json
    parameters:
      - in: body
        name: credentials
        schema:
          type: object
          required: [email, password]
          properties:
            email:
              type: string
              example: admin@organizacao.local
            password:
              type: string
              example: 123456
    responses:
      200:
        description: Login efetuado com sucesso
        schema:
          $ref: '#/definitions/AuthLoginResponse'
      401:
        description: Credenciais inválidas
        schema:
          $ref: '#/definitions/Error'
      422:
        description: Dados inválidos
        schema:
          $ref: '#/definitions/Error'
    """
    payload = request.get_json() or {}
    email = payload.get('email')
    password = payload.get('password')
    if not email or not password:
        raise ApiError('VALIDATION_ERROR', 'Informe e-mail e senha', status=422)
    token, user = AuthService.login(email, password)
    return success_response({'access_token': token, 'user': user})


@auth_bp.get('/me')
@jwt_required()
def me():
    """Retorna usuário autenticado
    ---
    tags:
      - Auth
    responses:
      200:
        description: Usuário atual
        schema:
          $ref: '#/definitions/UserResponse'
      401:
        description: Não autenticado
        schema:
          $ref: '#/definitions/Error'
    """
    user = AuthService.get_current_user()
    return success_response(user.to_dict())


@auth_bp.post('/logout')
@jwt_required()
def logout():
    """Logout (client-side token revoke)
    ---
    tags:
      - Auth
    responses:
      204:
        description: Logout efetuado
      401:
        description: Não autenticado
        schema:
          $ref: '#/definitions/Error'
    """
    AuthService.logout()
    return '', 204
