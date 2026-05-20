# `.github/scripts`

Helper scripts for CI and local validation.

## `patch-sharp-optional.py`

Marks `@img/sharp-linux-x64` and `@img/sharp-linuxmusl-x64` as
`optional: true` in `package-lock.json`.

### Why this exists

`sharp@0.34.5` can leave the Linux platform binaries hard-required in a
lockfile regenerated across libc boundaries. In this repo, that showed up
as `EBADPLATFORM` when the lock was regenerated or replayed in WSL/glibc
after a lock had been produced in an Alpine/musl context.

### Usage

```bash
python3 .github/scripts/patch-sharp-optional.py
python3 .github/scripts/patch-sharp-optional.py path/to/package-lock.json
```

### Operational note

Re-run the script after any `npm install --package-lock-only` or any lockfile
regen that touches the sharp subtree. The script is idempotent.

### Tracking

- F-027.s: initial application
- F-027.t: revisit when sharp upstream makes the platform variants
  optional by default
