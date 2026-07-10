# Vitrine — uploads de fotos e URLs de mídia

## Onde ficam as fotos

As fotos processadas da vitrine Etapa A ficam em:

```
backend/public/uploads/hoteis/*.jpg
```

Estão no `.gitignore` (binários não versionados). O volume Docker `uploads_hoteis` persiste entre recreates **apenas no ambiente onde foi configurado**.

## Deploy novo (staging/prod)

Um ambiente novo **nasce sem as fotos**. Opções:

1. Rodar script de carga local (`scripts/process-vitrine-photos.mjs`) + atualizar CMS
2. Upload manual via `/admin/cms` no ambiente de destino

## Como o browser carrega as imagens

**Estratégia principal (recomendada):** URLs relativas `/uploads/...` no JSON da API e nos cards. O `site-publico` faz proxy server-side:

```js
// next.config.js — rewrite em runtime do servidor Next
/uploads/:path* → ${INTERNAL_API_URL}/uploads/:path*
```

O browser só vê `:3000/uploads/hoteis/...`; o Next resolve o backend em runtime via `INTERNAL_API_URL` (ex.: `http://backend:3002` no Docker).

**Estratégia secundária:** `resolveAbsoluteMediaUrl()` para admin, OG tags ou integrações que exigem URL absoluta — usa `NEXT_PUBLIC_API_URL`.

## `NEXT_PUBLIC_*` é build-time (Next.js)

Variáveis `NEXT_PUBLIC_*` são **embutidas no bundle JavaScript no `next build`**. Definir `NEXT_PUBLIC_API_URL` só no runtime do container **não altera** código client-side já compilado.

| Variável | Quando resolve | Uso |
|----------|----------------|-----|
| `INTERNAL_API_URL` | Runtime do servidor Next | Rewrite `/uploads/*`, BFF server-side |
| `NEXT_PUBLIC_API_URL` | **Build** da imagem (`docker build --build-arg`) | Fallback absoluto, chamadas client diretas ao backend |

Em staging/prod:

- Passe `NEXT_PUBLIC_API_URL` como **build arg** no Dockerfile/CI, **ou**
- Prefira URLs relativas + rewrite (não depende de rebuild para trocar host do backend de uploads)

## Docker Compose (dev)

```yaml
backend:
  volumes:
    - uploads_hoteis:/workspace/backend/public/uploads

volumes:
  uploads_hoteis:
```

## Validação rápida

```bash
# Foto no backend
curl -s -o /dev/null -w "%{http_code}" http://localhost:3002/uploads/hoteis/atrium-thermas.jpg

# Proxy via site-publico (rewrite)
curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/uploads/hoteis/atrium-thermas.jpg

# API retorna path relativo
curl -s "http://localhost:3000/api/cotacao/disponibilidade?checkIn=2026-08-01&checkOut=2026-08-03&adults=2" \
  | jq '.data.hotels[0].images[0]'
# esperado: "/uploads/hoteis/....jpg" (não localhost hardcoded)
```
