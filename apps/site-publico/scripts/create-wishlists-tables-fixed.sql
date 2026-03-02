-- TABELAS DE WISHLISTS COMPARTILHADAS
-- Criar tabelas para wishlists compartilhadas

-- 1. Tabela principal de wishlists
CREATE TABLE IF NOT EXISTS shared_wishlists (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  creator_id INTEGER,
  is_public BOOLEAN DEFAULT false,
  share_token VARCHAR(255) UNIQUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_wishlists_creator ON shared_wishlists(creator_id);
CREATE INDEX IF NOT EXISTS idx_wishlists_token ON shared_wishlists(share_token);
CREATE INDEX IF NOT EXISTS idx_wishlists_public ON shared_wishlists(is_public);

-- 2. Membros da wishlist
CREATE TABLE IF NOT EXISTS wishlist_members (
  id SERIAL PRIMARY KEY,
  wishlist_id INTEGER NOT NULL REFERENCES shared_wishlists(id) ON DELETE CASCADE,
  user_id INTEGER,
  email VARCHAR(255),
  role VARCHAR(20) DEFAULT 'member' CHECK (role IN ('owner', 'admin', 'member', 'viewer')),
  can_add BOOLEAN DEFAULT true,
  can_vote BOOLEAN DEFAULT true,
  can_invite BOOLEAN DEFAULT false,
  joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_wishlist_members_wishlist ON wishlist_members(wishlist_id);
CREATE INDEX IF NOT EXISTS idx_wishlist_members_user ON wishlist_members(user_id);
CREATE INDEX IF NOT EXISTS idx_wishlist_members_email ON wishlist_members(email);

-- 3. Items da wishlist
CREATE TABLE IF NOT EXISTS wishlist_items (
  id SERIAL PRIMARY KEY,
  wishlist_id INTEGER NOT NULL REFERENCES shared_wishlists(id) ON DELETE CASCADE,
  item_id INTEGER NOT NULL,
  item_type VARCHAR(50) DEFAULT 'property',
  added_by INTEGER,
  notes TEXT,
  check_in DATE,
  check_out DATE,
  guests INTEGER DEFAULT 2,
  estimated_price DECIMAL(10,2),
  votes_up INTEGER DEFAULT 0,
  votes_down INTEGER DEFAULT 0,
  votes_maybe INTEGER DEFAULT 0,
  added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(wishlist_id, item_id, item_type)
);

CREATE INDEX IF NOT EXISTS idx_wishlist_items_wishlist ON wishlist_items(wishlist_id);
CREATE INDEX IF NOT EXISTS idx_wishlist_items_item ON wishlist_items(item_id, item_type);
CREATE INDEX IF NOT EXISTS idx_wishlist_items_added_by ON wishlist_items(added_by);

-- 4. Votos (Sistema de Votacao)
CREATE TABLE IF NOT EXISTS wishlist_votes (
  id SERIAL PRIMARY KEY,
  item_id INTEGER NOT NULL REFERENCES wishlist_items(id) ON DELETE CASCADE,
  user_id INTEGER,
  email VARCHAR(255),
  vote VARCHAR(10) CHECK (vote IN ('up', 'down', 'maybe')),
  comment TEXT,
  voted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_wishlist_votes_item ON wishlist_votes(item_id);
CREATE INDEX IF NOT EXISTS idx_wishlist_votes_user ON wishlist_votes(user_id);
CREATE INDEX IF NOT EXISTS idx_wishlist_votes_email ON wishlist_votes(email);

-- Trigger para atualizar contadores de votos automaticamente
CREATE OR REPLACE FUNCTION update_wishlist_item_votes()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE wishlist_items
  SET 
    votes_up = (
      SELECT COUNT(*) FROM wishlist_votes 
      WHERE item_id = NEW.item_id AND vote = 'up'
    ),
    votes_down = (
      SELECT COUNT(*) FROM wishlist_votes 
      WHERE item_id = NEW.item_id AND vote = 'down'
    ),
    votes_maybe = (
      SELECT COUNT(*) FROM wishlist_votes 
      WHERE item_id = NEW.item_id AND vote = 'maybe'
    )
  WHERE id = NEW.item_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_vote_counts
AFTER INSERT OR UPDATE OR DELETE ON wishlist_votes
FOR EACH ROW
EXECUTE FUNCTION update_wishlist_item_votes();

