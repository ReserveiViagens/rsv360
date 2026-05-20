#!/usr/bin/env python3
"""
Mark the Linux sharp variants as optional in package-lock.json.

This is a narrow workaround for the lockfile state that can leave
@img/sharp-linux-x64 and @img/sharp-linuxmusl-x64 hard-required after
cross-libc regeneration.

The script is idempotent:
- if both entries are already optional, it makes no changes
- if either entry is missing, it reports the issue and exits non-zero

Usage:
  python3 .github/scripts/patch-sharp-optional.py
  python3 .github/scripts/patch-sharp-optional.py path/to/package-lock.json
"""

from __future__ import annotations

import json
import sys
from pathlib import Path

TARGETS = [
    "node_modules/@img/sharp-linux-x64",
    "node_modules/@img/sharp-linuxmusl-x64",
]


def main(argv: list[str]) -> int:
    lock_path = Path(argv[1]) if len(argv) > 1 else Path("package-lock.json")
    if not lock_path.exists():
        print(f"ERROR: {lock_path} not found", file=sys.stderr)
        return 1

    raw = lock_path.read_bytes()
    eol = b"\r\n" if b"\r\n" in raw[:200] else b"\n"

    try:
        data = json.loads(raw.decode("utf-8"))
    except json.JSONDecodeError as exc:
        print(f"ERROR: invalid JSON: {exc}", file=sys.stderr)
        return 1

    packages = data.get("packages", {})
    changed: list[str] = []
    already: list[str] = []
    missing: list[str] = []

    for key in TARGETS:
        pkg = packages.get(key)
        if pkg is None:
            missing.append(key)
            continue
        if pkg.get("optional") is True:
            already.append(key)
            continue
        pkg["optional"] = True
        changed.append(key)

    if missing:
        print(f"WARNING: missing entries: {missing}", file=sys.stderr)

    if changed:
        out = (json.dumps(data, indent=2, ensure_ascii=False) + "\n").encode("utf-8")
        if eol == b"\r\n":
            out = out.replace(b"\n", b"\r\n")
        lock_path.write_bytes(out)
        print(f"Patched {len(changed)} entries:")
        for key in changed:
            print(f"  {key}")
    else:
        print("No changes needed")

    if already:
        print(f"Already optional ({len(already)}):")
        for key in already:
            print(f"  {key}")

    return 1 if missing else 0


if __name__ == "__main__":
    raise SystemExit(main(sys.argv))
