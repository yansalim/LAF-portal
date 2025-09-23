import os
from logging.config import fileConfig

from sqlalchemy import engine_from_config, pool
from alembic import context
from dotenv import load_dotenv

load_dotenv(dotenv_path=os.path.join(os.path.dirname(__file__), '..', '.env'))

# this is the Alembic Config object, which provides
# access to the values within the .ini file in use.
config = context.config

if config.config_file_name is not None:
    fileConfig(config.config_file_name)

from src.app_factory import create_app  # noqa
from src.extensions import db  # noqa


def _normalize_db_url(url: str | None) -> str:
    if not url:
        raise RuntimeError('DATABASE_URL must be configured for migrations')
    if url.startswith('mysql://'):
        return url.replace('mysql://', 'mysql+pymysql://', 1)
    return url


app = create_app()
app.app_context().push()

target_metadata = db.metadata


def get_database_url():
    return _normalize_db_url(os.getenv('DATABASE_URL'))


config.set_main_option('sqlalchemy.url', get_database_url())

def run_migrations_offline():
    url = config.get_main_option('sqlalchemy.url')
    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={'paramstyle': 'named'},
    )

    with context.begin_transaction():
        context.run_migrations()


def run_migrations_online():
    connectable = engine_from_config(
        config.get_section(config.config_ini_section, {}),
        prefix='sqlalchemy.',
        poolclass=pool.NullPool,
    )

    with connectable.connect() as connection:
        context.configure(connection=connection, target_metadata=target_metadata)

        with context.begin_transaction():
            context.run_migrations()


if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
