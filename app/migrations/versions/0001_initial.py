"""initial schema

Revision ID: 0001_initial
Revises: 
Create Date: 2025-09-18 20:15:00.000000
"""

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '0001_initial'
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    user_role_enum = sa.Enum('admin', 'secretaria', 'tjd', 'editor', name='userrole')
    post_status_enum = sa.Enum('DRAFT', 'PUBLISHED', 'SCHEDULED', name='poststatus')

    op.create_table(
        'users',
        sa.Column('id', sa.String(length=36), primary_key=True),
        sa.Column('name', sa.String(length=120), nullable=False),
        sa.Column('email', sa.String(length=255), nullable=False, unique=True),
        sa.Column('password_hash', sa.String(length=255), nullable=False),
        sa.Column('role', user_role_enum, nullable=False),
        sa.Column('is_active', sa.Boolean(), nullable=False, server_default=sa.true()),
        sa.Column('allowed_category_slugs', sa.JSON(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False),
    )
    op.create_index('ix_users_email', 'users', ['email'], unique=True)

    op.create_table(
        'categories',
        sa.Column('id', sa.String(length=36), primary_key=True),
        sa.Column('name', sa.String(length=120), nullable=False, unique=True),
        sa.Column('slug', sa.String(length=150), nullable=False, unique=True),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('is_active', sa.Boolean(), nullable=False, server_default=sa.true()),
        sa.Column('allowed_roles', sa.JSON(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False),
    )
    op.create_index('ix_categories_slug', 'categories', ['slug'], unique=True)

    op.create_table(
        'posts',
        sa.Column('id', sa.String(length=36), primary_key=True),
        sa.Column('slug', sa.String(length=160), nullable=False, unique=True),
        sa.Column('title', sa.String(length=255), nullable=False),
        sa.Column('excerpt', sa.String(length=500), nullable=True),
        sa.Column('cover_image_url', sa.String(length=500), nullable=True),
        sa.Column('content_markdown', sa.Text(), nullable=False),
        sa.Column('status', post_status_enum, nullable=False, server_default='DRAFT'),
        sa.Column('category_id', sa.String(length=36), sa.ForeignKey('categories.id'), nullable=False),
        sa.Column('author_id', sa.String(length=36), sa.ForeignKey('users.id'), nullable=False),
        sa.Column('published_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False),
    )
    op.create_index('ix_posts_slug', 'posts', ['slug'], unique=True)
    op.create_index('ix_posts_status', 'posts', ['status'], unique=False)
    op.create_index('ix_posts_published_at', 'posts', ['published_at'], unique=False)
    op.create_index('ix_posts_category_id', 'posts', ['category_id'], unique=False)
    op.create_index('ix_posts_author_id', 'posts', ['author_id'], unique=False)


def downgrade() -> None:
    op.drop_index('ix_posts_author_id', table_name='posts')
    op.drop_index('ix_posts_category_id', table_name='posts')
    op.drop_index('ix_posts_published_at', table_name='posts')
    op.drop_index('ix_posts_status', table_name='posts')
    op.drop_index('ix_posts_slug', table_name='posts')
    op.drop_table('posts')

    op.drop_index('ix_categories_slug', table_name='categories')
    op.drop_table('categories')

    op.drop_index('ix_users_email', table_name='users')
    op.drop_table('users')

    op.execute('DROP TYPE IF EXISTS poststatus')
    op.execute('DROP TYPE IF EXISTS userrole')
