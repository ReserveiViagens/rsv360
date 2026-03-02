-- ✅ Migration 035: Criar tabelas de wishlists
-- Tabelas de listas de desejos para referências em outras migrations
-- Data: 2025-12-16
-- Deve ser executada antes de migration-017-complete-rsv-gen2-schema.sql

-- Tabela principal de wishlists compartilhadas
CREATE TABLE IF NOT EXISTS shared_wishlists (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  created_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
  is_public BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de membros da wishlist
CREATE TABLE IF NOT EXISTS wishlist_members (
  id SERIAL PRIMARY KEY,
  wishlist_id INTEGER NOT NULL REFERENCES shared_wishlists(id) ON DELETE CASCADE,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  email VARCHAR(255),
  role VARCHAR(20) DEFAULT 'member' CHECK (role IN ('owner', 'admin', 'member')),
  joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Constraints únicos com WHERE (usando índices parciais)
CREATE UNIQUE INDEX IF NOT EXISTS idx_unique_wishlist_member_user 
  ON wishlist_members(wishlist_id, user_id) 
  WHERE user_id IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS idx_unique_wishlist_member_email 
  ON wishlist_members(wishlist_id, email) 
  WHERE email IS NOT NULL;

-- Tabela de itens da wishlist
CREATE TABLE IF NOT EXISTS wishlist_items (
  id SERIAL PRIMARY KEY,
  wishlist_id INTEGER NOT NULL REFERENCES shared_wishlists(id) ON DELETE CASCADE,
  property_id INTEGER REFERENCES properties(id) ON DELETE CASCADE,
  item_name VARCHAR(255) NOT NULL,
  item_description TEXT,
  item_url VARCHAR(500),
  added_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
  votes_up INTEGER DEFAULT 0,
  votes_down INTEGER DEFAULT 0,
  votes_maybe INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de votos nos itens
CREATE TABLE IF NOT EXISTS wishlist_votes (
  id SERIAL PRIMARY KEY,
  item_id INTEGER NOT NULL REFERENCES wishlist_items(id) ON DELETE CASCADE,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  email VARCHAR(255),
  vote VARCHAR(10) NOT NULL CHECK (vote IN ('up', 'down', 'maybe')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Constraints únicos com WHERE (usando índices parciais)
CREATE UNIQUE INDEX IF NOT EXISTS idx_unique_wishlist_vote_user 
  ON wishlist_votes(item_id, user_id) 
  WHERE user_id IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS idx_unique_wishlist_vote_email 
  ON wishlist_votes(item_id, email) 
  WHERE email IS NOT NULL;

-- Índices
CREATE INDEX IF NOT EXISTS idx_wishlist_members_wishlist_id ON wishlist_members(wishlist_id);
CREATE INDEX IF NOT EXISTS idx_wishlist_members_user_id ON wishlist_members(user_id);
CREATE INDEX IF NOT EXISTS idx_wishlist_items_wishlist_id ON wishlist_items(wishlist_id);
CREATE INDEX IF NOT EXISTS idx_wishlist_items_property_id ON wishlist_items(property_id);
CREATE INDEX IF NOT EXISTS idx_wishlist_votes_item_id ON wishlist_votes(item_id);
CREATE INDEX IF NOT EXISTS idx_wishlist_votes_user_id ON wishlist_votes(user_id);

-- Trigger para atualizar contadores de votos
CREATE OR REPLACE FUNCTION update_wishlist_item_votes()
RETURNS TRIGGER AS $$
DECLARE
  target_item_id INTEGER;
BEGIN
  IF TG_OP = 'DELETE' THEN
    target_item_id := OLD.item_id;
  ELSE
    target_item_id := NEW.item_id;
  END IF;

  UPDATE wishlist_items
  SET 
    votes_up = (
      SELECT COUNT(*) FROM wishlist_votes 
      WHERE item_id = target_item_id AND vote = 'up'
    ),
    votes_down = (
      SELECT COUNT(*) FROM wishlist_votes 
      WHERE item_id = target_item_id AND vote = 'down'
    ),
    votes_maybe = (
      SELECT COUNT(*) FROM wishlist_votes 
      WHERE item_id = target_item_id AND vote = 'maybe'
    ),
    updated_at = CURRENT_TIMESTAMP
  WHERE id = target_item_id;
  
  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  ELSE
    RETURN NEW;
  END IF;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_vote_counts
AFTER INSERT OR UPDATE OR DELETE ON wishlist_votes
FOR EACH ROW
EXECUTE FUNCTION update_wishlist_item_votes();

-- Comentários
COMMENT ON TABLE shared_wishlists IS 'Tabela de listas de desejos compartilhadas';
COMMENT ON TABLE wishlist_members IS 'Membros das listas de desejos';
COMMENT ON TABLE wishlist_items IS 'Itens das listas de desejos';
COMMENT ON TABLE wishlist_votes IS 'Votos nos itens das listas de desejos';

