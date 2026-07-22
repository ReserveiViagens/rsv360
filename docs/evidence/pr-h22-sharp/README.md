# H2.2 — sharp 0.35.x + next/image smoke

## Command

```bash
npm run build --workspace apps/site-publico
node scripts/smoke-h22-next-image.mjs
```

## Result (local, branch `chore/h2.2-sharp-0.35`)

```
{"ok":true,"sharp":"0.35.3","status":200,"contentType":"image/png","bytes":2026,"originalBytes":117615,"url":"http://127.0.0.1:3017/_next/image?url=%2Ficons%2Ficon-192x192.png&w=64&q=75"}
H22_SMOKE_SUMMARY pass=1/1 sharp=0.35.3 ct=image/png bytes=2026 orig=117615
```

## Assertions

- `sharp` runtime version **0.35.3**
- `GET /_next/image` → **200** + `content-type: image/png`
- Optimized payload **2026 B** vs original icon **117615 B** (w=64, q=75)
