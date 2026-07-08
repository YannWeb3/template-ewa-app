# Analyse infrastructure EWA — Recherche IG & Audit Instagram

> Objectif : valider/invalider les hypothèses sur le pipeline Recherche IG avant toute implémentation.
> Date : juillet 2026
> Projet cible : `template-ewa-app` (ne pas toucher à `templaterV2-ewa-app`)

---

## 1. Hypothèses initiales

| # | Hypothèse | Statut | Preuve |
|---|---|---|---|
| H1 | Il existe un workflow n8n dédié à Instagram (scraping, audit, etc.) | ❌ Invalidé | Aucun workflow n8n ne mentionne Instagram, Apify, Deepgram, scraping ou audit. Les workflows existants sont WhatsApp/CRM/crise. |
| H2 | Le Supabase client contient des tables liées à Instagram / audits / knowledge | ❌ Invalidé | Seules 5 tables actives existent : `clients`, `editors`, `profiles`, `playbooks`, `whatsapp_messages`. Aucune table `instagram_*`, `audits`, `ai_analysis`, `knowledge_*`. |
| H3 | Les clients EWA ont des URLs Instagram renseignées | ✅ Validé | 30/289 clients ont `instagram_url` renseigné (coaching, fitness, etc.). Liste extraite. |
| H4 | L'original EWA a un concept d'"audit profil" Instagram | ✅ Validé | Le chunk build original de `cerveau-ewa` définit la sous-catégorie `audit-profil` : "Audits Instagram, bios, optimisation profil". |
| H5 | Apify est utilisé pour scraper Instagram | ⚠️ Non confirmé | Apify n'est référencé dans aucun fichier local ni workflow n8n. C'est une supposition basée sur le marché. |
| H6 | Deepgram est utilisé pour transcrire les Reels | ⚠️ Non confirmé | Deepgram n'est référencé nulle part. L'Apify Reel Scraper fournit déjà un transcript natif. |
| H7 | Les audits générés alimentent le Cerveau EWA | ✅ Partiellement validé | L'original a une catégorie `audit-profil` dans le Cerveau EWA, ce qui suggère que les audits y sont stockés comme entrées de connaissance. |

---

## 2. Schéma Supabase client (`ogwqvijwbzzzmswgifvx`)

### Tables actives confirmées

| Table | Lignes | Colonnes clés | Notes |
|---|---|---|---|
| `clients` | 289 | `instagram_url`, `tags`, `status`, `source`, `qualification_score`, `montage_brief`, `whatsapp_*`, `drive_url`, `frameio_url`, `da_url` | La colonne `instagram_url` est le seul point d'ancrage IG existant. |
| `editors` | 9 | `skills`, `status`, `current_load`, `bio`, `avatar_url`, `agreed_rates` |  |
| `profiles` | 4 | `role`, `editor_id`, `hide_financials` | Staff lié aux éditeurs. |
| `playbooks` | 2 | `title`, `content`, `checklist`, `examples`, `loom_url`, `position` |  |
| `whatsapp_messages` | 5146 | `transcript`, `raw_payload`, `media_url`, `client_id`, `is_voice` | La colonne `transcript` existe déjà (probablement Deepgram ou WAHA). |

### Tables inexistantes (testées)

- `instagram_accounts`, `instagram_posts`, `instagram_audits`
- `audits`, `ai_analysis`, `analysis`
- `knowledge`, `knowledge_base`, `knowledge_entries`, `cerveau_ewa`, `brain`, `entries`
- `competitors`, `prospects`, `leads`, `hashtags`, `posts`, `reels`
- `transcriptions`, `transcripts`
- `n8n`, `webhooks`, `integrations`, `api_keys`, `settings`, `config`, `models`, `prompts`
- `frameio_projects`, `frameio_reviews`
- `transactions`, `bank_connections`, `invoices`, `expenses`, `analytics`
- `projects`, `whatsapp_blacklist` (table vide/inexistante côté Supabase, gérée localement dans l'app)

### Colonnes intéressantes pour IG

- `clients.instagram_url` : point d'entrée pour scraper un client connu.
- `clients.tags` : permet de catégoriser le compte (client/prospect/concurrent/inspiration).
- `clients.qualification_score` : score existant qu'on pourrait enrichir avec l'audit IG.
- `whatsapp_messages.transcript` : prouve que la transcription audio est déjà une pratique EWA.

---

## 3. Workflows n8n existants

### Liste obtenue via API n8n (lecture seule)

| ID | Nom | Actif | Description |
|---|---|---|---|
| `2gwJT4ck1svfbspi` | Template | ❌ | Template avec un AI Agent OpenRouter (désactivé), node Supabase WhatsApp. |
| `2hPPFCi8uSXp08dL` | WF5 - Suivi groupe WhatsApp | ❌ | Gestion de groupe WA + IA Claude/OpenAI. |
| `4g36Xhr5uf36LJJ6` | WF2 - Qualification | ❌ | Qualification prospects WhatsApp. |
| `7DLrtpiuo1cJ8AOU` | Error tracking | ❌ | Suivi d'erreurs. |
| `C9x3nnrBoqobH9Ef` | WF-Detection-Validation | ❌ | Détection/validation. |
| `Cet5o1GDJK78e8Lu` | WF3 - Création groupe WhatsApp | ❌ | Création de groupes WAHA. |
| `Qz2yJugKzJBkHypp` | Waha1_Pacome | ✅ | Webhook WAHA → POST `/api/whatsapp/ingest`. |
| `pfZ12H7yXefu5o7J` | WF4 - Airtable CRM | ❌ | Sync prospects Airtable ↔ app. |
| `v8OyEMZglthwRaSc` | WF8 - Communication de Crise | ❌ | Envoi massif WhatsApp aux clients actifs. |

### Modèles LLM utilisés dans les workflows existants

- `gpt-5` (OpenAI)
- `anthropic/claude-sonnet-4.5` (via OpenRouter)

### Services intégrés dans n8n

- WAHA (WhatsApp)
- Supabase
- OpenRouter (OpenAI + Anthropic)
- Airtable (legacy / CRM)
- HTTP Request vers `https://ewa-app.vercel.app/api/n8n/webhook`

### Services NON présents dans n8n

- Apify
- Deepgram
- Frame.io
- Qonto / Bridge / Plaid / Truelayer
- Instagram API officielle

---

## 4. Architecture originale EWA (extraite du build)

### Cerveau EWA — catégories connues

```
retour-client, montage, scripting, ads, audit-profil, contenu, tournage,
process, formation, proposition, stories, outil, design, strategie,
client, conversion, viralite, autre
```

`audit-profil` : *"Audits Instagram, bios, optimisation profil"*

### Sources du Cerveau EWA

- `loom` (vidéos Loom)
- `formation`
- `script`
- `manual`
- `whatsapp`

**Implication** : les audits IG pourraient être stockés comme entrées `manual`/`script` avec la sous-catégorie `audit-profil`.

### Recherche IG originale

- Page très simple : recherche, hashtags tendance mockés, posts populaires mockés.
- Aucune connexion API visible.

---

## 5. Conclusions

### Validé

1. L'original EWA a bien prévu un concept d'audit Instagram (catégorie `audit-profil` dans le Cerveau EWA).
2. Les clients Supabase ont des `instagram_url` que l'on peut utiliser comme point d'entrée.
3. La transcription est déjà une pratique EWA (`whatsapp_messages.transcript`).
4. n8n utilise OpenRouter (OpenAI + Claude) pour l'IA.

### Invalidé

1. **Aucun workflow n8n Instagram** n'existe actuellement.
2. **Aucune table Supabase** n'est prête à accueillir des données IG/audits.
3. **Aucune référence à Apify ou Deepgram** n'a été trouvée dans l'infrastructure existante.

### Impact

Le pipeline Recherche IG / Audit Instagram **n'existe pas encore** dans l'infrastructure EWA. C'est une opportunité de le créer proprement, pas une réplication d'un workflow existant.

---

## 6. Options d'implémentation

| Option | Avantage | Inconvénient |
|---|---|---|
| A. **Apify + OpenRouter** | Robuste, scalable, documentation riche | Coût Apify + besoin de clés API |
| B. **Instagram Basic Display API officielle** | Gratuite / limitée | Très restrictive, pas de métriques engagement, pas de reels business |
| C. **Scraping maison via n8n + puppeteer** | Pas de dépendance Apify | Fragile, maintenance lourde, risque blocage IG |
| D. **Mock complet** | Valide l'UX sans coût | Pas de données réelles |

**Recommandation** : commencer par **D (mock)** pour valider la structure de données et l'UX, puis passer à **A (Apify + OpenRouter)**.

---

## 7. Prochaines étapes recommandées

> **Stand by** : en attente de récupération des workflows n8n contenant les bons WF Instagram/Apify/Deepgram. Ne pas implémenter avant validation.

1. **Créer les tables Supabase** : `instagram_accounts`, `instagram_posts`, `instagram_audits`.
2. **Créer un endpoint** `POST /api/instagram/ingest` pour recevoir les audits générés par n8n.
3. **Créer un workflow n8n "Instagram Audit"** v0.1 mocké (pas d'Apify, payload statique) pour valider le pipeline.
4. **Enrichir `/recherche-ig`** pour afficher les comptes extraits de `clients.instagram_url` + données mockées d'audit.
5. **Ajouter `/cerveau-ewa/audit-profil`** pour afficher les audits comme entrées de connaissance.

---

## 8. Fichiers de référence

- `app/(dashboard)/recherche-ig/page.tsx` : UI actuelle du module.
- `templaterV2-ewa-app/src/app/(dashboard)/recherche-ig/page.tsx` : UI originale minimaliste.
- `Plans/parametres-observatoire-whatsapp.md` : documentation du seul workflow n8n actif.
- `.env` : variables d'environnement incluant `N8N_WEBHOOK_SECRET`.
- Build original `Modele App EWA/_next/static/chunks/app/Dashboard/cerveau-ewa/cerveau_EWA.js` : preuve de la catégorie `audit-profil`.
