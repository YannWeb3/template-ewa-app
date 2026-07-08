-- Migration : enrichir observatoire_messages pour en faire la source principale de l'Observatoire WhatsApp
-- Supabase : yfeutiagwgbrsbncmixx
-- Objectif : stocker tous les messages WhatsApp classés automatiquement par n8n, et devenir la source unique quand le Supabase client ne sera plus accessible.

-- Supprimer les anciennes contraintes si besoin (les données mockées existantes seront conservées)
ALTER TABLE observatoire_messages
  ADD COLUMN IF NOT EXISTS message_id UUID,
  ADD COLUMN IF NOT EXISTS phone TEXT,
  ADD COLUMN IF NOT EXISTS push_name TEXT NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS direction TEXT NOT NULL DEFAULT 'INBOUND' CHECK (direction IN ('INBOUND', 'OUTBOUND')),
  ADD COLUMN IF NOT EXISTS body TEXT NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS transcript TEXT,
  ADD COLUMN IF NOT EXISTS media_type TEXT NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS media_url TEXT NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS is_group BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS group_id TEXT NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS raw_payload JSONB,
  ADD COLUMN IF NOT EXISTS client_id UUID,
  ADD COLUMN IF NOT EXISTS source TEXT NOT NULL DEFAULT 'whatsapp' CHECK (source IN ('whatsapp', 'manual')),
  ADD COLUMN IF NOT EXISTS notes TEXT NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS priority TEXT NOT NULL DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'critical')),
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT now();

-- Renommer la colonne status en old_status temporairement si elle existe déjà avec des valeurs anciennes
-- Puis ajuster les valeurs existantes vers les nouveaux statuts
UPDATE observatoire_messages
SET status = CASE
  WHEN status = 'PENDING' THEN 'pending'
  WHEN status = 'VALIDATED' THEN 'validated'
  WHEN status = 'RED' THEN 'red'
  ELSE 'pending'
END
WHERE status IN ('PENDING', 'VALIDATED', 'RED');

-- S'assurer que les nouvelles valeurs de status sont acceptées
ALTER TABLE observatoire_messages
  DROP CONSTRAINT IF EXISTS observatoire_messages_status_check,
  ADD CONSTRAINT observatoire_messages_status_check
  CHECK (status IN ('pending', 'validated', 'red', 'resolved', 'in_progress'));

-- Index pour les performances
CREATE INDEX IF NOT EXISTS idx_observatoire_messages_message_id ON observatoire_messages(message_id);
CREATE INDEX IF NOT EXISTS idx_observatoire_messages_phone ON observatoire_messages(phone);
CREATE INDEX IF NOT EXISTS idx_observatoire_messages_status ON observatoire_messages(status);
CREATE INDEX IF NOT EXISTS idx_observatoire_messages_priority ON observatoire_messages(priority);
CREATE INDEX IF NOT EXISTS idx_observatoire_messages_source ON observatoire_messages(source);
CREATE INDEX IF NOT EXISTS idx_observatoire_messages_created_at ON observatoire_messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_observatoire_messages_search ON observatoire_messages USING gin(to_tsvector('french', coalesce(group_name, '') || ' ' || coalesce(sender, '') || ' ' || coalesce(content, '') || ' ' || coalesce(body, '') || ' ' || coalesce(transcript, '')));

-- Trigger updated_at automatique
CREATE OR REPLACE FUNCTION update_observatoire_messages_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_observatoire_messages_updated_at_trigger ON observatoire_messages;
CREATE TRIGGER update_observatoire_messages_updated_at_trigger
  BEFORE UPDATE ON observatoire_messages
  FOR EACH ROW
  EXECUTE FUNCTION update_observatoire_messages_updated_at();

-- S'assurer que les 8 entrées existantes restent cohérentes
UPDATE observatoire_messages
SET body = COALESCE(body, content),
    push_name = COALESCE(push_name, sender),
    phone = COALESCE(phone, '')
WHERE body = '' AND content IS NOT NULL;
