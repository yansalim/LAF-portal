# LAF Portal API

Backend em Flask + SQLAlchemy que fornece as APIs públicas e administrativas do Portal LAF.

## Requisitos
- Python 3.11+
- MySQL 8+
- Make

## Configuração
1. Copie o arquivo `.env.example` para `.env` e ajuste as variáveis conforme necessário.
   ```bash
   cp .env.example .env
   ```

### Variáveis principais
| Variável | Descrição | Padrão |
| --- | --- | --- |
| APP_NAME | Nome da aplicação | LAF Portal API |
| FLASK_ENV | Ambiente (`development`, `production`) | development |
| APP_PORT | Porta HTTP para o servidor | 8000 |
| TZ | Timezone padrão | America/Sao_Paulo |
| DATABASE_URL | URL do banco MySQL | mysql+pymysql://root:pass@localhost:3306/laf_portal |
| JWT_SECRET | Segredo para tokens JWT | change-me |
| ACCESS_TOKEN_EXPIRES_MIN | Expiração do token em minutos | 120 |
| CORS_ORIGINS | URLs autorizadas (separadas por vírgula) | http://localhost:5173 |
| SWAGGER_TITLE/SWAGGER_DESC/SWAGGER_VERSION | Informações do Swagger | - |
| TEST_DATABASE_URL | (opcional) URL do banco de testes para Pytest | mysql+pymysql://root:pass@localhost:3306/laf_portal_test |

## Execução completa
```bash
cd app
make up
```
O comando executa: criação de `.env` (se necessário), criação/atualização de virtualenv, instalação de dependências, migrações, seed e inicialização do servidor. A documentação estará disponível em [`http://localhost:8000/docs`](http://localhost:8000/docs).

### Usuários seed
Após as migrations o script `src/seed.py` cria perfis básicos e o entrypoint valida o login de cada um automaticamente. Credenciais:

| Nome | E-mail | Senha | Papel | Observações |
| --- | --- | --- | --- | --- |
| Ana Administradora | `admin@organizacao.local` | `123456` | `admin` | Acesso total. |
| Sergio Secretaria | `secretaria@organizacao.local` | `123456` | `secretaria` | Gerencia categorias e posts em qualquer categoria. |
| Teresa TJD | `tjd@organizacao.local` | `123456` | `tjd` | Apenas categorias `tjd` ou que permitam `tjd`. |
| Edu Editor | `editor@organizacao.local` | `123456` | `editor` | Limitado a categorias `geral` e `atas`. |

Você pode testar manualmente com cURL:

```bash
curl -X POST http://localhost:8000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@organizacao.local","password":"123456"}'
```

Repita trocando o e-mail para os demais perfis para validar o RBAC.

## Execução com Docker
Com Docker e Docker Compose instalados:
```bash
cp app/.env.example app/.env   # ajuste as variáveis conforme necessário
docker-compose up --build
```
O Compose cria o MySQL (`mysql://root:pass@db:3306/laf_portal`), roda as migrações e seeds automaticamente e expõe a API em `http://localhost:8000`.

Para derrubar os containers e manter os dados:
```bash
docker-compose down
```
Para limpar os dados persistentes:
```bash
docker-compose down -v
```

## Principais comandos
```bash
make env           # Gera .env a partir do exemplo (se ausente)
make setup         # Cria o virtualenv .venv
make install       # Instala as dependências
make db-revision MSG="alterações"  # Gera nova migration com autogerenciamento
make db-upgrade    # Aplica migrations
make db-downgrade  # Reverte a última migration
make seed          # Executa seed de dados básicos
make run           # Inicia o servidor (python -m src.wsgi)
make test          # Executa pytest (usa TEST_DATABASE_URL, criando/apagando o schema informado)
```

## Estrutura do projeto
```
app/
  src/
    app_factory.py   # create_app()
    config.py        # Configurações baseadas em .env
    extensions.py    # Instâncias de db, jwt, cors, swagger
    models/          # Modelos SQLAlchemy (User, Category, Post)
    services/        # Regras de negócio e RBAC
    routes/          # Blueprints (Auth, Users, Categories, Posts, Public, Uploads)
    utils/           # Helpers (clock, responses, permissions)
    docs/            # Configuração do Swagger
    seed.py          # Seed inicial de usuários/categorias/posts
    wsgi.py          # Ponto de entrada (python -m src.wsgi)
  migrations/        # Migrações Alembic
  uploads/           # Uploads locais (gitignored)
  tests/             # Testes Pytest
```

## Fluxo de autenticação
1. `POST /api/v1/auth/login` com `{"email", "password"}` → retorna `access_token`.
2. Envie o token em `Authorization: Bearer <token>` para acessar endpoints protegidos.
3. `GET /api/v1/auth/me` retorna o usuário atual.

## Endpoints principais (exemplos)
### Público
```bash
curl http://localhost:8000/api/v1/health
curl http://localhost:8000/api/v1/public/categories
curl "http://localhost:8000/api/v1/public/feed?page=1&page_size=6"
```

### Autenticação
```bash
curl -X POST http://localhost:8000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@organizacao.local","password":"123456"}'
```

### Administração
```bash
# Listar categorias
curl http://localhost:8000/api/v1/categories/ \
  -H "Authorization: Bearer $TOKEN"

# Criar post
curl -X POST http://localhost:8000/api/v1/posts/ \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"slug":"novo-post","title":"Novo Post","content_markdown":"Conteúdo","category_id":"...","author_id":"..."}'
```

## Migrações
- Para criar nova migration após alterar modelos:
  ```bash
  make db-revision MSG="nova tabela"
  ```
- Aplique com `make db-upgrade` e reverta com `make db-downgrade`.

## Testes
```bash
make test
```

## RBAC
| Papel | Permissões |
| --- | --- |
| admin | Acesso total (usuários, categorias, posts) |
| secretaria | Gerencia categorias e posts em qualquer categoria |
| tjd | CRUD de posts somente em categorias com slug `tjd` ou que incluam `tjd` em `allowed_roles` |
| editor | CRUD de posts apenas nas categorias listadas em `allowed_category_slugs` |

## Observações
- Times e datas são armazenadas em UTC (`utcnow`) e exibidas conforme timezone configurado (`TZ`).
- Uploads são gravados em `app/uploads/` e servidos via `/static/uploads/<arquivo>`.
