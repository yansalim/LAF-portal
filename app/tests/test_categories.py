from http import HTTPStatus

from src.models import UserRole


def login(client, email, password):
    response = client.post('/api/v1/auth/login', json={'email': email, 'password': password})
    return response.get_json()['data']['access_token']


def test_admin_can_create_category(client, seed_data):
    token = login(client, 'admin@example.com', 'password')
    response = client.post(
        '/api/v1/categories/',
        headers={'Authorization': f'Bearer {token}'},
        json={'name': 'Noticias', 'slug': 'noticias', 'is_active': True},
    )
    assert response.status_code == HTTPStatus.CREATED
    data = response.get_json()['data']
    assert data['slug'] == 'noticias'


def test_editor_list_categories_active_only(client, seed_data):
    token = login(client, 'editor@example.com', 'password')
    response = client.get('/api/v1/categories/', headers={'Authorization': f'Bearer {token}'})
    assert response.status_code == HTTPStatus.OK
    data = response.get_json()
    assert data['total'] >= 1
    for category in data['data']:
        assert category['is_active'] is True


def test_delete_category_requires_admin(client, seed_data):
    admin_token = login(client, 'admin@example.com', 'password')
    categories_resp = client.get('/api/v1/categories/', headers={'Authorization': f'Bearer {admin_token}'})
    category_id = categories_resp.get_json()['data'][0]['id']

    editor_token = login(client, 'editor@example.com', 'password')
    response = client.delete(f'/api/v1/categories/{category_id}', headers={'Authorization': f'Bearer {editor_token}'})
    assert response.status_code == HTTPStatus.FORBIDDEN
