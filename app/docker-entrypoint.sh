#!/bin/bash
set -euo pipefail

MODE=${1:-serve}
if [ "$MODE" != "serve" ]; then
  shift || true
fi

if [ -z "${DATABASE_URL:-}" ]; then
  echo "DATABASE_URL must be set"
  exit 1
fi

python <<'PY'
import os
import time
from sqlalchemy.engine import make_url
import pymysql

url = make_url(os.environ['DATABASE_URL'])

host = url.host or 'localhost'
port = url.port or 3306
user = url.username
password = url.password
# Database may not exist yet; MySQL entrypoint creates it, so wait for server availability first.

while True:
    try:
        conn = pymysql.connect(host=host, port=port, user=user, password=password, database=url.database, connect_timeout=5)
        conn.close()
        break
    except Exception as exc:  # noqa: BLE001
        print(f"Waiting for database {host}:{port}... {exc}")
        time.sleep(2)
PY

python -m alembic upgrade head
python -m src.seed

python <<'PY'
from src.app_factory import create_app
from src.services.auth_service import AuthService

credentials = [
    ("admin@organizacao.local", "123456"),
    ("secretaria@organizacao.local", "123456"),
    ("tjd@organizacao.local", "123456"),
    ("editor@organizacao.local", "123456"),
]

app = create_app()
with app.app_context():
    for email, password in credentials:
        try:
            AuthService.login(email, password)
            print(f"[seed-check] Login OK para {email}")
        except Exception as exc:  # noqa: BLE001
            print(f"[seed-check] Falha ao validar login para {email}: {exc}")
PY

if [ "$MODE" = "bootstrap" ]; then
  exit 0
fi

exec python -m src.wsgi
