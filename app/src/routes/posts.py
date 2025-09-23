from datetime import datetime

from flask import Blueprint, request

from ..schemas import PostSchema
from ..services import PostService
from ..utils.permissions import require_authenticated
from ..utils.responses import ApiError, paginated_response, success_response

posts_bp = Blueprint('posts', __name__)
post_schema = PostSchema()
posts_schema = PostSchema(many=True)


@posts_bp.get('')
@require_authenticated
def list_posts(current_user):
    """Lista posts com filtros e paginação
    ---
    tags:
      - Posts
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
        name: status
        type: string
        enum: [DRAFT, PUBLISHED, SCHEDULED]
      - in: query
        name: category
        type: string
        description: ID ou slug da categoria
      - in: query
        name: author
        type: string
      - in: query
        name: q
        type: string
        description: Busca em título, resumo ou categoria
      - in: query
        name: order
        type: string
        description: Campos `created_at` ou `published_at` com `:asc|desc`
    responses:
      200:
        description: Lista paginada
        schema:
          allOf:
            - $ref: '#/definitions/PaginatedResponse'
            - type: object
              properties:
                data:
                  $ref: '#/definitions/PostList'
      401:
        description: Não autenticado
        schema:
          $ref: '#/definitions/Error'
    """
    page = int(request.args.get('page', 1))
    page_size = min(int(request.args.get('page_size', 20)), 100)
    status = request.args.get('status')
    category = request.args.get('category')
    author = request.args.get('author')
    query = request.args.get('q')
    order = request.args.get('order')
    items, total = PostService.list_posts(
        requesting_user=current_user,
        page=page,
        page_size=page_size,
        status=status,
        category=category,
        author=author,
        query=query,
        order=order,
    )
    return paginated_response(posts_schema.dump(items), total, page, page_size)


@posts_bp.post('')
@require_authenticated
def create_post(current_user):
    """Cria um post
    ---
    tags:
      - Posts
    consumes:
      - application/json
    parameters:
      - in: body
        name: body
        schema:
          type: object
          required: [slug, title, content_markdown, category_id, author_id]
          properties:
            slug: {type: string}
            title: {type: string}
            excerpt: {type: string}
            cover_image_url: {type: string}
            content_markdown: {type: string}
            status:
              type: string
              enum: [DRAFT, PUBLISHED, SCHEDULED]
            category_id: {type: string}
            author_id: {type: string}
            published_at: {type: string, format: date-time}
    responses:
      201:
        description: Post criado
        schema:
          $ref: '#/definitions/PostResponse'
      403:
        description: Sem permissão para a categoria
        schema:
          $ref: '#/definitions/Error'
      404:
        description: Categoria ou autor não encontrado
        schema:
          $ref: '#/definitions/Error'
    """
    payload = request.get_json() or {}
    post = PostService.create_post(payload, requesting_user=current_user)
    return success_response(post_schema.dump(post), status=201)


@posts_bp.get('/<identifier>')
@require_authenticated
def get_post(identifier: str, current_user):
    """Obtém um post por ID ou slug
    ---
    tags:
      - Posts
    parameters:
      - in: path
        name: identifier
        required: true
        type: string
        description: ID ou slug do post
    responses:
      200:
        description: Post encontrado
        schema:
          $ref: '#/definitions/PostResponse'
      404:
        description: Post não encontrado
        schema:
          $ref: '#/definitions/Error'
    """
    post = PostService.get_post(identifier, requesting_user=current_user)
    return success_response(post_schema.dump(post))


@posts_bp.put('/<post_id>')
@require_authenticated
def update_post(post_id: str, current_user):
    """Atualiza um post
    ---
    tags:
      - Posts
    parameters:
      - in: path
        name: post_id
        required: true
        type: string
      - in: body
        name: body
        schema:
          type: object
          properties:
            slug: {type: string}
            title: {type: string}
            excerpt: {type: string}
            cover_image_url: {type: string}
            content_markdown: {type: string}
            status:
              type: string
              enum: [DRAFT, PUBLISHED, SCHEDULED]
            category_id: {type: string}
            author_id: {type: string}
            published_at: {type: string, format: date-time}
    responses:
      200:
        description: Post atualizado
        schema:
          $ref: '#/definitions/PostResponse'
      404:
        description: Post não encontrado
        schema:
          $ref: '#/definitions/Error'
    """
    payload = request.get_json() or {}
    post = PostService.update_post(post_id, payload, requesting_user=current_user)
    return success_response(post_schema.dump(post))


@posts_bp.delete('/<post_id>')
@require_authenticated
def delete_post(post_id: str, current_user):
    """Remove um post
    ---
    tags:
      - Posts
    parameters:
      - in: path
        name: post_id
        required: true
        type: string
    responses:
      204:
        description: Post removido
      404:
        description: Post não encontrado
        schema:
          $ref: '#/definitions/Error'
    """
    PostService.delete_post(post_id, requesting_user=current_user)
    return '', 204


@posts_bp.post('/<post_id>/publish')
@require_authenticated
def publish_post(post_id: str, current_user):
    """Publica um post imediatamente
    ---
    tags:
      - Posts
    parameters:
      - in: path
        name: post_id
        required: true
        type: string
    responses:
      200:
        description: Post publicado
        schema:
          $ref: '#/definitions/PostResponse'
      404:
        description: Post não encontrado
        schema:
          $ref: '#/definitions/Error'
    """
    post = PostService.publish_post(post_id, requesting_user=current_user)
    return success_response(post_schema.dump(post))


@posts_bp.post('/<post_id>/schedule')
@require_authenticated
def schedule_post(post_id: str, current_user):
    """Agenda a publicação de um post
    ---
    tags:
      - Posts
    consumes:
      - application/json
    parameters:
      - in: path
        name: post_id
        required: true
        type: string
      - in: body
        name: body
        schema:
          type: object
          required: [published_at]
          properties:
            published_at:
              type: string
              format: date-time
    responses:
      200:
        description: Post agendado
        schema:
          $ref: '#/definitions/PostResponse'
      404:
        description: Post não encontrado
        schema:
          $ref: '#/definitions/Error'
      422:
        description: Dados inválidos
        schema:
          $ref: '#/definitions/Error'
    """
    payload = request.get_json() or {}
    published_at_raw = payload.get('published_at')
    if not published_at_raw:
        raise ApiError('VALIDATION_ERROR', 'Informe published_at', status=422)
    published_at = datetime.fromisoformat(published_at_raw)
    post = PostService.schedule_post(post_id, requesting_user=current_user, published_at=published_at)
    return success_response(post_schema.dump(post))
