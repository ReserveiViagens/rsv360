# Lint #237 — turismo visa (src) + BookingCalendar + BookingModal

**Cluster:** **#19** | **Branch:** `chore/lint-turismo-visa-booking-calendar-modal`

| Métrica | Pós-#430 | Esta PR |
|---------|----------|---------|
| warnings globais | **1961** | **1910** (**−51**) |
| 3 arquivos alvo | 51 | **0** |

**Correções principais:**
- `src/pages/visa.tsx`: imports enxutos; `useAuth`/`isLoading` removidos (espelho de `pages/visa.tsx`)
- `BookingCalendar.tsx`: `MOCK_BOOKINGS` + `useMemo` para dias; imports mortos removidos; state morto removido
- `BookingModal.tsx`: tipos `NamedEntity`/`AccommodationOption`; imports enxutos; `calculateValue` hoistado; eslint-disable react-hook-form

**Gates:** ESLint 0 nos 3 alvos | type-check OK | build OK

**Próximo:** cluster #21 — hotels-complete + reports + travel (−48)
