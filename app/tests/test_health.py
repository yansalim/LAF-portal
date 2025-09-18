from http import HTTPStatus


def test_health_endpoint(client):
    response = client.get('/api/v1/health')
    assert response.status_code == HTTPStatus.OK
    assert response.get_json() == {'status': 'ok'}
