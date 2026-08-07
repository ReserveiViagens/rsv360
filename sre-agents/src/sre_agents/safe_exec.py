"""PR-13c — closed recipe allowlist for SRE execution (never shell=True)."""

from __future__ import annotations

import os
import subprocess
import sys
from typing import Mapping, Sequence

# Exact recipe id → argv. Free-form shell strings are never executed.
ALLOWED_RECIPES: dict[str, list[str]] = {
    "noop": [sys.executable, "-c", "print('sre-noop-ok')"],
}


def _normalize_recipe_id(proposed: str) -> str | None:
    text = (proposed or "").strip()
    if text.lower().startswith("recipe:"):
        text = text[len("recipe:") :].strip()
    if not text:
        return None
    # Reject shell metacharacters / path traversal in the id itself.
    if any(c in text for c in ";&|`$<>\n\r\\/"):
        return None
    if ".." in text or " " in text:
        return None
    return text


def resolve_recipe(
    proposed: str,
    recipes: Mapping[str, Sequence[str]] | None = None,
) -> list[str] | None:
    """Return argv for an exact allowlisted recipe id, else None."""
    recipe_id = _normalize_recipe_id(proposed)
    if recipe_id is None:
        return None
    table = recipes if recipes is not None else ALLOWED_RECIPES
    argv = table.get(recipe_id)
    if not argv:
        return None
    return list(argv)


def is_allowed_command(
    proposed: str,
    recipes: Mapping[str, Sequence[str]] | None = None,
) -> bool:
    return resolve_recipe(proposed, recipes) is not None


def run_safe_command(
    proposed: str,
    *,
    timeout: int = 120,
    recipes: Mapping[str, Sequence[str]] | None = None,
    cwd: str | None = None,
) -> tuple[bool, str]:
    """
    Execute an allowlisted recipe with subprocess shell=False.
    Returns (success, output_text).
    """
    argv = resolve_recipe(proposed, recipes)
    if not argv:
        preview = (proposed or "")[:100]
        return (
            False,
            f"Comando nao permitido pela allowlist fechada (use recipe:<id>): {preview}",
        )

    try:
        result = subprocess.run(
            argv,
            shell=False,
            capture_output=True,
            text=True,
            timeout=timeout,
            cwd=cwd,
        )
        stdout = result.stdout or ""
        stderr = result.stderr or ""
        output = f"stdout:\n{stdout}\nstderr:\n{stderr}".strip()
        return result.returncode == 0, output
    except subprocess.TimeoutExpired:
        return False, f"Timeout: comando excedeu {timeout} segundos."
    except OSError as exc:
        return False, f"Erro ao executar: {exc}"


def full_restart_allowed() -> bool:
    """Auto-heal full_restart requires explicit env opt-in (in addition to API token)."""
    return (os.getenv("SRE_ALLOW_FULL_RESTART") or "").strip().lower() in (
        "1",
        "true",
        "yes",
        "on",
    )
