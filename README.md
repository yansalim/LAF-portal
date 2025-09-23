# LAF Portal Monorepo

Portal completo composto por **API Flask** e **SPA React**. O objetivo é oferecer um CMS leve para publicações, com autenticação JWT, RBAC por papéis e gerenciamento de conteúdos com MySQL.

## Sumário rápido
- [Arquitetura](#arquitetura)
- [Dependências principais](#dependências-principais)
- [Stacks por diretório](#stacks-por-diretório)
- [Rotas e segurança](#rotas-e-segurança)
- [Banco de dados, migrations e seeds](#banco-de-dados-migrations-e-seeds)
- [Ambiente local](#ambiente-local)
- [Deploy sugerido](#deploy-sugerido)
- [Credenciais seed](#credenciais-seed)

## Arquitetura
```
├── app/                # API Flask + SQLAlchemy
│   ├── src/
│   │   ├── routes/     # Blueprints (Auth, Users, Categories, Posts, Public, Uploads)
│   │   ├── services/   # Regras de negócio + RBAC
│   │   ├── models/     # User, Category, Post
│   │   └── utils/      # JWT, permissões, helpers de data
│   └── migrations/     # Alembic
├── site/               # SPA React (Vite + Tailwind)
│   ├── public/         # Site público (feed, post, categoria)
│   └── admin/          # Portal gerencial protegido
└── docker-compose.yml  # Orquestra API + MySQL (+ seed automático)
```

## Dependências principais
| Camada | Principais libs |
| --- | --- |
| API | Flask, SQLAlchemy, Alembic, Flask-JWT-Extended, Marshmallow |
| Banco | MySQL 8 (produção), SQLite opcional para dev rápido |
| Front-end | React 19, Vite, React Router, Tailwind CSS, Axios |
| Infra | Docker, Docker Compose |

## Stacks por diretório
| Diretório | Descrição |
| --- | --- |
| `app/` | API Python 3.11 com JWT, RBAC e migrations. Mais detalhes em [`app/README.md`](app/README.md). |
| `site/` | SPA React que consome a API. Documentação adicional em [`site/README.md`](site/README.md). |
| `docker-compose.yml` | Sobe MySQL + API (com seed e migrations). |

## Rotas e segurança

### Público (`/api/v1/public/*`)
- `GET /public/categories` – categorias ativas.
- `GET /public/feed` – feed paginado de posts publicados.
- `GET /public/posts/<slug>` – post publicado pelo slug.
- `GET /health` – health check simples.

### Autenticação (`/api/v1/auth/*`)
- `POST /auth/login` – retorna `access_token` JWT.
- `GET /auth/me` – dados do usuário autenticado.
- `POST /auth/logout` – invalidação client-side.

### Administração (JWT obrigatório)
- `GET/POST/PUT/DELETE /categories` – CRUD completo; bloqueado para papéis sem permissão.
- `GET/POST/PUT/DELETE /posts` – CRUD com regras de categoria/autoria.
- `POST /posts/<id>/publish` / `POST /posts/<id>/schedule` – publicação imediata ou agendada.
- `GET/POST/PUT/DELETE /users` – somente `admin` (editores não conseguem criar usuários).

### RBAC
| Papel | Acesso |
| --- | --- |
| **admin** | Controle total (usuários, categorias, posts). |
| **secretaria** | Equivalente ao admin exceto criação de usuários. |
| **editor** | Mesmo acesso de admin para posts e categorias; **não** cria usuários. |
| **tjd** | Apenas categorias `tjd` (ou com `allowed_roles` contendo `tjd`); não troca autor. |
| **leitor** | Sem acesso ao portal. |

O token JWT é validado em cada rota através de `flask_jwt_extended`. O contexto inclui `role`, usado pelos decorators `require_authenticated` e `require_roles`. No front-end, o `AppProvider` aplica guarda adicional (React Router) para preservar o mesmo comportamento.

## Banco de dados, migrations e seeds
- **MySQL** é o alvo principal. O compose provisiona `laf_portal` com volume persistente em `mysql_data`.
- **SQLite** pode ser utilizado para desenvolvimento rápido: basta alterar `DATABASE_URL` para `sqlite:///./laf_portal.db` no `.env` da API.
- **Migrations**: Alembic armazenado em `app/migrations`. Comandos utilitários via `make`:
  ```bash
  cd app
  make db-revision MSG="nova coluna"
  make db-upgrade
  ```
- **Seed** (`app/src/seed.py`): cria usuários padrão, categorias e posts de demonstração. Rodado automaticamente pelo entrypoint (local e Docker). Após o seed, um script verifica login de cada perfil para garantir integridade.

### Usuários seed
| Nome | Papel | Email | Senha | Observações |
| --- | --- | --- | --- | --- |
| Ana Administradora | admin | admin@organizacao.local | 123456 | Controle total |
| Sergio Secretaria | secretaria | secretaria@organizacao.local | 123456 | Acesso total exceto usuários |
| Teresa TJD | tjd | tjd@organizacao.local | 123456 | Acesso restrito a `tjd` |
| Edu Editor | editor | editor@organizacao.local | 123456 | Mesmo escopo de admin para posts/categorias |

## Ambiente local
1. **API + MySQL via Docker**
   ```bash
   docker compose up --build
   ```
   Isso executa migrations, seeds e inicia a API em `http://localhost:8000`.

2. **Front-end**
   ```bash
   cd site
   npm install
   npm run dev
   ```
   A SPA ficará em `http://localhost:5173` consumindo a API.

## Deploy sugerido
- **API**: empacotar a pasta `app/` como imagem Docker (o `Dockerfile` atual já serve). Provisionar MySQL gerenciado (RDS, CloudSQL, etc.) e apontar `DATABASE_URL`. Rodar migrations e seeds via entrypoint.
- **Front-end**: executar `npm run build` e servir `site/dist` via CDN ou container Nginx. Ajustar `VITE_API_BASE_URL` para a URL pública da API antes do build.
- **Variáveis sensíveis**: sobrescrever `JWT_SECRET`, credenciais do banco e `CORS_ORIGINS` em produção por variáveis de ambiente ou secret manager.
- **Observação**: para ambientes com alta disponibilidade, considerar storage compartilhado para uploads ou migrar para bucket S3/Cloud Storage.

## Notas adicionais
- A API expõe documentação Swagger em `http://<host>:8000/docs`.
- Logs padrão vão para stdout (`docker logs`).
- O front-end usa `localStorage` com criptografia AES (`VITE_SESSION_SECRET`) para manter sessões persistentes.

Para detalhes operacionais mais específicos, consulte os READMEs individuais em `app/` e `site/`.
