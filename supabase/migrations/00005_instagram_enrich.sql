-- Migration : Enrichissement Instagram pour template EWA App
-- Supabase : yfeutiagwgbrsbncmixx
-- Objectif : ajouter les colonnes manquantes et index pour le pipeline Instagram/Audit

-- ============================================
-- 1. Ajout de colonnes manquantes à instagram_accounts
-- ============================================

ALTER TABLE instagram_accounts ADD COLUMN IF NOT EXISTS display_name TEXT;
ALTER TABLE instagram_accounts ADD COLUMN IF NOT EXISTS business_category TEXT;
ALTER TABLE instagram_accounts ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT false;
ALTER TABLE instagram_accounts ADD COLUMN IF NOT EXISTS scraped_at TIMESTAMPTZ;
ALTER TABLE instagram_accounts ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}';
ALTER TABLE instagram_accounts ADD COLUMN IF NOT EXISTS notes TEXT;
ALTER TABLE instagram_accounts ADD COLUMN IF NOT EXISTS saved BOOLEAN DEFAULT false;
ALTER TABLE instagram_accounts ADD COLUMN IF NOT EXISTS client_id UUID;
ALTER TABLE instagram_accounts ADD COLUMN IF NOT EXISTS raw_profile JSONB DEFAULT '{}';

-- ============================================
-- 2. Index supplémentaires
-- ============================================

CREATE INDEX IF NOT EXISTS idx_instagram_accounts_saved ON instagram_accounts(saved);
CREATE INDEX IF NOT EXISTS idx_instagram_accounts_tags ON instagram_accounts USING gin(tags);
CREATE INDEX IF NOT EXISTS idx_instagram_accounts_followers ON instagram_accounts(followers DESC);
CREATE INDEX IF NOT EXISTS idx_instagram_accounts_fts
  ON instagram_accounts
  USING gin(to_tsvector('french', coalesce(handle, '') || ' ' || coalesce(display_name, '') || ' ' || coalesce(bio, '')));

-- ============================================
-- 3. Index pour instagram_posts
-- ============================================

CREATE INDEX IF NOT EXISTS idx_instagram_posts_timestamp ON instagram_posts(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_instagram_posts_type ON instagram_posts(type);
CREATE INDEX IF NOT EXISTS idx_instagram_posts_hashtags ON instagram_posts USING gin(hashtags);

-- ============================================
-- 4. Index pour instagram_audits
-- ============================================

CREATE INDEX IF NOT EXISTS idx_instagram_audits_status ON instagram_audits(status);
CREATE INDEX IF NOT EXISTS idx_instagram_audits_score ON instagram_audits(score_overall DESC);
CREATE INDEX IF NOT EXISTS idx_instagram_audits_generated ON instagram_audits(generated_at DESC);

-- ============================================
-- 5. Trigger updated_at pour instagram_accounts
-- ============================================

DROP TRIGGER IF EXISTS update_instagram_accounts_updated_at ON instagram_accounts;
ALTER TABLE instagram_accounts ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT now();
CREATE TRIGGER update_instagram_accounts_updated_at
  BEFORE UPDATE ON instagram_accounts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
