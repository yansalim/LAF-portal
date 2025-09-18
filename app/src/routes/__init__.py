from flask import Flask

from .auth import auth_bp
from .categories import categories_bp
from .health import health_bp
from .posts import posts_bp
from .public import public_bp
from .uploads import uploads_bp
from .users import users_bp


def register_routes(app: Flask) -> None:
    app.register_blueprint(health_bp, url_prefix='/api/v1')
    app.register_blueprint(auth_bp, url_prefix='/api/v1/auth')
    app.register_blueprint(users_bp, url_prefix='/api/v1/users')
    app.register_blueprint(categories_bp, url_prefix='/api/v1/categories')
    app.register_blueprint(posts_bp, url_prefix='/api/v1/posts')
    app.register_blueprint(public_bp, url_prefix='/api/v1/public')
    app.register_blueprint(uploads_bp, url_prefix='/api/v1/uploads')


__all__ = ['register_routes']
