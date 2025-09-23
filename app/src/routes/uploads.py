import os
import uuid

from flask import Blueprint, current_app, request, send_from_directory
from werkzeug.utils import secure_filename

from ..utils.permissions import require_authenticated
from ..utils.responses import success_response

uploads_bp = Blueprint('uploads', __name__)


@uploads_bp.post('/image')
@require_authenticated
def upload_image(current_user):  # noqa: ARG001
    """Upload de imagem (JWT)
    ---
    tags:
      - Uploads
    consumes:
      - multipart/form-data
    parameters:
      - in: formData
        name: file
        type: file
        required: true
        description: Arquivo de imagem
    responses:
      201:
        description: Upload realizado
        schema:
          $ref: '#/definitions/StandardResponse'
      400:
        description: Falha no upload
        schema:
          $ref: '#/definitions/Error'
    """
    file = request.files.get('file')
    if not file:
        return {'error': {'code': 'VALIDATION_ERROR', 'message': 'Arquivo não enviado'}}, 422

    filename = secure_filename(file.filename or '')
    if not filename:
        return {'error': {'code': 'VALIDATION_ERROR', 'message': 'Nome de arquivo inválido'}}, 422

    ext = os.path.splitext(filename)[1]
    unique_name = f"{uuid.uuid4().hex}{ext}"
    upload_path = current_app.config['UPLOAD_FOLDER']
    os.makedirs(upload_path, exist_ok=True)
    file_path = os.path.join(upload_path, unique_name)
    file.save(file_path)

    url = f"/static/uploads/{unique_name}"
    return success_response({'url': url}, status=201)


@uploads_bp.get('/image/<path:filename>')
def get_image(filename: str):
    upload_path = current_app.config['UPLOAD_FOLDER']
    return send_from_directory(upload_path, filename)
