-- PR 24: eventos de analytics do roteiro cinematográfico (scroll/dwell por seção)
CREATE TABLE IF NOT EXISTS roteiro_analytics_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  proposta_token text NOT NULL,
  session_id text NOT NULL,
  event_type varchar(50) NOT NULL,
  section varchar(20),
  value_ms integer,
  scroll_pct smallint,
  meta jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_roteiro_analytics_token_created
  ON roteiro_analytics_events (proposta_token, created_at);

CREATE INDEX IF NOT EXISTS idx_roteiro_analytics_event_type
  ON roteiro_analytics_events (event_type);
