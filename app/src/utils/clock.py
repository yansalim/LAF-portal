from __future__ import annotations

from datetime import datetime
from typing import Optional

import pytz
from flask import current_app


def get_timezone():
    tz_name = getattr(current_app.config, 'TZ', None) or current_app.config.get('TZ', 'UTC')
    return pytz.timezone(tz_name)


def utcnow() -> datetime:
    return datetime.now(tz=pytz.UTC)


def now_local() -> datetime:
    tz = get_timezone()
    return datetime.now(tz=tz)


def ensure_tz(dt: Optional[datetime]) -> Optional[datetime]:
    if dt is None:
        return None
    if dt.tzinfo is None:
        return pytz.UTC.localize(dt)
    return dt.astimezone(pytz.UTC)


def is_in_future(dt: Optional[datetime]) -> bool:
    if dt is None:
        return False
    return ensure_tz(dt) > utcnow()


def has_passed(dt: Optional[datetime]) -> bool:
    if dt is None:
        return True
    return ensure_tz(dt) <= utcnow()
