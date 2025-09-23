from flask import Blueprint

health_bp = Blueprint('health', __name__)


@health_bp.get('/health')
def health_check():
    """Health check endpoint
    ---
    tags:
      - Health
    responses:
      200:
        description: API is healthy
        schema:
          type: object
          properties:
            status:
              type: string
              example: ok
    """
    return {'status': 'ok'}
