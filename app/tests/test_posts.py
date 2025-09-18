from http import HTTPStatus

from src.extensions import db
from src.models import Category, Post, PostStatus, User, UserRole

from .test_categories import login


def test_admin_can_create_post(client, seed_data):
    token = login(client, 'admin@example.com', 'password')
    category_id = seed_data['category'].id
    admin_id = seed_data['admin'].id
    response = client.post(
        '/api/v1/posts/',
        headers={'Authorization': f'Bearer {token}'},
        json={
            'slug': 'novo-post-admin',
            'title': 'Novo Post Admin',
            'excerpt': 'Resumo',
            'content_markdown': 'Conteúdo',
            'category_id': category_id,
            'author_id': admin_id,
            'status': 'DRAFT',
        },
    )
    assert response.status_code == HTTPStatus.CREATED
    data = response.get_json()['data']
    assert data['slug'] == 'novo-post-admin'


def test_editor_cannot_create_in_other_category(client, seed_data, app):
    with app.app_context():
        outra_categoria = Category(name='Atas', slug='atas')
        db.session.add(outra_categoria)
        db.session.commit()
        outra_categoria_id = outra_categoria.id
    token = login(client, 'editor@example.com', 'password')
    response = client.post(
        '/api/v1/posts/',
        headers={'Authorization': f'Bearer {token}'},
        json={
            'slug': 'post-editor-proibido',
            'title': 'Post restrito',
            'excerpt': 'Resumo',
            'content_markdown': 'Conteúdo',
            'category_id': outra_categoria_id,
            'author_id': seed_data['editor'].id,
            'status': 'DRAFT',
        },
    )
    assert response.status_code == HTTPStatus.FORBIDDEN


def test_public_feed_returns_published(client, seed_data):
    response = client.get('/api/v1/public/feed')
    assert response.status_code == HTTPStatus.OK
    data = response.get_json()
    assert data['total'] >= 1
    for post in data['data']:
        assert post['status'] == PostStatus.PUBLISHED.value
