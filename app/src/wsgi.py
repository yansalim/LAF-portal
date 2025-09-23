from __future__ import annotations

from werkzeug.serving import run_simple

from .app_factory import create_app

app = create_app()


if __name__ == '__main__':
    port = app.config.get('APP_PORT', 8000)
    run_simple('0.0.0.0', port, app, use_reloader=True)
