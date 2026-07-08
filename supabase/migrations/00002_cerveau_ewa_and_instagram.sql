-- Migration : Cerveau EWA + tables d'audit Instagram pour template EWA App
-- Supabase : yfeutiagwgbrsbncmixx
-- Objectif : rendre l'app autonome avec un Cerveau EWA alimenté par les sources internes

-- ============================================
-- 1. Table de connaissances (Cerveau EWA)
-- ============================================

CREATE TABLE IF NOT EXISTS knowledge_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'autre',
  subcategory TEXT NOT NULL DEFAULT 'autre',
  source TEXT NOT NULL DEFAULT 'manual',
  sources JSONB DEFAULT '{}',
  metadata JSONB DEFAULT '{}',
  client_id UUID REFERENCES clients(id) ON DELETE SET NULL,
  editor_id UUID REFERENCES editors(id) ON DELETE SET NULL,
  original_id TEXT,
  original_table TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

COMMENT ON TABLE knowledge_entries IS 'Base de connaissances interne du Cerveau EWA';
COMMENT ON COLUMN knowledge_entries.category IS 'Catégorie principale (montage, scripting, audit-profil, etc.)';
COMMENT ON COLUMN knowledge_entries.subcategory IS 'Alias de category pour compatibilité UI originale';
COMMENT ON COLUMN knowledge_entries.source IS 'Source de la connaissance : loom, formation, script, manual, whatsapp, instagram_audit';
COMMENT ON COLUMN knowledge_entries.sources IS 'Compteurs par source pour le dashboard';
COMMENT ON COLUMN knowledge_entries.metadata IS 'Contexte spécifique (URL Loom, vidéo YouTube, téléphone WhatsApp, etc.)';
COMMENT ON COLUMN knowledge_entries.original_id IS 'ID dans la table source (ex: waha_message_id, playbook_id)';
COMMENT ON COLUMN knowledge_entries.original_table IS 'Nom de la table source (ex: whatsapp_messages, playbooks)';

CREATE INDEX IF NOT EXISTS idx_knowledge_entries_category ON knowledge_entries(category);
CREATE INDEX IF NOT EXISTS idx_knowledge_entries_subcategory ON knowledge_entries(subcategory);
CREATE INDEX IF NOT EXISTS idx_knowledge_entries_source ON knowledge_entries(source);
CREATE INDEX IF NOT EXISTS idx_knowledge_entries_client_id ON knowledge_entries(client_id);
CREATE INDEX IF NOT EXISTS idx_knowledge_entries_original ON knowledge_entries(original_table, original_id);

-- Recherche textuelle simple (full-text search en français)
CREATE INDEX IF NOT EXISTS idx_knowledge_entries_fts
  ON knowledge_entries
  USING gin(to_tsvector('french', coalesce(title, '') || ' ' || coalesce(content, '')));

-- ============================================
-- 2. Tables Instagram / Audit (pour futur Recherche IG)
-- ============================================

CREATE TABLE IF NOT EXISTS instagram_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  handle TEXT UNIQUE NOT NULL,
  display_name TEXT,
  bio TEXT,
  category TEXT DEFAULT 'prospect', -- client / prospect / concurrent / inspiration
  followers BIGINT,
  following BIGINT,
  posts_count INT,
  external_url TEXT,
  business_category TEXT,
  is_verified BOOLEAN DEFAULT false,
  profile_pic_url TEXT,
  scraped_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  tags TEXT[] DEFAULT '{}',
  notes TEXT,
  saved BOOLEAN DEFAULT false,
  client_id UUID REFERENCES clients(id) ON DELETE SET NULL,
  raw_profile JSONB DEFAULT '{}'
);

COMMENT ON TABLE instagram_accounts IS 'Comptes Instagram suivis pour la veille et les audits';

CREATE INDEX IF NOT EXISTS idx_instagram_accounts_handle ON instagram_accounts(handle);
CREATE INDEX IF NOT EXISTS idx_instagram_accounts_category ON instagram_accounts(category);
CREATE INDEX IF NOT EXISTS idx_instagram_accounts_client_id ON instagram_accounts(client_id);

CREATE TABLE IF NOT EXISTS instagram_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id UUID REFERENCES instagram_accounts(id) ON DELETE CASCADE,
  external_id TEXT,
  type TEXT, -- reel / carousel / image / video
  short_code TEXT,
  caption TEXT,
  hashtags TEXT[] DEFAULT '{}',
  mentions TEXT[] DEFAULT '{}',
  likes_count INT,
  comments_count INT,
  views_count INT,
  plays_count INT,
  duration_seconds INT,
  transcript TEXT,
  video_url TEXT,
  display_url TEXT,
  timestamp TIMESTAMPTZ,
  music_info JSONB DEFAULT '{}',
  tagged_users JSONB DEFAULT '{}',
  raw_post JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(account_id, external_id)
);

COMMENT ON TABLE instagram_posts IS 'Posts et reels scrapés pour les audits Instagram';

CREATE INDEX IF NOT EXISTS idx_instagram_posts_account_id ON instagram_posts(account_id);
CREATE INDEX IF NOT EXISTS idx_instagram_posts_type ON instagram_posts(type);

CREATE TABLE IF NOT EXISTS instagram_audits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id UUID REFERENCES instagram_accounts(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'pending', -- pending / completed / failed
  score_profile INT,
  score_content INT,
  score_engagement INT,
  score_conversion INT,
  score_overall INT,
  swot JSONB DEFAULT '{}',
  recommendations JSONB DEFAULT '{}',
  best_practices JSONB DEFAULT '{}',
  benchmark JSONB DEFAULT '{}',
  raw_report TEXT,
  model_used TEXT,
  generated_at TIMESTAMPTZ DEFAULT now()
);

COMMENT ON TABLE instagram_audits IS 'Audits générés par IA pour les comptes Instagram';

CREATE INDEX IF NOT EXISTS idx_instagram_audits_account_id ON instagram_audits(account_id);

-- ============================================
-- 3. Trigger updated_at automatique
-- ============================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_knowledge_entries_updated_at ON knowledge_entries;
CREATE TRIGGER update_knowledge_entries_updated_at
  BEFORE UPDATE ON knowledge_entries
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
