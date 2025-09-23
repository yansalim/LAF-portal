from __future__ import annotations

import os
from dataclasses import dataclass, field
from datetime import timedelta
from typing import List

from dotenv import load_dotenv

BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
ENV_PATH = os.path.join(BASE_DIR, '.env')
load_dotenv(ENV_PATH)


def _split_csv(value: str | None) -> List[str]:
    if not value:
        return []
    return [item.strip() for item in value.split(',') if item.strip()]


def _normalize_db_url(url: str | None) -> str:
    if not url:
        return ''
    if url.startswith('mysql://'):
        return url.replace('mysql://', 'mysql+pymysql://', 1)
    return url


@dataclass
class Config:
    APP_NAME: str = os.getenv('APP_NAME', 'LAF Portal API')
    FLASK_ENV: str = os.getenv('FLASK_ENV', 'development')
    APP_PORT: int = int(os.getenv('APP_PORT', '8000'))
    JWT_SECRET: str = os.getenv('JWT_SECRET', 'change-me')
    ACCESS_TOKEN_EXPIRES_MIN: int = int(os.getenv('ACCESS_TOKEN_EXPIRES_MIN', '120'))
    CORS_ORIGINS: List[str] = field(default_factory=lambda: _split_csv(os.getenv('CORS_ORIGINS', 'http://localhost:5173')))
    SWAGGER_TITLE: str = os.getenv('SWAGGER_TITLE', 'LAF Portal API')
    SWAGGER_DESC: str = os.getenv('SWAGGER_DESC', 'REST API for public website and admin portal')
    SWAGGER_VERSION: str = os.getenv('SWAGGER_VERSION', '1.0.0')
    TZ: str = os.getenv('TZ', 'America/Sao_Paulo')

    SQLALCHEMY_DATABASE_URI: str = _normalize_db_url(
        os.getenv('DATABASE_URL', 'mysql+pymysql://root:pass@localhost:3306/laf_portal')
    )
    SQLALCHEMY_ENGINE_OPTIONS: dict = field(default_factory=lambda: {'pool_pre_ping': True})
    SQLALCHEMY_TRACK_MODIFICATIONS: bool = False

    UPLOAD_FOLDER: str = os.path.join(BASE_DIR, 'uploads')

    JWT_SECRET_KEY: str = JWT_SECRET
    JWT_ACCESS_TOKEN_EXPIRES: timedelta = field(init=False)

    SWAGGER_CONFIG: dict = field(default_factory=dict)

    def __post_init__(self) -> None:
        self.JWT_ACCESS_TOKEN_EXPIRES = timedelta(minutes=self.ACCESS_TOKEN_EXPIRES_MIN)
        self.SWAGGER_CONFIG = {
            'title': self.SWAGGER_TITLE,
            'version': self.SWAGGER_VERSION,
            'description': self.SWAGGER_DESC,
        }


def get_config() -> Config:
    return Config()
