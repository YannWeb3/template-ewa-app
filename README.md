# Template EWA App

Application de démonstration répliquant l'expérience EWA originale dans `template-ewa-app`, sans toucher à `templaterV2-ewa-app`.

## Démarrage

```bash
npm run dev
```

Ouvrez [http://localhost:3000](http://localhost:3000).

## Stack

- Next.js 16 + React + TypeScript
- Tailwind CSS
- Supabase client (`ogwqvijwbzzzmswgifvx`) avec clé `service_role`

## Variables d'environnement

Voir `.env` :
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `N8N_WEBHOOK_SECRET`

## Architecture

- Données réelles clients/monteurs/staff/WhatsApp/playbooks lues via Supabase service role du projet client `ogwqvijwbzzzmswgifvx`.
- Données propres à l'app (Cerveau EWA, Instagram, Observatoire WhatsApp) stockées dans notre Supabase `yfeutiagwgbrsbncmixx`.
- Modules sans données réelles mockés côté template.
- Pas de modification du Supabase client (lecture seule).
- L'Observatoire WhatsApp est basé sur `observatoire_messages` dans le Supabase template et sera alimenté par n8n.

## Variables d'environnement

Voir `.env` :
- `NEXT_PUBLIC_SUPABASE_URL` + `NEXT_PUBLIC_SUPABASE_ANON_KEY` + `SUPABASE_SERVICE_ROLE_KEY` : Supabase client EWA (lecture)
- `NEXT_PUBLIC_TEMPLATE_SUPABASE_URL` + `NEXT_PUBLIC_TEMPLATE_SUPABASE_ANON_KEY` + `TEMPLATE_SUPABASE_SERVICE_ROLE_KEY` : Supabase template propre
- `NEXT_PUBLIC_APP_URL`
- `N8N_WEBHOOK_SECRET`

## Modules implémentés

| Module | État | Données | Notes |
|--------|------|---------|-------|
| Dashboard | ✅ | Mockées | KPIs financiers, CA, charges |
| Clients | ✅ | Supabase | 289 contacts réels, filtres, onboarding |
| Projets | ✅ | Mix | 20 projets mockés liés aux vrais clients/monteurs |
| Équipe | ✅ | Supabase | 9 monteurs + 4 profils staff |
| Académie | ✅ | Mix | Vraies vidéos YouTube + mockées, CRUD local |
| Playbooks | ✅ | Supabase + mock | 2 vrais playbooks + mockés, CRUD local |
| Frame.io | ✅ | Mock | Connecté EWA, fichiers récents, suivi monteurs |
| Retour montage | ✅ | Mock | Retours clients, priorités, sources |
| Banque | ✅ | Mock | Dashboard bancaire, comptes, transactions, virements |
| Paramètres | ✅ | Mock | Connexions bancaires (API), observatoire WhatsApp |
| Analytics | ✅ | Supabase + mock | Dashboard agence fidèle à l'original EWA |
| Recherche IG | ✅ | Supabase template | 12 comptes seed, pipeline audit, drawer détail, lien Cerveau EWA |
| Cerveau EWA | ✅ | Supabase template + mock | 392 entrées, 18 sous-catégories, markdown, Loom, CRUD, audits Instagram liés |
| Observatoire | ✅ | Supabase template | `observatoire_messages`, statuts IA, ingestion n8n |

## API Instagram

| Endpoint | Méthode | Rôle | Protection |
|---|---|---|---|
| `/api/instagram/accounts` | GET | Liste avec filtres + stats | - |
| `/api/instagram/accounts/[id]` | GET | Fiche détaillée (posts + audits) | - |
| `/api/instagram/accounts/[id]` | PATCH | Mise à jour (saved, notes...) | - |
| `/api/instagram/accounts/[id]` | DELETE | Suppression | - |
| `/api/instagram/accounts/[id]/audit` | POST | Création d'audit + lien Cerveau EWA | - |
| `/api/instagram/audit-pipeline` | POST | Pipeline complet (mock Apify → OpenRouter) | - |
| `/api/instagram/ingest` | POST | Ingestion n8n (compte + posts + audit) | `x-n8n-token` |
| `/api/instagram/accounts-to-audit` | GET | Comptes à auditer (pour n8n) | `x-n8n-token` |

## API IA

| Endpoint | Méthode | Rôle |
|---|---|---|
| `/api/knowledge/chat` | POST | Chat RAG : recherche full-text + appel IA + sources |
| `/api/settings/ai` | GET | Récupérer la config IA (provider + modèle) |
| `/api/settings/ai` | PATCH | Sauvegarder la config IA |

## Providers IA supportés

| Provider | Modèles | Clé .env |
|---|---|---|
| OpenAI | GPT-4o Mini, GPT-4o, GPT-5 | `OPENAI_API_KEY` |
| Ollama Cloud | DeepSeek V4 Flash, DeepSeek V4, Llama 4 | `OLLAMA_CLOUD_API_KEY` |
| OpenRouter | Claude Sonnet 4.5, Claude Haiku 4, Gemini 2.5 Flash | `OPENROUTER_API_KEY` |

La configuration se fait dans **Paramètres > IA**.

## Seed

```bash
npm run seed:instagram
```

Insère 12 comptes Instagram mockés dans le Supabase template.

## Connecteurs externes & automatisations (à activer pour données réelles)

- **n8n** : **WF - WhatsApp Ingest** actif sur `n8nv3.iapourasso.com`. 5 autres workflows prêts dans `Plans/n8n/exports/` (Sync Clients, Sync Editors, Sync Playbooks, Instagram Audit, Knowledge Ingest).
- **Loom API** : importer les vraies vidéos Loom et transcripts dans le Cerveau EWA
- **Frame.io API/OAuth** : projets, assets, reviews, uploads
- **Qonto API** : transactions, soldes
- **Bridge / Budget Insight / Nordigen / Truelayer / Plaid** : agrégation bancaire

> Les entrées Loom du Cerveau EWA sont actuellement mockées. Les workflows n8n pointent sur `localhost:3000` — à mettre à jour après déploiement.

## Commandes

- `npm run dev` : développement
- `npm run build` : build de production

## Important

> Ce projet est un **template démo**. Les modifications côté client (CRUD local) ne persistent pas en base.

## Architecture WhatsApp / Observatoire

- Messages bruts temporairement lus depuis `whatsapp_messages` (Supabase client).
- Messages classés stockés dans `observatoire_messages` (Supabase template).
- Endpoint d'ingestion n8n : `POST /api/observatoire/ingest` avec `x-n8n-token`.
- À terme, n8n enverra directement dans `observatoire_messages` quand le Supabase client ne sera plus accessible.
