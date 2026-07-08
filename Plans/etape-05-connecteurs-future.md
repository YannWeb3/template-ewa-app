# Étape 5 — Connecteurs externes non disponibles (architecture future)

> Objectif : préparer l'architecture des connecteurs Loom, Frame.io et Banque sans les implémenter, faute de credentials.
> Statut : planification uniquement. Aucun code à exécuter tant que les accès ne sont pas fournis.

---

## 1. Loom API — Alimenter le Cerveau EWA

### 1.1 Objectif
Remplacer les 374 entrées Loom mockées par de vraies vidéos Loom et leurs transcripts.

### 1.2 Prérequis manquants
- Clé API Loom ou compte admin Loom.
- Accès workspace EWA sur Loom.
- Droits pour exporter les transcripts (souvent Loom Pro/Enterprise).

### 1.3 API Loom à étudier

Documentation : https://dev.loom.com/

Endpoints utiles :
- `GET /v2/me` — informations utilisateur.
- `GET /v2/workspaces` — workspaces accessibles.
- `GET /v2/videos` — liste des vidéos.
- `GET /v2/videos/{id}` — détail d'une vidéo.
- `GET /v2/videos/{id}/transcript` — transcript (si disponible).

### 1.4 Endpoint à préparer

**Fichier futur** : `app/api/loom/ingest/route.ts`

Sécurité : header `x-n8n-token`.

Body attendu depuis n8n :

```json
{
  "title": "Formation — Sound Design",
  "description": "...",
  "loom_url": "https://www.loom.com/share/xxx",
  "transcript": "...",
  "duration": 245,
  "created_at": "2026-01-15T10:00:00Z",
  "workspace": "EWA"
}
```

### 1.5 Workflow n8n futur

Nom : `WF - Loom Sync`

Pipeline :
```
Trigger (hebdomadaire) → Loom API GET /v2/videos → Pour chaque vidéo : GET transcript → POST /api/loom/ingest
```

### 1.6 Catégorisation automatique

Utiliser OpenRouter pour déduire la sous-catégorie (`subcategory`) à partir du titre + transcript :

```txt
À partir du titre et du transcript de cette vidéo Loom, choisis la meilleure sous-catégorie parmi :
retour-client, montage, scripting, ads, audit-profil, contenu, tournage, process, formation, proposition, stories, outil, design, strategie, client, conversion, viralite, autre.

Titre : {title}
Transcript : {transcript}

Réponds uniquement avec la clé de sous-catégorie.
```

### 1.7 Stockage

- Insérer dans `knowledge_entries` côté Supabase template.
- `source = "loom"`.
- `sources = { loom: 1 }`.

---

## 2. Frame.io OAuth/API

### 2.1 Objectif
Remplacer les mocks Frame.io par des projets, assets, reviews et uploads réels.

### 2.2 Prérequis manquants
- Abonnement Frame.io actif.
- OAuth app créée sur https://accounts.frame.io/.
- Client ID + Client Secret.
- Token OAuth rafraîchi automatiquement.

### 2.3 Tables à créer côté Supabase template

```sql
CREATE TABLE IF NOT EXISTS frameio_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id TEXT UNIQUE, -- ID Frame.io
  name TEXT,
  email TEXT,
  access_token TEXT,
  refresh_token TEXT,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS frameio_projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  frameio_id TEXT UNIQUE,
  account_id UUID REFERENCES frameio_accounts(id),
  name TEXT,
  status TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS frameio_assets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  frameio_id TEXT UNIQUE,
  project_id UUID REFERENCES frameio_projects(id),
  name TEXT,
  type TEXT,
  url TEXT,
  size_bytes BIGINT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS frameio_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  frameio_id TEXT UNIQUE,
  asset_id UUID REFERENCES frameio_assets(id),
  reviewer_name TEXT,
  status TEXT, -- approved | needs_review
  comment TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

### 2.4 Flux OAuth

1. Utilisateur clique "Connecter Frame.io" dans `/parametres`.
2. Redirection vers `https://accounts.frame.io/oauth2/auth?client_id=...&redirect_uri=...&response_type=code&scope=...`.
3. Retour sur `/api/frameio/callback`.
4. Échange du `code` contre access/refresh token.
5. Stockage chiffré ou en base (template).

### 2.5 Endpoint à préparer

**Fichier futur** : `app/api/frameio/ingest/route.ts`

Body attendu depuis n8n :

```json
{
  "project": { "frameio_id": "...", "name": "..." },
  "assets": [...],
  "reviews": [...]
}
```

### 2.6 Workflow n8n futur

Nom : `WF - Frame.io Sync`

Pipeline :
```
Trigger quotidien → Frame.io API (avec refresh token) → Récupérer projets/assets/reviews → POST /api/frameio/ingest
```

### 2.7 Module Frame.io

- Afficher les vrais projets/assets.
- Lier les reviews au module Retour montage.
- Afficher l'activité des monteurs (uploads, commentaires).

---

## 3. Banque — Qonto ou agrégateur bancaire

### 3.1 Objectif
Remplacer les mocks bancaires par des transactions, soldes et virements réels.

### 3.2 Options de connecteurs

| Fournisseur | Type | Notes |
|---|---|---|
| Qonto API | Direct | Nécessite IBAN + secret API Qonto. API stable. |
| Bridge | Agrégateur | PSD2, multi-banques, coût modéré. |
| Truelayer | Agrégateur | UK/Europe. |
| Nordigen / GoCardless | Agrégateur | Compte gratuit possible. |
| Plaid | Agrégateur | USA/Europe. |
| Budget Insight | Agrégateur | France. |

### 3.3 Prérequis manquants
- IBAN + secret API Qonto, ou
- Compte + clés API d'un agrégateur.

### 3.4 Tables à créer côté Supabase template

```sql
CREATE TABLE IF NOT EXISTS bank_connections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  provider TEXT NOT NULL, -- qonto | bridge | truelayer | nordigen | plaid | budget_insight
  status TEXT NOT NULL DEFAULT 'connected', -- connected | error | disconnected
  credentials JSONB, -- token, secret, encrypted
  last_sync TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  connection_id UUID REFERENCES bank_connections(id),
  transaction_id TEXT UNIQUE,
  date TIMESTAMPTZ,
  amount NUMERIC,
  currency TEXT DEFAULT 'EUR',
  description TEXT,
  category TEXT,
  counterparty TEXT,
  status TEXT, -- pending | booked
  raw_payload JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS bank_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  connection_id UUID REFERENCES bank_connections(id),
  iban TEXT,
  label TEXT,
  balance NUMERIC,
  currency TEXT DEFAULT 'EUR',
  created_at TIMESTAMPTZ DEFAULT now()
);
```

### 3.5 Endpoint à préparer

**Fichier futur** : `app/api/bank/ingest/route.ts`

Body attendu depuis n8n :

```json
{
  "connection_id": "uuid",
  "accounts": [...],
  "transactions": [...]
}
```

### 3.6 Workflow n8n futur

Nom : `WF - Bank Sync`

Pipeline :
```
Trigger quotidien → Qonto/Agrégateur API → GET transactions/soldes → POST /api/bank/ingest
```

### 3.7 Module Banque

- Afficher les vraies transactions.
- Calculer les soldes à partir des transactions.
- Filtrer par catégorie, période, compte.
- Simuler les virements (la fonctionnalité de virement réel nécessite une validation forte côté banque).

---

## 4. Récapitulatif des connecteurs

| Connecteur | Statut | Blocage | Priorité quand accès dispo |
|---|---|---|---|
| Loom | ⏳ Planifié | Pas de clé API Loom | Haute (Cerveau EWA riche) |
| Frame.io | ⏳ Planifié | Pas d'OAuth/app | Moyenne |
| Banque | ⏳ Planifié | Pas de credentials bancaires | Moyenne |

---

## 5. Fichiers à préparer (pas à exécuter maintenant)

| Fichier | Rôle |
|---|---|
| `app/api/loom/ingest/route.ts` | Ingestion vidéos Loom |
| `app/api/frameio/callback/route.ts` | Callback OAuth Frame.io |
| `app/api/frameio/ingest/route.ts` | Ingestion projets/assets/reviews |
| `app/api/bank/ingest/route.ts` | Ingestion transactions |
| `supabase/migrations/00007_frameio_tables.sql` | Schéma Frame.io |
| `supabase/migrations/00008_bank_tables.sql` | Schéma bancaire |

---

## 6. Notes

- Cette étape reste en planification jusqu'à obtention des credentials.
- Les clés API saisies dans `/parametres` (module Connexions bancaires) sont actuellement simulées localement.
- En production, les credentials sensibles seraient chiffrés côté serveur (KMS, Vault, etc.).
- Aucun code ne doit être écrit pour ces connecteurs tant que les accès ne sont pas confirmés.
