from __future__ import annotations

from flasgger import Swagger
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from flask_sqlalchemy import SQLAlchemy


db = SQLAlchemy()
jwt = JWTManager()
cors = CORS()
swagger = Swagger()


__all__ = ['db', 'jwt', 'cors', 'swagger']
