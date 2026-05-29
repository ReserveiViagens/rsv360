#!/usr/bin/env python3
"""Parse `next lint` stdout into TSV: file, line, col, rule."""
import re
import sys
from collections import Counter

current = ""
rows = []
for line in sys.stdin:
    if line.startswith("./"):
        current = line.strip()
        continue
    m = re.search(r"^(\d+):(\d+)\s+Error:\s+.+\s+([\w@/-]+)\s*$", line)
    if m and current:
        rows.append((current, m.group(1), m.group(2), m.group(3)))

for r in rows:
    print("\t".join(r))

if "--summary" in sys.argv:
    print("\n# by_rule", file=sys.stderr)
    for rule, n in Counter(r[3] for r in rows).most_common():
        print(f"{n}\t{rule}", file=sys.stderr)
    print(f"\n# total_errors\t{len(rows)}", file=sys.stderr)
