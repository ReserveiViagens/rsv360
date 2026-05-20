# `.github/scripts`

Utility scripts used by CI and local validation.

## `postinstall-patches.cjs`

Idempotent postinstall hook that:

- patches `@jest/reporters` `CoverageReporter.js` to use the modern `glob` export shape
- marks the Linux `sharp` variants as `optional: true` in `package-lock.json`

Usage:

```bash
node .github/scripts/postinstall-patches.cjs
```

## `postinstall-patches.smoke.cjs`

Runs the patch script twice and verifies that the second run is a no-op.

Usage:

```bash
node .github/scripts/postinstall-patches.smoke.cjs
```
