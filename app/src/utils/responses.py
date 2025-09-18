from __future__ import annotations

from http import HTTPStatus
from typing import Any, Dict, Iterable, Optional


class ApiError(Exception):
    def __init__(self, code: str, message: str, status: HTTPStatus = HTTPStatus.BAD_REQUEST, *, payload: Optional[Dict[str, Any]] = None) -> None:
        super().__init__(message)
        self.code = code
        self.message = message
        self.status = status
        self.payload = payload or {}

    def to_response(self) -> Dict[str, Any]:
        return {
            'error': {
                'code': self.code,
                'message': self.message,
                **({'details': self.payload} if self.payload else {}),
            }
        }


def success_response(data: Any, status: HTTPStatus = HTTPStatus.OK, **extra: Any) -> tuple[Any, int]:
    body = {'data': data}
    body.update(extra)
    return body, status


def paginated_response(items: Iterable[Any], total: int, page: int, page_size: int, *, status: HTTPStatus = HTTPStatus.OK) -> tuple[Any, int]:
    return (
        {
            'data': list(items),
            'page': page,
            'page_size': page_size,
            'total': total,
        },
        status,
    )


def error_response(code: str, message: str, status: HTTPStatus, *, payload: Optional[Dict[str, Any]] = None) -> tuple[Any, int]:
    return ({'error': {'code': code, 'message': message, **({'details': payload} if payload else {})}}, status)


__all__ = ['ApiError', 'success_response', 'paginated_response', 'error_response']
