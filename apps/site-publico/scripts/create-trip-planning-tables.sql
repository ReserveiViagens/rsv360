-- ✅ TABELAS PARA PLANEJAMENTO DE VIAGEM COLABORATIVO

-- Tabela de planos de viagem
CREATE TABLE IF NOT EXISTS trip_plans (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  destination VARCHAR(255) NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  budget DECIMAL(10, 2),
  currency VARCHAR(10) DEFAULT 'BRL',
  status VARCHAR(20) DEFAULT 'planning' CHECK (status IN ('planning', 'confirmed', 'in_progress', 'completed', 'cancelled')),
  created_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_trip_plans_created_by ON trip_plans(created_by);
CREATE INDEX idx_trip_plans_status ON trip_plans(status);

-- Tabela de membros do plano
CREATE TABLE IF NOT EXISTS trip_members (
  id SERIAL PRIMARY KEY,
  trip_id INTEGER NOT NULL REFERENCES trip_plans(id) ON DELETE CASCADE,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  email VARCHAR(255),
  name VARCHAR(255),
  role VARCHAR(20) DEFAULT 'member' CHECK (role IN ('organizer', 'member', 'viewer')),
  responsibilities TEXT[],
  joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(trip_id, COALESCE(user_id::text, email))
);

CREATE INDEX idx_trip_members_trip ON trip_members(trip_id);
CREATE INDEX idx_trip_members_user ON trip_members(user_id);

-- Tabela de tarefas
CREATE TABLE IF NOT EXISTS trip_tasks (
  id SERIAL PRIMARY KEY,
  trip_id INTEGER NOT NULL REFERENCES trip_plans(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  assigned_to INTEGER REFERENCES users(id) ON DELETE SET NULL,
  assigned_to_email VARCHAR(255),
  status VARCHAR(20) DEFAULT 'todo' CHECK (status IN ('todo', 'in_progress', 'completed', 'cancelled')),
  priority VARCHAR(20) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  due_date DATE,
  completed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_trip_tasks_trip ON trip_tasks(trip_id);
CREATE INDEX idx_trip_tasks_assigned ON trip_tasks(assigned_to);
CREATE INDEX idx_trip_tasks_status ON trip_tasks(status);

-- Tabela de itinerário
CREATE TABLE IF NOT EXISTS trip_itinerary (
  id SERIAL PRIMARY KEY,
  trip_id INTEGER NOT NULL REFERENCES trip_plans(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  time TIME,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  location VARCHAR(255),
  type VARCHAR(20) DEFAULT 'activity' CHECK (type IN ('accommodation', 'activity', 'transport', 'meal', 'other')),
  cost DECIMAL(10, 2),
  booked BOOLEAN DEFAULT false,
  booking_reference VARCHAR(255),
  created_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_trip_itinerary_trip ON trip_itinerary(trip_id);
CREATE INDEX idx_trip_itinerary_date ON trip_itinerary(date);

-- Tabela de despesas
CREATE TABLE IF NOT EXISTS trip_expenses (
  id SERIAL PRIMARY KEY,
  trip_id INTEGER NOT NULL REFERENCES trip_plans(id) ON DELETE CASCADE,
  category VARCHAR(50) NOT NULL CHECK (category IN ('accommodation', 'transport', 'food', 'activities', 'shopping', 'other')),
  description VARCHAR(255) NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  currency VARCHAR(10) DEFAULT 'BRL',
  paid_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
  paid_by_email VARCHAR(255),
  shared BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_trip_expenses_trip ON trip_expenses(trip_id);
CREATE INDEX idx_trip_expenses_paid_by ON trip_expenses(paid_by);

-- Tabela de divisão de despesas
CREATE TABLE IF NOT EXISTS trip_expense_splits (
  id SERIAL PRIMARY KEY,
  expense_id INTEGER NOT NULL REFERENCES trip_expenses(id) ON DELETE CASCADE,
  participant_id INTEGER REFERENCES trip_members(id) ON DELETE CASCADE,
  amount DECIMAL(10, 2) NOT NULL,
  paid BOOLEAN DEFAULT false,
  paid_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_trip_expense_splits_expense ON trip_expense_splits(expense_id);
CREATE INDEX idx_trip_expense_splits_participant ON trip_expense_splits(participant_id);

