from __future__ import annotations

from datetime import timedelta

from faker import Faker

from .app_factory import create_app
from .extensions import db
from .models import Category, Post, PostStatus, User, UserRole
from .utils.clock import utcnow

fake = Faker('pt_BR')

CATEGORIES = [
    ('Geral', 'geral', None, None),
    ('Assembleias', 'assembleias', None, None),
    ('Atas', 'atas', None, None),
    ('Comunicados TJD', 'tjd', None, ['tjd']),
]

USERS = [
    ('Ana Administradora', 'admin@organizacao.local', '123456', UserRole.ADMIN, None),
    ('Sergio Secretaria', 'secretaria@organizacao.local', '123456', UserRole.SECRETARIA, None),
    ('Teresa TJD', 'tjd@organizacao.local', '123456', UserRole.TJD, ['tjd']),
    ('Edu Editor', 'editor@organizacao.local', '123456', UserRole.EDITOR, ['geral', 'atas']),
]


def seed_categories():
    for name, slug, description, allowed_roles in CATEGORIES:
        category = Category.query.filter_by(slug=slug).first()
        if not category:
            category = Category(name=name, slug=slug, description=description, allowed_roles=allowed_roles)
            db.session.add(category)
    db.session.commit()


def seed_users():
    for name, email, password, role, allowed_slugs in USERS:
        user = User.query.filter_by(email=email).first()
        if not user:
            user = User(name=name, email=email, role=role, allowed_category_slugs=allowed_slugs)
            user.set_password(password)
            db.session.add(user)
    db.session.commit()


def seed_posts():
    if Post.query.count() > 0:
        return

    categories = {category.slug: category for category in Category.query.all()}
    users = {user.email: user for user in User.query.all()}

    samples = [
        {
            'title': 'Assembleia Geral Extraordinária',
            'slug': 'assembleia-geral-extraordinaria',
            'excerpt': 'Convocação para Assembleia Geral Extraordinária do próximo mês.',
            'category': categories.get('assembleias'),
            'author': users.get('secretaria@organizacao.local'),
            'status': PostStatus.PUBLISHED,
            'published_at': utcnow() - timedelta(days=2),
        },
        {
            'title': 'Boletim Geral Semanal',
            'slug': 'boletim-geral-semanal',
            'excerpt': 'Resumo das principais atividades.',
            'category': categories.get('geral'),
            'author': users.get('secretaria@organizacao.local'),
            'status': PostStatus.PUBLISHED,
            'published_at': utcnow() - timedelta(days=5),
        },
        {
            'title': 'Comunicado TJD - Suspensão Preventiva',
            'slug': 'comunicado-tjd-suspensao-preventiva',
            'excerpt': 'TJD informa suspensão preventiva de atleta até julgamento.',
            'category': categories.get('tjd'),
            'author': users.get('tjd@organizacao.local'),
            'status': PostStatus.PUBLISHED,
            'published_at': utcnow() - timedelta(days=1),
        },
        {
            'title': 'Planejamento estratégico 2025',
            'slug': 'planejamento-estrategico-2025',
            'excerpt': 'Documento em elaboração com diretrizes para 2025.',
            'category': categories.get('geral'),
            'author': users.get('admin@organizacao.local'),
            'status': PostStatus.DRAFT,
            'published_at': None,
        },
    ]

    for sample in samples:
        if not sample['category'] or not sample['author']:
            continue
        post = Post(
            title=sample['title'],
            slug=sample['slug'],
            excerpt=sample['excerpt'],
            content_markdown=fake.paragraph(nb_sentences=6),
            category=sample['category'],
            author=sample['author'],
            status=sample['status'],
            published_at=sample['published_at'],
        )
        db.session.add(post)

    db.session.commit()


def main():
    app = create_app()
    with app.app_context():
        seed_categories()
        seed_users()
        seed_posts()
        print('Database seeded successfully.')


if __name__ == '__main__':
    main()
