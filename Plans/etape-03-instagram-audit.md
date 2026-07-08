# Étape 3 — Instagram / Recherche IG

> Objectif : transformer `/recherche-ig` de mock à données semi-réelles via Apify + OpenRouter.
> Accès requis : Apify, OpenRouter.
> Règle : toutes les nouvelles tables sont créées dans le Supabase template `yfeutiagwgbrsbncmixx`.

---

## 1. Contexte

### Hypothèses validées
- 30/289 clients ont `instagram_url` renseigné.
- L'original EWA a une catégorie `audit-profil` dans le Cerveau EWA.
- Aucun workflow n8n Instagram n'existe actuellement.
- Aucune table `instagram_*` n'existe dans Supabase.

### Choix recommandé
- **Phase 1** : créer les tables + endpoint + workflow n8n mocké/statique pour valider le pipeline.
- **Phase 2** : brancher Apify + OpenRouter pour scraping et audit réels.

---

## 2. Créer les tables Supabase template

### 2.1 `instagram_accounts`

```sql
CREATE TABLE IF NOT EXISTS instagram_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  handle TEXT NOT NULL UNIQUE,
  name TEXT,
  bio TEXT,
  followers INTEGER DEFAULT 0,
  following INTEGER DEFAULT 0,
  posts_count INTEGER DEFAULT 0,
  engagement_rate NUMERIC DEFAULT 0,
  profile_pic_url TEXT,
  website TEXT,
  category TEXT NOT NULL DEFAULT 'client', -- client | prospect | competitor | inspiration
  tags TEXT[] DEFAULT '{}',
  source TEXT NOT NULL DEFAULT 'manual', -- manual | client | apify
  client_id UUID,
  is_saved BOOLEAN DEFAULT false,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_instagram_accounts_category ON instagram_accounts(category);
CREATE INDEX idx_instagram_accounts_source ON instagram_accounts(source);
CREATE INDEX idx_instagram_accounts_saved ON instagram_accounts(is_saved);
```

### 2.2 `instagram_posts`

```sql
CREATE TABLE IF NOT EXISTS instagram_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id UUID REFERENCES instagram_accounts(id) ON DELETE CASCADE,
  post_url TEXT,
  caption TEXT,
  likes INTEGER DEFAULT 0,
  comments INTEGER DEFAULT 0,
  views INTEGER DEFAULT 0,
  media_type TEXT,
  posted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_instagram_posts_account_id ON instagram_posts(account_id);
```

### 2.3 `instagram_audits`

```sql
CREATE TABLE IF NOT EXISTS instagram_audits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id UUID REFERENCES instagram_accounts(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  strengths TEXT[] DEFAULT '{}',
  weaknesses TEXT[] DEFAULT '{}',
  recommendations TEXT[] DEFAULT '{}',
  score INTEGER CHECK (score >= 0 AND score <= 100),
  model TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_instagram_audits_account_id ON instagram_audits(account_id);
```

### 2.4 Migration

Fichier : `supabase/migrations/00004_instagram_tables.sql`

---

## 3. Créer le service `lib/supabase/instagram.ts`

**Fichier** : `lib/supabase/instagram.ts`

### Fonctions attendues

```ts
export async function getInstagramAccounts(options: { category?: string; savedOnly?: boolean; search?: string; limit?: number; offset?: number })
export async function getInstagramAccountById(id: string)
export async function getInstagramPosts(accountId: string, limit?: number)
export async function getInstagramAudit(accountId: string)
export async function upsertInstagramAccount(account: InstagramAccountInput)
export async function insertInstagramPosts(accountId: string, posts: InstagramPostInput[])
export async function insertInstagramAudit(accountId: string, audit: InstagramAuditInput)
export async function deleteInstagramAccount(id: string)
export async function toggleSavedAccount(id: string, isSaved: boolean)
```

### Client
Utiliser `lib/supabase/template.ts` (service role template).

---

## 4. Créer l'endpoint `POST /api/instagram/ingest`

**Fichier** : `app/api/instagram/ingest/route.ts`

### Sécurité
Vérifier `x-n8n-token`.

### Body attendu

```json
{
  "account": {
    "handle": "mariecoach",
    "name": "Marie Coach",
    "bio": "Coach fitness • Maman • Paris",
    "followers": 12400,
    "following": 540,
    "posts_count": 87,
    "engagement_rate": 4.5,
    "profile_pic_url": "https://...",
    "website": "https://mariecoach.fr",
    "category": "client",
    "tags": ["fitness", "maman"],
    "source": "apify",
    "client_id": "uuid-optional"
  },
  "posts": [
    {
      "post_url": "https://instagram.com/p/ABC123",
      "caption": "Mon morning routine...",
      "likes": 320,
      "comments": 18,
      "views": 1200,
      "media_type": "reel",
      "posted_at": "2026-06-15T10:00:00Z"
    }
  ],
  "audit": {
    "content": "Analyse détaillée...",
    "strengths": ["Bonne régularité", "Bio claire"],
    "weaknesses": ["Hooks peu accrocheurs"],
    "recommendations": ["Tester des Reels à 7s", "Ajouter CTA"],
    "score": 72,
    "model": "anthropic/claude-sonnet-4.5"
  }
}
```

### Comportement
1. Upsert `instagram_accounts` (par `handle`).
2. Si `posts` fourni, supprimer les anciens posts de ce compte et insérer les nouveaux.
3. Si `audit` fourni, insérer un nouvel audit.
4. Retourner `{ accountId, postsCount, auditId }`.

---

## 5. Créer l'endpoint `GET /api/instagram/accounts`

**Fichier** : `app/api/instagram/accounts/route.ts`

### Query params
- `category`
- `savedOnly`
- `search`
- `limit` / `offset`

### Retour
```json
{
  "accounts": [...],
  "total": 42
}
```

---

## 6. Créer l'endpoint `GET /api/instagram/accounts/[id]`

**Fichier** : `app/api/instagram/accounts/[id]/route.ts`

### Retour
```json
{
  "account": { ... },
  "posts": [...],
  "audit": { ... }
}
```

---

## 7. Créer le workflow n8n "Instagram Audit"

### Pipeline
```
Trigger (manuel/cron) → Récupérer comptes → Apify scraper → OpenRouter audit → POST /api/instagram/ingest
```

### Nœud 1 — Trigger
- Schedule quotidien à 6h ou Manual.

### Nœud 2 — Récupérer les comptes
- Option A : HTTP Request `GET /api/instagram/accounts-to-audit`.
- Option B : Supabase node lecture de `instagram_accounts`.

### Nœud 3 — Apify
- Acteur : `apify/instagram-profile-scraper` ou équivalent.
- Input : `usernames`.
- Récupérer : bio, followers, following, posts_count, posts (caption, likes, comments, views).

### Nœud 4 — OpenRouter
- Modèle : `anthropic/claude-sonnet-4.5`.
- Prompt structuré.
- Output JSON : `{ content, strengths[], weaknesses[], recommendations[], score }`.

### Nœud 5 — HTTP Request
- `POST /api/instagram/ingest`
- Header `x-n8n-token`.
- Body : `{ account, posts, audit }`.

---

## 8. Enrichir `/recherche-ig/page.tsx`

### 8.1 Source de données
- Comptes extraits de `clients.instagram_url` (catégorie `client`).
- Comptes ajoutés manuellement.
- Comptes importés par Apify.

### 8.2 Nouvelles fonctionnalités
- Recherche par handle, nom, bio, tags.
- Filtres : catégorie, comptes sauvegardés, source.
- Tri : score composite, abonnés, engagement, activité récente.
- Fiche compte avec posts + audit.
- Bouton "Lancer un audit" (déclenche le workflow n8n).
- Bouton "Sauvegarder / Retirer".

### 8.3 Liens
- Lien externe vers `https://instagram.com/{handle}`.
- Lien vers le Cerveau EWA pour les audits `audit-profil`.

---

## 9. Lier au Cerveau EWA

### 9.1 Créer des entrées `knowledge_entries` depuis les audits

Endpoint : `POST /api/knowledge/ingest` (existant).

Payload généré par n8n :
```json
{
  "title": "Audit Instagram — @mariecoach",
  "content": "Analyse détaillée + recommandations",
  "category": "audit-profil",
  "subcategory": "audit-profil",
  "source": "manual",
  "sources": { "manual": 1 },
  "metadata": {
    "account_id": "uuid",
    "handle": "mariecoach",
    "score": 72,
    "model": "anthropic/claude-sonnet-4.5"
  }
}
```

### 9.2 Page `/cerveau-ewa/audit-profil`

Déjà gérée par la navigation dynamique `[subcategory]`. Les audits apparaîtront automatiquement avec `subcategory = "audit-profil"`.

---

## 10. Phase 1 — Version statique pour valider le pipeline

Avant de consommer du crédit Apify, créer un workflow n8n v0.1 avec un **payload statique** :

```json
{
  "account": {
    "handle": "demo_account",
    "name": "Compte démo",
    "bio": "Bio démo",
    "followers": 1000,
    "following": 100,
    "posts_count": 12,
    "engagement_rate": 3.5,
    "category": "prospect",
    "source": "manual"
  },
  "posts": [],
  "audit": {
    "content": "Audit démo généré manuellement.",
    "strengths": ["Bonne bio"],
    "weaknesses": ["Peu de posts"],
    "recommendations": ["Poster plus souvent"],
    "score": 60,
    "model": "manual"
  }
}
```

Cela permet de valider :
- L'endpoint `/api/instagram/ingest`
- L'affichage dans `/recherche-ig`
- La navigation vers `/cerveau-ewa/audit-profil`

---

## 11. Tests et validation

### 11.1 Backend
- [ ] Tables créées dans Supabase template.
- [ ] `POST /api/instagram/ingest` fonctionne avec token.
- [ ] `GET /api/instagram/accounts` retourne les comptes.
- [ ] `GET /api/instagram/accounts/[id]` retourne compte + posts + audit.

### 11.2 Workflow n8n v0.1
- [ ] Workflow "Instagram Audit Demo" déclenchable manuellement.
- [ ] Payload statique inséré dans Supabase.

### 11.3 Workflow n8n v1.0
- [ ] Apify retourne les données d'un vrai compte.
- [ ] OpenRouter génère un audit structuré.
- [ ] L'audit s'affiche dans l'app.

### 11.4 UI
- [ ] `/recherche-ig` affiche les vrais comptes clients + démos.
- [ ] Filtres et tri fonctionnent.
- [ ] Le lien vers Instagram externe fonctionne.
- [ ] Les audits alimentent `/cerveau-ewa/audit-profil`.

---

## 12. Fichiers à créer/modifier

| Fichier | Action |
|---|---|
| `supabase/migrations/00004_instagram_tables.sql` | Créer |
| `lib/supabase/instagram.ts` | Créer |
| `app/api/instagram/ingest/route.ts` | Créer |
| `app/api/instagram/accounts/route.ts` | Créer |
| `app/api/instagram/accounts/[id]/route.ts` | Créer |
| `app/(dashboard)/recherche-ig/page.tsx` | Modifier |
| `Plans/n8n/instagram-audit-workflow.json` | Créer |

---

## 13. Notes

- Pas d'écriture sur le Supabase client.
- Les audits IG sont des entrées `manual` dans `knowledge_entries` (sous-catégorie `audit-profil`).
- Commencer par la version statique pour valider le pipeline sans crédit Apify.
- Coût Apify à surveiller : scraper un profil ~ 0.01–0.05 $/run selon le nombre de posts.
