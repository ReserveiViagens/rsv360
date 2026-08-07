"""PR-13c — shared token auth for SRE trigger API (:5050)."""

from __future__ import annotations

import hmac
import os
from functools import wraps
from typing import Any, Callable


def get_expected_sre_token() -> str:
    return (os.getenv("SRE_API_TOKEN") or "").strip()


def extract_provided_token(
    *,
    authorization: str | None = None,
    x_sre_token: str | None = None,
) -> str:
    auth = (authorization or "").strip()
    if auth.lower().startswith("bearer "):
        return auth[7:].strip()
    return (x_sre_token or "").strip()


def verify_sre_token(
    provided: str,
    expected: str | None = None,
) -> tuple[bool, int, str]:
    """
    Fail-closed: missing SRE_API_TOKEN → 503.
    Wrong/missing provided token → 401.
    """
    exp = expected if expected is not None else get_expected_sre_token()
    if not exp:
        return False, 503, "SRE_API_TOKEN not configured"
    if not provided or not hmac.compare_digest(provided, exp):
        return False, 401, "Unauthorized"
    return True, 200, "ok"


def require_sre_token(view: Callable[..., Any]) -> Callable[..., Any]:
    """Flask decorator: require Bearer / X-SRE-Token matching SRE_API_TOKEN."""

    @wraps(view)
    def wrapped(*args: Any, **kwargs: Any):
        from flask import jsonify, request

        provided = extract_provided_token(
            authorization=request.headers.get("Authorization"),
            x_sre_token=request.headers.get("X-SRE-Token"),
        )
        ok, status, message = verify_sre_token(provided)
        if not ok:
            return jsonify({"status": "error", "message": message}), status
        return view(*args, **kwargs)

    return wrapped
