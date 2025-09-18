from __future__ import annotations

import logging
from logging import StreamHandler

from flask import send_from_directory

from flask import Flask, jsonify

from .config import get_config
from .docs.swagger import build_template
from .extensions import cors, db, jwt, swagger
from .routes import register_routes
from .utils.responses import ApiError


def create_app(testing: bool = False) -> Flask:
    app = Flask(__name__)
    config = get_config()
    app.config.from_object(config)

    if testing:
        app.config['TESTING'] = True

    app.config['UPLOAD_FOLDER'] = config.UPLOAD_FOLDER
    import os

    os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)

    configure_logging(app)
    register_extensions(app)
    register_error_handlers(app)
    register_routes(app)

    @app.route('/static/uploads/<path:filename>')
    def serve_upload(filename):
        return send_from_directory(app.config['UPLOAD_FOLDER'], filename)

    return app


def configure_logging(app: Flask) -> None:
    if app.logger.handlers:
        return
    handler = StreamHandler()
    handler.setLevel(logging.INFO)
    app.logger.setLevel(logging.INFO)
    app.logger.addHandler(handler)


def register_extensions(app: Flask) -> None:
    db.init_app(app)
    cors.init_app(app, resources={r"/api/*": {'origins': app.config.get('CORS_ORIGINS', ['*'])}})
    jwt.init_app(app)

    @jwt.unauthorized_loader
    def unauthorized_callback(reason):  # noqa: D401
        return {'error': {'code': 'UNAUTHORIZED', 'message': reason}}, 401

    @jwt.invalid_token_loader
    def invalid_token_callback(reason):  # noqa: D401
        return {'error': {'code': 'UNAUTHORIZED', 'message': reason}}, 401

    @jwt.expired_token_loader
    def expired_token_callback(jwt_header, jwt_data):  # noqa: D401,ARG001
        return {'error': {'code': 'TOKEN_EXPIRED', 'message': 'Token expirado'}}, 401

    swagger_template = build_template(app.config)
    app.config['SWAGGER'] = {
        'uiversion': 3,
        'title': app.config['SWAGGER_TITLE'],
        'description': app.config['SWAGGER_DESC'],
        'specs_route': '/docs',
    }
    swagger.init_app(app)
    swagger.template = swagger_template


def register_error_handlers(app: Flask) -> None:
    @app.errorhandler(ApiError)
    def handle_api_error(error: ApiError):
        return jsonify(error.to_response()), error.status

    @app.errorhandler(404)
    def handle_not_found(_):
        return jsonify({'error': {'code': 'NOT_FOUND', 'message': 'Recurso não encontrado'}}), 404

    @app.errorhandler(401)
    def handle_unauthorized(_):
        return jsonify({'error': {'code': 'UNAUTHORIZED', 'message': 'Credenciais inválidas'}}), 401

    @app.errorhandler(Exception)
    def handle_generic_error(error: Exception):
        app.logger.exception('Unhandled exception: %s', error)
        return (
            jsonify({'error': {'code': 'INTERNAL_ERROR', 'message': 'Erro interno do servidor'}}),
            500,
        )


__all__ = ['create_app']
