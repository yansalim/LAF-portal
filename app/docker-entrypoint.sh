#!/bin/bash
set -euo pipefail

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
exec python -m src.wsgi
