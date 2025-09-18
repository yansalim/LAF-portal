from __future__ import annotations

from typing import Any, Dict


def _cfg(config, key: str, default: Any = None) -> Any:
    if hasattr(config, 'get'):
        return config.get(key, default)
    return getattr(config, key, default)


def build_template(config) -> Dict[str, Any]:
    server_url = f"http://localhost:{_cfg(config, 'APP_PORT', 8000)}"
    title = _cfg(config, 'SWAGGER_TITLE', 'LAF Portal API')
    description = _cfg(config, 'SWAGGER_DESC', 'REST API for public website and admin portal')
    version = _cfg(config, 'SWAGGER_VERSION', '1.0.0')
    return {
        'swagger': '2.0',
        'info': {
            'title': title,
            'description': description,
            'version': version,
        },
        'basePath': '/api/v1',
        'schemes': ['http'],
        'tags': [
            {'name': 'Health', 'description': 'Health check endpoints'},
            {'name': 'Auth', 'description': 'Authentication endpoints'},
            {'name': 'Users', 'description': 'User management'},
            {'name': 'Categories', 'description': 'Category management'},
            {'name': 'Posts', 'description': 'Post management'},
            {'name': 'Public', 'description': 'Public content feed'},
            {'name': 'Uploads', 'description': 'Upload assets'},
        ],
        'servers': [
            {'url': server_url, 'description': 'Local server'},
        ],
        'definitions': {
            'Error': {
                'type': 'object',
                'properties': {
                    'error': {
                        'type': 'object',
                        'properties': {
                            'code': {'type': 'string'},
                            'message': {'type': 'string'},
                            'details': {'type': 'object'},
                        },
                    }
                },
            },
            'User': {
                'type': 'object',
                'properties': {
                    'id': {'type': 'string'},
                    'name': {'type': 'string'},
                    'email': {'type': 'string'},
                    'role': {'type': 'string', 'enum': ['admin', 'secretaria', 'tjd', 'editor']},
                    'is_active': {'type': 'boolean'},
                    'allowed_category_slugs': {
                        'type': 'array',
                        'items': {'type': 'string'},
                    },
                    'created_at': {'type': 'string'},
                    'updated_at': {'type': 'string'},
                },
            },
            'UserList': {
                'type': 'array',
                'items': {'$ref': '#/definitions/User'},
            },
            'Category': {
                'type': 'object',
                'properties': {
                    'id': {'type': 'string'},
                    'name': {'type': 'string'},
                    'slug': {'type': 'string'},
                    'description': {'type': 'string'},
                    'is_active': {'type': 'boolean'},
                    'allowed_roles': {
                        'type': 'array',
                        'items': {'type': 'string'},
                    },
                    'created_at': {'type': 'string'},
                    'updated_at': {'type': 'string'},
                },
            },
            'CategoryList': {
                'type': 'array',
                'items': {'$ref': '#/definitions/Category'},
            },
            'Post': {
                'type': 'object',
                'properties': {
                    'id': {'type': 'string'},
                    'slug': {'type': 'string'},
                    'title': {'type': 'string'},
                    'excerpt': {'type': 'string'},
                    'cover_image_url': {'type': 'string'},
                    'content_markdown': {'type': 'string'},
                    'status': {
                        'type': 'string',
                        'enum': ['DRAFT', 'PUBLISHED', 'SCHEDULED'],
                    },
                    'category': {'$ref': '#/definitions/Category'},
                    'author': {'$ref': '#/definitions/User'},
                    'published_at': {'type': 'string'},
                    'created_at': {'type': 'string'},
                    'updated_at': {'type': 'string'},
                },
            },
            'PostList': {
                'type': 'array',
                'items': {'$ref': '#/definitions/Post'},
            },
            'PaginatedResponse': {
                'type': 'object',
                'properties': {
                    'data': {'type': 'array', 'items': {'type': 'object'}},
                    'page': {'type': 'integer'},
                    'page_size': {'type': 'integer'},
                    'total': {'type': 'integer'},
                },
            },
            'AuthLoginResponse': {
                'type': 'object',
                'properties': {
                    'data': {
                        'type': 'object',
                        'properties': {
                            'access_token': {'type': 'string'},
                            'user': {'$ref': '#/definitions/User'},
                        },
                    }
                },
            },
            'StandardResponse': {
                'type': 'object',
                'properties': {
                    'data': {'type': 'object'},
                },
            },
            'UserResponse': {
                'type': 'object',
                'properties': {
                    'data': {'$ref': '#/definitions/User'},
                },
            },
            'CategoryResponse': {
                'type': 'object',
                'properties': {
                    'data': {'$ref': '#/definitions/Category'},
                },
            },
            'PostResponse': {
                'type': 'object',
                'properties': {
                    'data': {'$ref': '#/definitions/Post'},
                },
            },
        },
    }
