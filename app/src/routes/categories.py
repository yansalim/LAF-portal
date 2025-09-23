from flask import Blueprint, request

from ..models.user import UserRole
from ..schemas import CategorySchema
from ..services import CategoryService
from ..utils.permissions import require_authenticated, require_roles
from ..utils.responses import ApiError, paginated_response, success_response

categories_bp = Blueprint('categories', __name__)
category_schema = CategorySchema()
category_list_schema = CategorySchema(many=True)


@categories_bp.get('')
@require_authenticated
def list_categories(current_user):
    """Lista paginada de categorias
    ---
    tags:
      - Categories
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
        name: q
        type: string
        description: Busca por nome ou slug
      - in: query
        name: active
        type: boolean
        description: Filtra apenas categorias ativas (`true`)
    responses:
      200:
        description: Lista paginada
        schema:
          allOf:
            - $ref: '#/definitions/PaginatedResponse'
            - type: object
              properties:
                data:
                  $ref: '#/definitions/CategoryList'
      401:
        description: Não autenticado
        schema:
          $ref: '#/definitions/Error'
    """
    page = int(request.args.get('page', 1))
    page_size = min(int(request.args.get('page_size', 20)), 100)
    query = request.args.get('q')
    active_param = request.args.get('active')
    include_inactive = current_user.role in {UserRole.ADMIN, UserRole.SECRETARIA}
    if active_param is not None:
        include_inactive = active_param.lower() not in {'true', '1', 'yes'}
    items, total = CategoryService.list_categories(
        page=page,
        page_size=page_size,
        include_inactive=include_inactive,
        query=query,
    )
    return paginated_response(category_list_schema.dump(items), total, page, page_size)


@categories_bp.post('')
@require_roles(UserRole.ADMIN, UserRole.SECRETARIA, UserRole.EDITOR)
def create_category(current_user):  # noqa: ARG001
    """Cria uma categoria
    ---
    tags:
      - Categories
    consumes:
      - application/json
    parameters:
      - in: body
        name: body
        schema:
          type: object
          required: [name, slug]
          properties:
            name: {type: string}
            slug: {type: string}
            description: {type: string}
            is_active: {type: boolean}
            allowed_roles:
              type: array
              items: {type: string}
    responses:
      201:
        description: Categoria criada
        schema:
          $ref: '#/definitions/CategoryResponse'
      409:
        description: Nome ou slug em uso
        schema:
          $ref: '#/definitions/Error'
    """
    payload = request.get_json() or {}
    category = CategoryService.create_category(payload)
    return success_response(category_schema.dump(category), status=201)


@categories_bp.get('/<identifier>')
@require_authenticated
def get_category(identifier: str, current_user):  # noqa: ARG001
    """Detalhes de uma categoria
    ---
    tags:
      - Categories
    parameters:
      - in: path
        name: identifier
        required: true
        type: string
        description: ID ou slug
    responses:
      200:
        description: Categoria encontrada
        schema:
          $ref: '#/definitions/CategoryResponse'
      404:
        description: Categoria não encontrada
        schema:
          $ref: '#/definitions/Error'
    """
    category = CategoryService.get_category(identifier)
    if category.is_active or current_user.role in {UserRole.ADMIN, UserRole.SECRETARIA}:
        return success_response(category_schema.dump(category))
    raise ApiError('NOT_FOUND', 'Categoria não encontrada', status=404)


@categories_bp.put('/<category_id>')
@require_roles(UserRole.ADMIN, UserRole.SECRETARIA, UserRole.EDITOR)
def update_category(category_id: str, current_user):  # noqa: ARG001
    """Atualiza uma categoria
    ---
    tags:
      - Categories
    parameters:
      - in: path
        name: category_id
        required: true
        type: string
      - in: body
        name: body
        schema:
          type: object
          properties:
            name: {type: string}
            slug: {type: string}
            description: {type: string}
            is_active: {type: boolean}
            allowed_roles:
              type: array
              items: {type: string}
    responses:
      200:
        description: Categoria atualizada
        schema:
          $ref: '#/definitions/CategoryResponse'
      404:
        description: Categoria não encontrada
        schema:
          $ref: '#/definitions/Error'
    """
    payload = request.get_json() or {}
    category = CategoryService.update_category(category_id, payload)
    return success_response(category_schema.dump(category))


@categories_bp.delete('/<category_id>')
@require_roles(UserRole.ADMIN, UserRole.SECRETARIA, UserRole.EDITOR)
def delete_category(category_id: str, current_user):  # noqa: ARG001
    """Remove uma categoria
    ---
    tags:
      - Categories
    parameters:
      - in: path
        name: category_id
        required: true
        type: string
    responses:
      204:
        description: Categoria removida
      404:
        description: Categoria não encontrada
        schema:
          $ref: '#/definitions/Error'
      409:
        description: Categoria possui posts associados
        schema:
          $ref: '#/definitions/Error'
    """
    CategoryService.delete_category(category_id)
    return '', 204
