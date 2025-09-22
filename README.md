# LAF Portal Monorepo

Este repositório agrupa o front-end (Vite/React) e o back-end (Flask/MySQL) do Portal LAF.

## Pastas
| Diretório | Descrição |
| --- | --- |
| `site/` | Aplicação web (Vite + React). Consulte `site/README.md` para instruções de desenvolvimento. |
| `app/` | API Flask com SQLAlchemy, Alembic e Docker Compose. Consulte `app/README.md`. |
| `docker-compose.yml` | Orquestra banco MySQL e API via Docker.

## Como iniciar
1. **Back-end / API**: siga `app/README.md` ou execute `docker compose up --build` para subir MySQL + API.
2. **Front-end / Site**:
   ```bash
   cd site
   npm install
   npm run dev
   ```
   O site roda em `http://localhost:5173`.

A API expõe Swagger em `http://localhost:8000/docs` quando executada com Docker ou via `make run` dentro de `app/`.
