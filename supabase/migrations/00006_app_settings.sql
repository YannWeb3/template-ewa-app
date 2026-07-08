-- Migration : Table de configuration de l'application
-- Supabase : yfeutiagwgbrsbncmixx
-- Objectif : stocker les préférences utilisateur (provider IA, modèle, etc.)

CREATE TABLE IF NOT EXISTS app_settings (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL DEFAULT '{}',
  updated_at TIMESTAMPTZ DEFAULT now()
);

COMMENT ON TABLE app_settings IS 'Configuration clé-valeur pour les préférences de l\'application';

INSERT INTO app_settings (key, value) VALUES ('ai_settings', '{"provider": "openai", "model": "gpt-4o-mini"}')
ON CONFLICT (key) DO NOTHING;
