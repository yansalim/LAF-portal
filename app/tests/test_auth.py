from http import HTTPStatus

from src.extensions import db
from src.models import User, UserRole


def create_user(email: str, password: str):
    user = User(name='Tester', email=email, role=UserRole.ADMIN)
    user.set_password(password)
    db.session.add(user)
    db.session.commit()
    return user


def test_login_success(client, app):
    with app.app_context():
        create_user('login@example.com', '123456')
    response = client.post('/api/v1/auth/login', json={'email': 'login@example.com', 'password': '123456'})
    data = response.get_json()
    assert response.status_code == HTTPStatus.OK
    assert 'access_token' in data['data']
    assert data['data']['user']['email'] == 'login@example.com'


def test_login_invalid_credentials(client, app):
    with app.app_context():
        create_user('invalid@example.com', '123456')
    response = client.post('/api/v1/auth/login', json={'email': 'invalid@example.com', 'password': 'wrong'})
    assert response.status_code == HTTPStatus.UNAUTHORIZED


def test_me_requires_token(client):
    response = client.get('/api/v1/auth/me')
    assert response.status_code == HTTPStatus.UNAUTHORIZED


def test_me_success(client, app):
    with app.app_context():
        create_user('me@example.com', '123456')
    login = client.post('/api/v1/auth/login', json={'email': 'me@example.com', 'password': '123456'})
    token = login.get_json()['data']['access_token']
    response = client.get('/api/v1/auth/me', headers={'Authorization': f'Bearer {token}'})
    assert response.status_code == HTTPStatus.OK
    data = response.get_json()['data']
    assert data['email'] == 'me@example.com'
