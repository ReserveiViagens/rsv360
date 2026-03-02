-- =====================================================
-- Migration: Dados de Exemplo - The Global Route Exchange
-- =====================================================
-- Este script cria dados de exemplo para testar o sistema
-- =====================================================

-- 1. Criar Mercados de Destinos (Markets)
INSERT INTO route_exchange_markets (destination_code, destination_name, country, region, category, base_currency, status, metadata)
VALUES
  ('PAR', 'Paris', 'França', 'Europa', 'package', 'BRL', 'active', '{"clima": "temperado", "idioma": "francês", "moeda": "EUR", "visto": "não necessário para brasileiros"}'),
  ('TYO', 'Tóquio', 'Japão', 'Ásia', 'package', 'BRL', 'active', '{"clima": "temperado", "idioma": "japonês", "moeda": "JPY", "visto": "não necessário para brasileiros"}'),
  ('DXB', 'Dubai', 'Emirados Árabes', 'Oriente Médio', 'package', 'BRL', 'active', '{"clima": "desértico", "idioma": "árabe/inglês", "moeda": "AED", "visto": "não necessário para brasileiros"}'),
  ('NYC', 'Nova York', 'Estados Unidos', 'América do Norte', 'package', 'BRL', 'active', '{"clima": "temperado", "idioma": "inglês", "moeda": "USD", "visto": "necessário"}'),
  ('ROM', 'Roma', 'Itália', 'Europa', 'package', 'BRL', 'active', '{"clima": "mediterrâneo", "idioma": "italiano", "moeda": "EUR", "visto": "não necessário para brasileiros"}'),
  ('LON', 'Londres', 'Reino Unido', 'Europa', 'package', 'BRL', 'active', '{"clima": "temperado oceânico", "idioma": "inglês", "moeda": "GBP", "visto": "não necessário para brasileiros"}'),
  ('RIO', 'Rio de Janeiro', 'Brasil', 'América do Sul', 'package', 'BRL', 'active', '{"clima": "tropical", "idioma": "português", "moeda": "BRL", "visto": "não necessário"}'),
  ('BCN', 'Barcelona', 'Espanha', 'Europa', 'package', 'BRL', 'active', '{"clima": "mediterrâneo", "idioma": "espanhol", "moeda": "EUR", "visto": "não necessário para brasileiros"}')
ON CONFLICT (destination_code) DO NOTHING;

-- 2. Criar alguns Bids de Exemplo (Ordens de Compra)
-- Nota: user_id será substituído por UUIDs reais quando houver usuários no sistema
-- Por enquanto, usamos UUIDs de exemplo

-- Bid para Paris (viajante querendo comprar)
INSERT INTO route_bids (
  market_id,
  user_id,
  bid_type,
  bid_price,
  quantity,
  travel_dates,
  requirements,
  status,
  expires_at
)
SELECT 
  m.id,
  '00000000-0000-0000-0000-000000000001'::uuid, -- User ID de exemplo
  'market',
  8500.00,
  2,
  '{"check_in": "2026-06-15", "check_out": "2026-06-22", "flexible": false}'::jsonb,
  '{"hotel_stars": 4, "breakfast": true, "transfer": true}'::jsonb,
  'active',
  NOW() + INTERVAL '30 days'
FROM route_exchange_markets m
WHERE m.destination_code = 'PAR'
LIMIT 1;

-- Bid para Tóquio
INSERT INTO route_bids (
  market_id,
  user_id,
  bid_type,
  bid_price,
  quantity,
  travel_dates,
  requirements,
  status,
  expires_at
)
SELECT 
  m.id,
  '00000000-0000-0000-0000-000000000002'::uuid,
  'limit',
  12000.00,
  1,
  '{"check_in": "2026-07-01", "check_out": "2026-07-10", "flexible": true}'::jsonb,
  '{"hotel_stars": 5, "breakfast": true, "wifi": true}'::jsonb,
  'active',
  NOW() + INTERVAL '45 days'
FROM route_exchange_markets m
WHERE m.destination_code = 'TYO'
LIMIT 1;

-- 3. Criar alguns Asks de Exemplo (Ordens de Venda - Fornecedores)
-- Ask para Paris (fornecedor oferecendo)
INSERT INTO route_asks (
  market_id,
  supplier_id,
  ask_type,
  ask_price,
  quantity,
  availability_dates,
  supplier_info,
  status,
  expires_at
)
SELECT 
  m.id,
  '00000000-0000-0000-0000-000000000010'::uuid, -- Supplier ID de exemplo
  'market',
  8000.00,
  2,
  '{"start": "2026-06-01", "end": "2026-06-30", "available_ranges": [{"start": "2026-06-15", "end": "2026-06-22"}]}'::jsonb,
  '{"rating": 4.8, "certifications": ["ABNT", "ISO"], "years_experience": 10}'::jsonb,
  'active',
  NOW() + INTERVAL '60 days'
FROM route_exchange_markets m
WHERE m.destination_code = 'PAR'
LIMIT 1;

-- Ask para Tóquio
INSERT INTO route_asks (
  market_id,
  supplier_id,
  ask_type,
  ask_price,
  quantity,
  availability_dates,
  supplier_info,
  status,
  expires_at
)
SELECT 
  m.id,
  '00000000-0000-0000-0000-000000000011'::uuid,
  'market',
  11500.00,
  1,
  '{"start": "2026-07-01", "end": "2026-07-31", "available_ranges": [{"start": "2026-07-01", "end": "2026-07-10"}]}'::jsonb,
  '{"rating": 4.9, "certifications": ["ABNT"], "years_experience": 15}'::jsonb,
  'active',
  NOW() + INTERVAL '60 days'
FROM route_exchange_markets m
WHERE m.destination_code = 'TYO'
LIMIT 1;

-- 4. Criar um RFP de Exemplo (Request for Proposal)
INSERT INTO route_rfps (
  client_id,
  title,
  description,
  destination_code,
  travel_dates,
  requirements,
  budget_range,
  participants_count,
  category,
  status,
  bidding_deadline,
  auto_attach_requirements
)
VALUES (
  '00000000-0000-0000-0000-000000000020'::uuid, -- Client ID de exemplo
  'Viagem Corporativa para Dubai - 50 Funcionários',
  'Necessitamos de pacote completo para 50 funcionários em Dubai, incluindo hospedagem, traslados e algumas atividades corporativas.',
  'DXB',
  '{"check_in": "2026-10-01", "check_out": "2026-10-05", "flexible": false}'::jsonb,
  '{"hotel_stars": 5, "meeting_rooms": 2, "breakfast": true, "transfer": true, "wifi": true, "insurance": true}'::jsonb,
  '{"min": 150000.00, "max": 200000.00}'::jsonb,
  50,
  'corporate',
  'open',
  NOW() + INTERVAL '30 days',
  true
);

-- 5. Criar Histórico de Preços de Exemplo (para gráficos de candlesticks)
-- Histórico para Paris (últimos 7 dias)
INSERT INTO route_price_history (
  market_id,
  period_start,
  period_type,
  open_price,
  high_price,
  low_price,
  close_price,
  volume,
  total_value
)
SELECT 
  m.id,
  date_trunc('day', NOW() - INTERVAL '7 days' + (n || ' days')::interval),
  'day',
  8000.00 + (random() * 1000),
  8500.00 + (random() * 1000),
  7500.00 + (random() * 1000),
  8200.00 + (random() * 1000),
  floor(random() * 10 + 1)::integer,
  (8000.00 + (random() * 1000)) * floor(random() * 10 + 1)::integer
FROM route_exchange_markets m
CROSS JOIN generate_series(0, 6) n
WHERE m.destination_code = 'PAR'
LIMIT 1;

-- 6. Mensagem de confirmação
DO $$
BEGIN
  RAISE NOTICE '✅ Dados de exemplo criados com sucesso!';
  RAISE NOTICE '   - % mercados criados', (SELECT COUNT(*) FROM route_exchange_markets);
  RAISE NOTICE '   - % bids criados', (SELECT COUNT(*) FROM route_bids);
  RAISE NOTICE '   - % asks criados', (SELECT COUNT(*) FROM route_asks);
  RAISE NOTICE '   - % RFPs criados', (SELECT COUNT(*) FROM route_rfps);
  RAISE NOTICE '   - % registros de histórico criados', (SELECT COUNT(*) FROM route_price_history);
END $$;
