# Vitrine CMS — Etapa A (11 empreendimentos)

## Como cadastrar

**Não há UI admin funcional** para `website_content` hoje:

- `/admin/cms` no site-publico está “Em construção”
- `HotelManagement.tsx` existe, mas falta `POST /api/admin/website/content`

### Staging / produção (obrigatório)

A vitrine entra no pipeline via migration Drizzle **`0033_vitrine_etapa_a_11_hoteis`** (mesmo padrão do 0032):

```bash
npm run migrate
```

Isso desativa `hotel-demo-1/2` e upserta os 11 hotéis em qualquer ambiente. **Não depende** de rodar o seed manual no Postgres local.

### Ops / local (opcional)

```powershell
cd "C:\Users\RSV 360\Documents\rsv360"
$env:DATABASE_URL="postgresql://rsv360:REDACTED_PG_DEV_PASSWORD@localhost:5433/rsv_360_ecosystem"
node backend/scripts/seed-vitrine-etapa-a.mjs
```

Arquivo espelho: [`vitrine-etapa-a-11-hoteis.sql`](./vitrine-etapa-a-11-hoteis.sql)

## Conteúdo

| content_id (= hotel_id) | Título | Preço card (min flat) | maxGuests | Destaque |
|-------------------------|--------|----------------------:|----------:|----------|
| atrium-thermas | Atrium Thermas | 349 | 4 | Upgrade varanda |
| lacqua-diroma | Lacqua diRoma | 200 | 5 | KN39H entrada |
| a-guas-da-fonte | Águas da Fonte | 350 | 4 | |
| aldeia-do-lago | Aldeia do Lago | 380 | 8 | Premium âncora |
| alta-vista-thermas | Alta Vista Thermas | 480 | 5 | |
| aquarius-residence | Aquarius Residence | 320 | 5 | Upgrade varanda |
| priva-das-thermas-i | Privé das Thermas I | 400 | 6 | |
| diroma-fiori | DiRoma Fiori | 394 | 5 | |
| sol-das-caldas | Sol das Caldas | 360 | 7 | |
| diroma-acqua-park | diRoma Acqua Park | 280 | 6 | |
| golden-dolphin-supreme | Golden Dolphin Supreme | 405 | 4 | |

`hotel-demo-1` / `hotel-demo-2` → `status=inactive`.

## Pendente (Douglas)

Todos os 11 têm `metadata.conteudoPendente=true` e fotos Unsplash placeholder. Substituir:

1. **Foto principal** (URL) por hotel  
2. **Descrição curta** (1–2 frases)  
3. **Features** / destaque comercial (opcional)  
4. **Vídeo** (opcional)

Depois do conteúdo final: `UPDATE` no seed ou reaplicar SQL com URLs reais.
