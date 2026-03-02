-- ✅ TABELA DE BUSCAS SALVAS
-- Permite que usuários salvem suas buscas favoritas

CREATE TABLE IF NOT EXISTS saved_searches (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL,
  name VARCHAR(255),
  filters JSONB NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_saved_searches_user ON saved_searches(user_id);
CREATE INDEX IF NOT EXISTS idx_saved_searches_created ON saved_searches(created_at);

-- Comentários
COMMENT ON TABLE saved_searches IS 'Buscas salvas pelos usuários';
COMMENT ON COLUMN saved_searches.filters IS 'Filtros da busca em formato JSON';

