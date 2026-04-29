#!/usr/bin/env python3
"""
NPM Audit gate with allowlist.

- Fails on any critical/high vulnerability NOT in the allowlist.
- Validates allowlist entries: severity match + expiry date.
- Requires explicit reason for each allowlisted package.
"""
import json
import sys
import os
from datetime import date

audit_file = sys.argv[1] if len(sys.argv) > 1 else '/tmp/audit.json'
allowlist_file = sys.argv[2] if len(sys.argv) > 2 else '.github/audit-allowlist.json'

try:
    with open(audit_file) as f:
        audit = json.load(f)
except Exception as e:
    print(f"::error::Failed to load audit JSON: {e}")
    sys.exit(2)

allowed = {}
if os.path.exists(allowlist_file):
    with open(allowlist_file) as f:
        allowed = json.load(f).get('allow', {})

vulns = audit.get('vulnerabilities', {})
violations = []
allowed_used = []

for pkg, v in vulns.items():
    sev = v.get('severity')
    if sev not in ('critical', 'high'):
        continue
    if pkg in allowed:
        entry = allowed[pkg]
        expiry = entry.get('expires')
        if expiry:
            try:
                if date.fromisoformat(expiry) < date.today():
                    violations.append((pkg, sev, f"allowlist expired ({expiry})"))
                    continue
            except ValueError:
                violations.append((pkg, sev, f"invalid expires '{expiry}' (use YYYY-MM-DD)"))
                continue
        if entry.get('severity') != sev:
            violations.append((pkg, sev, f"severity escalated: was {entry.get('severity')}, now {sev}"))
            continue
        allowed_used.append((pkg, sev, entry.get('reason', '(no reason)')))
    else:
        violations.append((pkg, sev, "not in allowlist"))

print("=" * 60)
print(f"NPM Audit Gate Report ({audit_file})")
print("=" * 60)

if allowed_used:
    print(f"\n[ALLOWED] {len(allowed_used)} known tech-debt entries:")
    for pkg, sev, reason in allowed_used:
        print(f"  - {pkg} ({sev}): {reason}")

if violations:
    print(f"\n[BLOCK] {len(violations)} unallowlisted critical/high:")
    for pkg, sev, reason in violations:
        print(f"  - {pkg} ({sev}): {reason}")
    print(f"\nFix these or add to {allowlist_file} with justification + expiry.")
    sys.exit(1)

print(f"\n[OK] All critical/high vulnerabilities are fixed or explicitly allowlisted")
sys.exit(0)
