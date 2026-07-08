-- Table de stockage des messages WhatsApp (lecture seule, via l'app)
CREATE TABLE IF NOT EXISTS whatsapp_messages (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  waha_message_id TEXT NOT NULL UNIQUE,
  phone TEXT NOT NULL,
  push_name TEXT NOT NULL DEFAULT '',
  direction TEXT NOT NULL CHECK (direction IN ('INBOUND', 'OUTBOUND')),
  body TEXT NOT NULL DEFAULT '',
  is_group BOOLEAN NOT NULL DEFAULT false,
  group_id TEXT NOT NULL DEFAULT '',
  media_type TEXT NOT NULL DEFAULT '',
  media_url TEXT NOT NULL DEFAULT '',
  raw_payload JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_whatsapp_messages_phone ON whatsapp_messages (phone);
CREATE INDEX IF NOT EXISTS idx_whatsapp_messages_created_at ON whatsapp_messages (created_at DESC);

-- Table de la liste rouge (numéros à ignorer)
CREATE TABLE IF NOT EXISTS whatsapp_blacklist (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  phone TEXT NOT NULL UNIQUE,
  label TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Row Level Security
ALTER TABLE whatsapp_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE whatsapp_blacklist ENABLE ROW LEVEL SECURITY;

-- Politiques : seul le service role peut écrire/lire
CREATE POLICY "Service role full access on whatsapp_messages"
  ON whatsapp_messages FOR ALL TO service_role
  USING (true) WITH CHECK (true);

CREATE POLICY "Service role full access on whatsapp_blacklist"
  ON whatsapp_blacklist FOR ALL TO service_role
  USING (true) WITH CHECK (true);

CREATE POLICY "Authenticated users can read blacklist"
  ON whatsapp_blacklist FOR SELECT TO authenticated
  USING (true);
