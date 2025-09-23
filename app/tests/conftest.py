import os

import sqlalchemy as sa
from sqlalchemy.engine import make_url

import pytest

from src.app_factory import create_app
from src.extensions import db
from src.models import Category, Post, PostStatus, User, UserRole


def _build_test_database_url() -> str:
    base_url = os.getenv('TEST_DATABASE_URL') or os.getenv('DATABASE_URL', 'mysql+pymysql://root:pass@localhost:3306/laf_portal')
    url = make_url(base_url)
    test_db_name = f"{url.database or 'laf_portal'}_test"
    admin_url = url.set(database=None)

    admin_engine = sa.create_engine(admin_url, isolation_level='AUTOCOMMIT', future=True)
    drop_sql = sa.text(f"DROP DATABASE IF EXISTS `{test_db_name}`")
    create_sql = sa.text(
        f"CREATE DATABASE `{test_db_name}` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci"
    )
    with admin_engine.connect() as conn:
        conn.execute(drop_sql)
        conn.execute(create_sql)
    admin_engine.dispose()

    return str(url.set(database=test_db_name))


@pytest.fixture(scope='session')
def app():
    test_database_url = _build_test_database_url()
    os.environ['DATABASE_URL'] = test_database_url
    os.environ['JWT_SECRET'] = 'test-secret'

    application = create_app(testing=True)
    with application.app_context():
        db.create_all()
        yield application
        db.session.remove()
        db.drop_all()

    url = make_url(test_database_url)
    admin_engine = sa.create_engine(url.set(database=None), isolation_level='AUTOCOMMIT', future=True)
    with admin_engine.connect() as conn:
        conn.execute(sa.text(f"DROP DATABASE IF EXISTS `{url.database}`"))
    admin_engine.dispose()


@pytest.fixture
def client(app):
    return app.test_client()


@pytest.fixture
def runner(app):
    return app.test_cli_runner()


@pytest.fixture
def seed_data(app):
    with app.app_context():
        admin = User(name='Admin', email='admin@example.com', role=UserRole.ADMIN)
        admin.set_password('password')
        editor = User(name='Editor', email='editor@example.com', role=UserRole.EDITOR, allowed_category_slugs=['geral'])
        editor.set_password('password')
        categoria = Category(name='Geral', slug='geral')
        db.session.add_all([admin, editor, categoria])
        db.session.commit()

        post = Post(
            title='Post publicado',
            slug='post-publicado',
            excerpt='Resumo',
            content_markdown='Conteúdo',
            status=PostStatus.PUBLISHED,
            category_id=categoria.id,
            author_id=admin.id,
        )
        db.session.add(post)
        db.session.commit()

        yield {'admin': admin, 'editor': editor, 'category': categoria, 'post': post}

        db.session.query(Post).delete()
        db.session.query(Category).delete()
        db.session.query(User).delete()
        db.session.commit()
