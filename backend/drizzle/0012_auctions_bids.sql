-- Fase 5 coexistência — leilões centralizados (:3002)
CREATE TABLE IF NOT EXISTS auctions (
  id SERIAL PRIMARY KEY,
  enterprise_id INTEGER,
  property_id INTEGER,
  accommodation_id INTEGER,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  start_price DECIMAL(10, 2) NOT NULL,
  current_price DECIMAL(10, 2) NOT NULL,
  min_increment DECIMAL(10, 2) NOT NULL DEFAULT 10.00,
  reserve_price DECIMAL(10, 2),
  start_date TIMESTAMP NOT NULL,
  end_date TIMESTAMP NOT NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'scheduled',
  winner_id INTEGER,
  winner_bid_id INTEGER,
  latitude DECIMAL(10, 7),
  longitude DECIMAL(10, 7),
  image_url TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS idx_auctions_status ON auctions(status);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS idx_auctions_start_date ON auctions(start_date);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS idx_auctions_end_date ON auctions(end_date);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS idx_auctions_enterprise_id ON auctions(enterprise_id);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS bids (
  id SERIAL PRIMARY KEY,
  auction_id INTEGER NOT NULL REFERENCES auctions(id) ON DELETE CASCADE,
  customer_id INTEGER NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS idx_bids_auction_id ON bids(auction_id);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS idx_bids_customer_id ON bids(customer_id);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS idx_bids_created_at ON bids(created_at DESC);
