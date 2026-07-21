# PR-001c — ImageError instrumentation evidence

## Scope delivered

- `lib/image-error-telemetry.ts` — `ImageError`, `ImageRecovered`, `ImageTelemetrySentinel`
- Dedup: one `ImageError` per load attempt; one `ImageRecovered` per recovered attempt
- Context: `url`, `browser`, `viewport`, `environment`, `image_id`, `parque_id`, `ingresso_id`,
  `component_name`, `page_route`, `release_version`, `user_session_id`
- `ImageRecovered` metrics: `falhas_totais`, `tempo_medio_recuperacao_ms`,
  `pct_recuperacao_automatica`, `falhas_permanentes`
- Sentinel: periodic heartbeat (`sequence` + `expected_interval_ms`) for loss-rate audit

## Wired surfaces

| Surface | File |
|---------|------|
| Ticket cards | `components/cards/ticket-product-card.tsx` |
| Shared fallback image | `components/ui/ImageWithFallback.tsx` |
| Ingressos catalog | `app/ingressos/page.tsx` |
| Ingressos CMS variant | `app/ingressos/page-dynamic.tsx` |
| Sentinel mount | `components/telemetry/ImageTelemetrySentinel.tsx` on `/ingressos` |

## Tests

```
cd apps/site-publico
npx jest --runInBand --testPathPattern image-error-telemetry
```

## Manual checklist (Review)

- [ ] Force broken `src` on a ticket card → one `ImageError` in analytics/Sentry (no dup on retry of same attempt)
- [ ] Fallback load succeeds → one `ImageRecovered` with metrics
- [ ] Sentinel appears periodically while on `/ingressos`
- [ ] Viewports 375 / 390 / 430 / 768 / 1440 (viewport field in payload)
- [ ] Chrome / Edge / Safari (browser field)

## Rollback

Revert this PR (remove telemetry helper + wiring). No schema migration.
