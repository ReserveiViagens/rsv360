-- Vitrine CMS Etapa A: 11 hoteis reais + demos inactive.
-- Idempotente. Equivalente a database/seeds/vitrine-etapa-a-11-hoteis.sql.
-- Roda via migrate em qualquer ambiente.

-- Vitrine CMS Etapa A — 11 empreendimentos reais (content_id = hotel_id das acomodações).
-- Desativa hotel-demo-1/2 na vitrine pública.
-- Fotos/descrições: placeholders — Douglas substitui por conteúdo final (Notion/CMS).
-- Idempotente: ON CONFLICT atualiza; demos → status=inactive.

-- 1) Demos fora da vitrine pública
UPDATE website_content
SET status = 'inactive',
    metadata = COALESCE(metadata, '{}'::jsonb) || '{"vitrine":"demo_desativado_etapa_a"}'::jsonb
WHERE page_type = 'hotels'
  AND content_id IN ('hotel-demo-1', 'hotel-demo-2');

-- 2) 11 hotéis Etapa A
INSERT INTO website_content (page_type, content_id, title, description, images, metadata, status, order_index)
VALUES
(
  'hotels', 'atrium-thermas', 'Atrium Thermas',
  'Apartamentos no Atrium Thermas — opção com upgrade de varanda/vista.',
  '["https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&h=500&fit=crop"]'::jsonb,
  '{
    "price": 349,
    "location": "Caldas Novas, GO",
    "maxGuests": 4,
    "features": ["Águas termais", "Upgrade varanda disponível"],
    "images": ["https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&h=500&fit=crop"],
    "behaviorTags": ["familia", "casal"],
    "destaque": "Unidades com upgrade varanda (+R$80/noite)",
    "conteudoPendente": true,
    "etapaA": true
  }'::jsonb,
  'active', 10
),
(
  'hotels', 'lacqua-diroma', 'Lacqua diRoma',
  'Complexo Lacqua diRoma — entrada acessível (ex.: apto KN39H).',
  '["https://images.unsplash.com/photo-1582719508461-905c673771fd?w=800&h=500&fit=crop"]'::jsonb,
  '{
    "price": 200,
    "location": "Caldas Novas, GO",
    "maxGuests": 5,
    "features": ["Parque aquático próximo", "Boa relação custo-benefício"],
    "images": ["https://images.unsplash.com/photo-1582719508461-905c673771fd?w=800&h=500&fit=crop"],
    "behaviorTags": ["familia", "casal"],
    "destaque": "Isca de entrada — diárias a partir de R$200",
    "conteudoPendente": true,
    "etapaA": true
  }'::jsonb,
  'active', 20
),
(
  'hotels', 'a-guas-da-fonte', 'Águas da Fonte',
  'Suítes no Águas da Fonte — 1 quarto até 4 pessoas.',
  '["https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800&h=500&fit=crop"]'::jsonb,
  '{
    "price": 350,
    "location": "Caldas Novas, GO",
    "maxGuests": 4,
    "features": ["Piscina", "Localização central"],
    "images": ["https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800&h=500&fit=crop"],
    "behaviorTags": ["casal", "familia"],
    "conteudoPendente": true,
    "etapaA": true
  }'::jsonb,
  'active', 30
),
(
  'hotels', 'aldeia-do-lago', 'Aldeia do Lago',
  'Chalés na Aldeia do Lago — inclui Premium âncora (família).',
  '["https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800&h=500&fit=crop"]'::jsonb,
  '{
    "price": 380,
    "location": "Caldas Novas, GO",
    "maxGuests": 8,
    "features": ["Chalé", "Produto Premium âncora"],
    "images": ["https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800&h=500&fit=crop"],
    "behaviorTags": ["familia"],
    "premiumLabel": "Chalé Família",
    "conteudoPendente": true,
    "etapaA": true
  }'::jsonb,
  'active', 40
),
(
  'hotels', 'alta-vista-thermas', 'Alta Vista Thermas',
  'Apartamentos Alta Vista — linha Premium / varanda.',
  '["https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=800&h=500&fit=crop"]'::jsonb,
  '{
    "price": 480,
    "location": "Caldas Novas, GO",
    "maxGuests": 5,
    "features": ["Cozinha", "Varanda"],
    "images": ["https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=800&h=500&fit=crop"],
    "behaviorTags": ["familia", "casal"],
    "conteudoPendente": true,
    "etapaA": true
  }'::jsonb,
  'active', 50
),
(
  'hotels', 'aquarius-residence', 'Aquarius Residence',
  'Aquarius Residence — suítes com opção de upgrade varanda.',
  '["https://images.unsplash.com/photo-1590490360182-c33d57733427?w=800&h=500&fit=crop"]'::jsonb,
  '{
    "price": 320,
    "location": "Caldas Novas, GO",
    "maxGuests": 5,
    "features": ["Cozinha compacta", "Upgrade varanda disponível"],
    "images": ["https://images.unsplash.com/photo-1590490360182-c33d57733427?w=800&h=500&fit=crop"],
    "behaviorTags": ["familia"],
    "destaque": "AQR-FAM com upgrade varanda (+R$80/noite)",
    "conteudoPendente": true,
    "etapaA": true
  }'::jsonb,
  'active', 60
),
(
  'hotels', 'priva-das-thermas-i', 'Privé das Thermas I',
  'Apartamento 2 quartos no Privé das Thermas I.',
  '["https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=800&h=500&fit=crop"]'::jsonb,
  '{
    "price": 400,
    "location": "Caldas Novas, GO",
    "maxGuests": 6,
    "features": ["2 quartos", "1 suíte"],
    "images": ["https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=800&h=500&fit=crop"],
    "behaviorTags": ["familia"],
    "conteudoPendente": true,
    "etapaA": true
  }'::jsonb,
  'active', 70
),
(
  'hotels', 'diroma-fiori', 'DiRoma Fiori',
  'Apartamento 1 quarto no DiRoma Fiori.',
  '["https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800&h=500&fit=crop"]'::jsonb,
  '{
    "price": 394,
    "location": "Caldas Novas, GO",
    "maxGuests": 5,
    "features": ["1 quarto"],
    "images": ["https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800&h=500&fit=crop"],
    "behaviorTags": ["casal", "familia"],
    "conteudoPendente": true,
    "etapaA": true
  }'::jsonb,
  'active', 80
),
(
  'hotels', 'sol-das-caldas', 'Sol das Caldas',
  'Apartamento 2 quartos no Sol das Caldas.',
  '["https://images.unsplash.com/photo-1445019980597-93fa8acb246c?w=800&h=500&fit=crop"]'::jsonb,
  '{
    "price": 360,
    "location": "Caldas Novas, GO",
    "maxGuests": 7,
    "features": ["2 quartos"],
    "images": ["https://images.unsplash.com/photo-1445019980597-93fa8acb246c?w=800&h=500&fit=crop"],
    "behaviorTags": ["familia"],
    "conteudoPendente": true,
    "etapaA": true
  }'::jsonb,
  'active', 90
),
(
  'hotels', 'diroma-acqua-park', 'diRoma Acqua Park',
  'Apartamento 2 quartos com churrasqueira — diRoma Acqua Park.',
  '["https://images.unsplash.com/photo-1584132967334-10e028bd69f7?w=800&h=500&fit=crop"]'::jsonb,
  '{
    "price": 280,
    "location": "Caldas Novas, GO",
    "maxGuests": 6,
    "features": ["Churrasqueira", "2 quartos"],
    "images": ["https://images.unsplash.com/photo-1584132967334-10e028bd69f7?w=800&h=500&fit=crop"],
    "behaviorTags": ["familia"],
    "conteudoPendente": true,
    "etapaA": true
  }'::jsonb,
  'active', 100
),
(
  'hotels', 'golden-dolphin-supreme', 'Golden Dolphin Supreme',
  'Apto 409 Golden Dolphin Supreme — linha Premium.',
  '["https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=800&h=500&fit=crop"]'::jsonb,
  '{
    "price": 405,
    "location": "Caldas Novas, GO",
    "maxGuests": 4,
    "features": ["Premium", "Varanda"],
    "images": ["https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=800&h=500&fit=crop"],
    "behaviorTags": ["casal", "familia"],
    "premiumLabel": "Supreme",
    "conteudoPendente": true,
    "etapaA": true
  }'::jsonb,
  'active', 110
)
ON CONFLICT (page_type, content_id) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  images = EXCLUDED.images,
  metadata = EXCLUDED.metadata,
  status = 'active',
  order_index = EXCLUDED.order_index;

-- 3) Ligar empreendimentos.website_content_id (quando a linha existir)
UPDATE empreendimentos e
SET website_content_id = wc.content_id
FROM website_content wc
WHERE wc.page_type = 'hotels'
  AND wc.content_id = e.hotel_id
  AND wc.content_id IN (
    'atrium-thermas', 'lacqua-diroma', 'a-guas-da-fonte', 'aldeia-do-lago',
    'alta-vista-thermas', 'aquarius-residence', 'priva-das-thermas-i',
    'diroma-fiori', 'sol-das-caldas', 'diroma-acqua-park', 'golden-dolphin-supreme'
  );
