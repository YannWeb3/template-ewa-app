-- Migration : statuts et notes des messages WhatsApp côté template EWA App
-- Supabase : yfeutiagwgbrsbncmixx
-- Objectif : stocker les statuts de traitement des messages sans toucher au Supabase client

CREATE TABLE IF NOT EXISTS whatsapp_message_status (
  message_id UUID PRIMARY KEY,
  status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'in_progress', 'resolved')),
  notes TEXT NOT NULL DEFAULT '',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE whatsapp_message_status IS 'Statuts de traitement des messages WhatsApp du Supabase client (lecture seule). La clé message_id correspond à whatsapp_messages.id côté client.';

CREATE INDEX IF NOT EXISTS idx_whatsapp_message_status ON whatsapp_message_status(status);
CREATE INDEX IF NOT EXISTS idx_whatsapp_message_status_updated_at ON whatsapp_message_status(updated_at DESC);

-- Row Level Security : seul le service role du template a un accès complet
ALTER TABLE whatsapp_message_status ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role full access on whatsapp_message_status"
  ON whatsapp_message_status FOR ALL TO service_role
  USING (true) WITH CHECK (true);

CREATE POLICY "Authenticated users can manage whatsapp_message_status"
  ON whatsapp_message_status FOR ALL TO authenticated
  USING (true) WITH CHECK (true);
