-- Migration 009: Criar tabelas de Voice Commerce
-- Data: 22/01/2025
-- Descrição: Criação das tabelas para vendas por voz com Twilio e GPT-4o

-- Tabela de sessões de voice commerce
CREATE TABLE IF NOT EXISTS voice_commerce_sessions (
  id SERIAL PRIMARY KEY,
  session_id VARCHAR(255) NOT NULL UNIQUE, -- ID da sessão do Twilio
  customer_id INTEGER REFERENCES customers(id) ON DELETE SET NULL,
  phone_number VARCHAR(50) NOT NULL,
  enterprise_id INTEGER REFERENCES enterprises(id) ON DELETE SET NULL,
  property_id INTEGER REFERENCES properties(id) ON DELETE SET NULL,
  status VARCHAR(50) DEFAULT 'active', -- active, completed, abandoned, failed
  intent VARCHAR(100), -- booking, inquiry, support, etc.
  language VARCHAR(10) DEFAULT 'pt-BR',
  started_at TIMESTAMP DEFAULT NOW(),
  ended_at TIMESTAMP,
  duration_seconds INTEGER,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_voice_commerce_sessions_session_id ON voice_commerce_sessions(session_id);
CREATE INDEX IF NOT EXISTS idx_voice_commerce_sessions_customer_id ON voice_commerce_sessions(customer_id);
CREATE INDEX IF NOT EXISTS idx_voice_commerce_sessions_phone_number ON voice_commerce_sessions(phone_number);
CREATE INDEX IF NOT EXISTS idx_voice_commerce_sessions_enterprise_id ON voice_commerce_sessions(enterprise_id);
CREATE INDEX IF NOT EXISTS idx_voice_commerce_sessions_status ON voice_commerce_sessions(status);
CREATE INDEX IF NOT EXISTS idx_voice_commerce_sessions_started_at ON voice_commerce_sessions(started_at DESC);

-- Tabela de chamadas de voice commerce
CREATE TABLE IF NOT EXISTS voice_commerce_calls (
  id SERIAL PRIMARY KEY,
  session_id INTEGER NOT NULL REFERENCES voice_commerce_sessions(id) ON DELETE CASCADE,
  call_sid VARCHAR(255) NOT NULL UNIQUE, -- SID da chamada do Twilio
  direction VARCHAR(50) NOT NULL, -- inbound, outbound
  from_number VARCHAR(50) NOT NULL,
  to_number VARCHAR(50) NOT NULL,
  status VARCHAR(50) DEFAULT 'initiated', -- initiated, ringing, in-progress, completed, failed, busy, no-answer
  duration_seconds INTEGER,
  recording_url TEXT, -- URL da gravação (se gravada e com consentimento)
  transcription TEXT, -- Transcrição da chamada
  gpt_response TEXT, -- Resposta do GPT-4o
  intent_detected VARCHAR(100),
  entities_extracted JSONB, -- Entidades extraídas (datas, destinos, etc.)
  booking_created BOOLEAN DEFAULT false,
  booking_id INTEGER REFERENCES bookings(id) ON DELETE SET NULL,
  conversion_value DECIMAL(10,2), -- Valor da conversão (se houver)
  started_at TIMESTAMP DEFAULT NOW(),
  ended_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_voice_commerce_calls_session_id ON voice_commerce_calls(session_id);
CREATE INDEX IF NOT EXISTS idx_voice_commerce_calls_call_sid ON voice_commerce_calls(call_sid);
CREATE INDEX IF NOT EXISTS idx_voice_commerce_calls_direction ON voice_commerce_calls(direction);
CREATE INDEX IF NOT EXISTS idx_voice_commerce_calls_status ON voice_commerce_calls(status);
CREATE INDEX IF NOT EXISTS idx_voice_commerce_calls_booking_id ON voice_commerce_calls(booking_id);
CREATE INDEX IF NOT EXISTS idx_voice_commerce_calls_started_at ON voice_commerce_calls(started_at DESC);

-- Tabela de interações de voice commerce (turnos de conversa)
CREATE TABLE IF NOT EXISTS voice_commerce_interactions (
  id SERIAL PRIMARY KEY,
  call_id INTEGER NOT NULL REFERENCES voice_commerce_calls(id) ON DELETE CASCADE,
  turn_number INTEGER NOT NULL, -- Número do turno na conversa
  speaker VARCHAR(50) NOT NULL, -- user, assistant
  user_input TEXT, -- Input do usuário (transcrição)
  assistant_response TEXT, -- Resposta do assistente (GPT-4o)
  intent VARCHAR(100),
  confidence DECIMAL(5,2), -- Confiança da detecção de intenção (0-100)
  entities JSONB, -- Entidades extraídas neste turno
  created_at TIMESTAMP DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_voice_commerce_interactions_call_id ON voice_commerce_interactions(call_id);
CREATE INDEX IF NOT EXISTS idx_voice_commerce_interactions_turn_number ON voice_commerce_interactions(call_id, turn_number);
CREATE INDEX IF NOT EXISTS idx_voice_commerce_interactions_speaker ON voice_commerce_interactions(speaker);
CREATE INDEX IF NOT EXISTS idx_voice_commerce_interactions_created_at ON voice_commerce_interactions(created_at DESC);

-- Triggers para atualizar updated_at automaticamente
CREATE TRIGGER update_voice_commerce_sessions_updated_at BEFORE UPDATE ON voice_commerce_sessions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_voice_commerce_calls_updated_at BEFORE UPDATE ON voice_commerce_calls
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Comentários nas tabelas
COMMENT ON TABLE voice_commerce_sessions IS 'Tabela de sessões de voice commerce';
COMMENT ON TABLE voice_commerce_calls IS 'Tabela de chamadas de voice commerce com Twilio e GPT-4o';
COMMENT ON TABLE voice_commerce_interactions IS 'Tabela de interações (turnos) de voice commerce';
