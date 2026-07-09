-- CMS Vitrine: colunas para video + amenidades estruturadas.
-- order_index ja existe (0033). updated_by integer ja existe.
-- Nao recria website_content (0033 cobre CI limpo).

ALTER TABLE website_content
  ADD COLUMN IF NOT EXISTS video_url TEXT;
--> statement-breakpoint
ALTER TABLE website_content
  ADD COLUMN IF NOT EXISTS amenidades JSONB DEFAULT '[]'::jsonb;
--> statement-breakpoint
UPDATE website_content
SET order_index = id
WHERE order_index IS NULL OR order_index = 0;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS idx_website_content_amenidades
  ON website_content USING gin (amenidades);
--> statement-breakpoint
UPDATE website_content SET
  amenidades = CASE content_id
    WHEN 'atrium-thermas' THEN '["piscina_termal","upgrade_varanda","wifi"]'::jsonb
    WHEN 'lacqua-diroma' THEN '["parque_aquatico","piscina_termal","area_kids","wifi"]'::jsonb
    WHEN 'a-guas-da-fonte' THEN '["piscina_termal","wifi"]'::jsonb
    WHEN 'aldeia-do-lago' THEN '["premium","area_kids","estacionamento"]'::jsonb
    WHEN 'alta-vista-thermas' THEN '["piscina_termal","premium","wifi"]'::jsonb
    WHEN 'aquarius-residence' THEN '["upgrade_varanda","wifi","estacionamento"]'::jsonb
    WHEN 'priva-das-thermas-i' THEN '["piscina_termal","wifi","area_kids"]'::jsonb
    WHEN 'diroma-fiori' THEN '["parque_aquatico","acesso_parque","wifi"]'::jsonb
    WHEN 'sol-das-caldas' THEN '["piscina_termal","restaurante","wifi"]'::jsonb
    WHEN 'diroma-acqua-park' THEN '["parque_aquatico","acesso_parque","area_kids"]'::jsonb
    WHEN 'golden-dolphin-supreme' THEN '["premium","piscina_termal","wifi"]'::jsonb
    ELSE amenidades
  END,
  metadata = COALESCE(metadata, '{}'::jsonb) || jsonb_build_object('amenidades', amenidades)
WHERE page_type = 'hotels'
  AND content_id IN (
    'atrium-thermas', 'lacqua-diroma', 'a-guas-da-fonte', 'aldeia-do-lago',
    'alta-vista-thermas', 'aquarius-residence', 'priva-das-thermas-i',
    'diroma-fiori', 'sol-das-caldas', 'diroma-acqua-park', 'golden-dolphin-supreme'
  )
  AND (amenidades IS NULL OR amenidades = '[]'::jsonb);
