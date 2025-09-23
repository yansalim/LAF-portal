from flask import Blueprint, request

from ..models.user import UserRole
from ..schemas import UserSchema
from ..services import UserService
from ..utils.permissions import require_roles
from ..utils.responses import paginated_response, success_response

users_bp = Blueprint('users', __name__)
user_schema = UserSchema()
users_schema = UserSchema(many=True)


@users_bp.get('')
@require_roles(UserRole.ADMIN)
def list_users(current_user):  # noqa: ARG001
    """Lista usuários (admin)
    ---
    tags:
      - Users
    parameters:
      - in: query
        name: page
        type: integer
        default: 1
      - in: query
        name: page_size
        type: integer
        default: 20
      - in: query
        name: role
        type: string
      - in: query
        name: q
        type: string
        description: Busca por nome ou e-mail
    responses:
      200:
        description: Lista paginada de usuários
        schema:
          allOf:
            - $ref: '#/definitions/PaginatedResponse'
            - type: object
              properties:
                data:
                  $ref: '#/definitions/UserList'
      401:
        description: Não autenticado
        schema:
          $ref: '#/definitions/Error'
      403:
        description: Sem permissão
        schema:
          $ref: '#/definitions/Error'
    """
    page = int(request.args.get('page', 1))
    page_size = min(int(request.args.get('page_size', 20)), 100)
    role = request.args.get('role')
    query = request.args.get('q')
    items, total = UserService.list_users(page=page, page_size=page_size, role=role, query=query)
    return paginated_response(users_schema.dump(items), total, page, page_size)


@users_bp.post('')
@require_roles(UserRole.ADMIN)
def create_user(current_user):  # noqa: ARG001
    """Cria um novo usuário
    ---
    tags:
      - Users
    consumes:
      - application/json
    parameters:
      - in: body
        name: body
        schema:
          type: object
          required: [name, email, password, role]
          properties:
            name:
              type: string
            email:
              type: string
            password:
              type: string
            role:
              type: string
              enum: [admin, secretaria, tjd, editor]
            is_active:
              type: boolean
            allowed_category_slugs:
              type: array
              items: {type: string}
    responses:
      201:
        description: Usuário criado
        schema:
          $ref: '#/definitions/UserResponse'
      400:
        description: Erro de validação
        schema:
          $ref: '#/definitions/Error'
      409:
        description: Conflito (e-mail já existe)
        schema:
          $ref: '#/definitions/Error'
    """
    payload = request.get_json() or {}
    user = UserService.create_user(payload)
    return success_response(user_schema.dump(user), status=201)


@users_bp.get('/<user_id>')
@require_roles(UserRole.ADMIN)
def get_user(user_id: str, current_user):  # noqa: ARG001
    """Obtém detalhes de um usuário
    ---
    tags:
      - Users
    parameters:
      - in: path
        name: user_id
        required: true
        type: string
    responses:
      200:
        description: Usuário encontrado
        schema:
          $ref: '#/definitions/UserResponse'
      404:
        description: Usuário não encontrado
        schema:
          $ref: '#/definitions/Error'
    """
    user = UserService.get_user(user_id)
    return success_response(user_schema.dump(user))


@users_bp.put('/<user_id>')
@require_roles(UserRole.ADMIN)
def update_user(user_id: str, current_user):  # noqa: ARG001
    """Atualiza um usuário existente
    ---
    tags:
      - Users
    parameters:
      - in: path
        name: user_id
        required: true
        type: string
      - in: body
        name: body
        schema:
          type: object
          properties:
            name: {type: string}
            email: {type: string}
            password: {type: string}
            role:
              type: string
              enum: [admin, secretaria, tjd, editor]
            is_active: {type: boolean}
            allowed_category_slugs:
              type: array
              items: {type: string}
    responses:
      200:
        description: Usuário atualizado
        schema:
          $ref: '#/definitions/UserResponse'
      404:
        description: Usuário não encontrado
        schema:
          $ref: '#/definitions/Error'
    """
    payload = request.get_json() or {}
    user = UserService.update_user(user_id, payload)
    return success_response(user_schema.dump(user))


@users_bp.delete('/<user_id>')
@require_roles(UserRole.ADMIN)
def delete_user(user_id: str, current_user):  # noqa: ARG001
    """Remove um usuário
    ---
    tags:
      - Users
    parameters:
      - in: path
        name: user_id
        required: true
        type: string
    responses:
      204:
        description: Usuário removido
      404:
        description: Usuário não encontrado
        schema:
          $ref: '#/definitions/Error'
    """
    UserService.delete_user(user_id)
    return '', 204
