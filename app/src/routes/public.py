from flask import Blueprint, request

from ..models import Category
from ..schemas import CategorySchema, PostSchema
from ..services.post_service import PostService
from ..utils.responses import ApiError, paginated_response, success_response

public_bp = Blueprint('public', __name__)
category_schema = CategorySchema()
category_list_schema = CategorySchema(many=True)
post_schema = PostSchema()
post_list_schema = PostSchema(many=True)


@public_bp.get('/categories')
def public_categories():
    """Categorias públicas ativas
    ---
    tags:
      - Public
    responses:
      200:
        description: Lista de categorias ativas
        schema:
          $ref: '#/definitions/CategoryList'
    """
    categories = (
        Category.query.filter_by(is_active=True)
        .order_by(Category.name.asc())
        .all()
    )
    return success_response(category_list_schema.dump(categories))


@public_bp.get('/categories/<slug>')
def public_category_detail(slug: str):
    """Detalhe de categoria pública
    ---
    tags:
      - Public
    parameters:
      - in: path
        name: slug
        required: true
        type: string
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
    category = Category.query.filter_by(slug=slug, is_active=True).first()
    if not category:
        raise ApiError('NOT_FOUND', 'Categoria não encontrada', status=404)
    return success_response(category_schema.dump(category))


@public_bp.get('/feed')
def public_feed():
    """Feed público de posts publicados
    ---
    tags:
      - Public
    parameters:
      - in: query
        name: page
        type: integer
        default: 1
      - in: query
        name: page_size
        type: integer
        default: 12
      - in: query
        name: category
        type: string
        description: Slug da categoria
      - in: query
        name: q
        type: string
        description: Busca por título/resumo
      - in: query
        name: order
        type: string
        default: published_at:desc
    responses:
      200:
        description: Feed público
        schema:
          allOf:
            - $ref: '#/definitions/PaginatedResponse'
            - type: object
              properties:
                data:
                  $ref: '#/definitions/PostList'
    """
    page = int(request.args.get('page', 1))
    page_size = min(int(request.args.get('page_size', 12)), 50)
    category = request.args.get('category')
    query = request.args.get('q')
    order = request.args.get('order', 'published_at:desc')
    items, total = PostService.list_public_posts(
        page=page,
        page_size=page_size,
        category_slug=category,
        query=query,
        order=order,
    )
    return paginated_response(post_list_schema.dump(items), total, page, page_size)


@public_bp.get('/posts/<slug>')
def public_post(slug: str):
    """Obtém um post publicado pelo slug
    ---
    tags:
      - Public
    parameters:
      - in: path
        name: slug
        required: true
        type: string
    responses:
      200:
        description: Post disponível publicamente
        schema:
          $ref: '#/definitions/PostResponse'
      404:
        description: Post não encontrado ou não publicado
        schema:
          $ref: '#/definitions/Error'
    """
    post = PostService.get_public_post(slug)
    return success_response(post_schema.dump(post))
