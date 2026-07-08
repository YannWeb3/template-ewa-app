# Recap Projet — Template EWA App

> Dernière mise à jour : juillet 2026
> Projet cible : `template-ewa-app`
> Règle d'or : ne jamais toucher à `templaterV2-ewa-app`

---

## 1. Vue d'ensemble

Le projet `template-ewa-app` est une réplication du SaaS EWA originale en tant que template démo autonome. Il reprend l'expérience utilisateur, les modules clés et les données opérationnelles sans modifier l'application originale.

### Données utilisées

| Source | Identifiant | Rôle | Mode d'accès |
|---|---|---|---|
| Supabase client EWA | `ogwqvijwbzzzmswgifvx` | Données opérationnelles (clients, éditeurs, staff, WhatsApp, playbooks) | Lecture seule via `SUPABASE_SERVICE_ROLE_KEY` |
| Supabase template propre | `yfeutiagwgbrsbncmixx` | Tables propres au template (`knowledge_entries`, `instagram_*`, statuts WhatsApp, etc.) | Lecture/écriture via `TEMPLATE_SUPABASE_SERVICE_ROLE_KEY` |
| Mock local | Côté template | Modules sans données réelles (Dashboard, Projets, Banque, Frame.io, Retour montage, etc.) | Hash stable pour éviter les erreurs d'hydratation |

---

## 2. Ce qui a été fait

### 2.1 Modules UI/UX implémentés

| Module | Route | État | Données |
|---|---|---|---|
| Dashboard | `/` | ✅ Terminé | Mock (5 KPIs, CA, charges, projets urgents, top clients, monteurs, finances) |
| Clients | `/clients` | ✅ Terminé | Supabase client (289 contacts réels) |
| Projets | `/projets` | ✅ Terminé | Mix (20 projets mockés liés aux vrais clients/monteurs) |
| Équipe | `/equipe` | ✅ Terminé | Supabase client (9 éditeurs + 4 profils staff) |
| Académie | `/academie` | ✅ Terminé | Mix (5 vraies vidéos YouTube EWA + formations mockées) |
| Playbooks | `/playbooks` | ✅ Terminé | Supabase client + mock (2 vrais + 4 mockés) |
| Frame.io | `/frameio` | ✅ Terminé | Mock (connexion EWA simulée, fichiers, activité monteurs) |
| Retour montage | `/retour-montage` | ✅ Terminé | Mock (tableau retours clients, priorités, sources) |
| Banque | `/banque` | ✅ Terminé | Mock (solde, comptes Qonto/Wise, transactions, virements) |
| Paramètres | `/parametres` | ✅ Terminé | Mock (général, connexions bancaires, blacklist WhatsApp) |
| Analytics | `/analytics` | ✅ Terminé | Supabase + mock (fidèle à l'original EWA) |
| Recherche IG | `/recherche-ig` | ✅ Terminé | Supabase template (12 comptes seed, pipeline audit mocké, drawer détail, lien Cerveau EWA) |
| Cerveau EWA | `/cerveau-ewa` | ✅ Terminé | Supabase template + mock (392 entrées, 18 sous-catégories, markdown, Loom, CRUD, audits Instagram liés) |
| Observatoire WhatsApp | `/observatoire` | ⚠️ En cours | Supabase client WhatsApp — UI avancée, API messages manquante |

### 2.2 Infrastructures mises en place

#### Cerveau EWA

- Table `knowledge_entries` dans le Supabase template `yfeutiagwgbrsbncmixx`.
- 392 entrées réparties :

| Source | Entrées | Nature |
|---|---|---|
| `loom` | 374 | Mockées (prêtes à être remplacées par vraies vidéos Loom) |
| `formation` | 8 | Mockées |
| `script` | 8 | Mockées |
| `manual` | 2 | Vrais playbooks du Supabase client |
| **Total** | **392** | Base de connaissances interne fonctionnelle |

- 18 sous-catégories exactes du build original EWA avec icônes/couleurs.
- Recherche textuelle + filtre par source.
- Navigation `/cerveau-ewa/{subcategory}` avec fiche détaillée.
- Affichage markdown + section vidéos Loom.
- Actions Modifier / Supprimer par entrée.
- API CRUD complète :
  - `GET /api/knowledge/search`
  - `POST /api/knowledge/ingest`
  - `GET /api/knowledge/[id]`
  - `PATCH /api/knowledge/[id]`
  - `DELETE /api/knowledge/[id]`

#### WhatsApp

- Endpoint d'ingestion `POST /api/whatsapp/ingest` protégé par `x-n8n-token`.
- Workflow n8n actif : `Waha1_Pacome` → webhook → `/api/whatsapp/ingest`.
- 5153 messages stockés dans `whatsapp_messages` côté Supabase client.
- 153 transcripts vocaux disponibles dans `whatsapp_messages.transcript`.
- Gestion de la blacklist côté app/Supabase template (pas de modification du client).
- UI Observatoire avancée déjà créée dans `app/(dashboard)/observatoire/page.tsx`.

#### Workflows n8n

- Dossier `Plans/n8n/exports/` créé avec 6 workflows prêts à importer :
  - `wf-whatsapp-ingest.json`
  - `wf-sync-clients.json`
  - `wf-sync-editors.json`
  - `wf-sync-playbooks.json`
  - `wf-instagram-audit.json`
  - `wf-knowledge-ingest.json`
- Guide d'import et documentation des payloads : `Plans/n8n/README.md`.
- Tous les endpoints d'ingestion (`whatsapp`, `observatoire`, `knowledge`) vérifient le header `x-n8n-token`.
- Variables d'environnement n8n documentées dans `.env`.

#### Clients/Équipe/Playbooks

- Lecture des tables `clients`, `editors`, `profiles`, `playbooks` via service role.
- Filtres, recherche, tableaux, liens onboarding.

---

## 3. Points bloquants

| # | Blocage | Impact | Sévérité |
|---|---|---|---|
| B1 | **API `/api/whatsapp/messages` absente** — l'UI Observatoire appelle cette route mais elle n'existe pas | Page Observatoire affiche "Aucun message" malgré 5153 messages en base | 🔴 Haute |
| B2 | **Observatoire WhatsApp incomplet** : manque le lien client, la fiche message, la gestion des statuts | Expérience limitée à un simple tableau | 🟡 Moyenne |
| B3 | **n8n** : **WF - WhatsApp Ingest** importé et actif sur l'instance n8n cloud. 5 autres workflows prêts à importer (Sync Clients, Sync Editors, Sync Playbooks, Instagram Audit, Knowledge Ingest). | WhatsApp opérationnel, reste à importer les autres workflows | 🟢 Partiellement résolu |
| B4 | **Cerveau EWA** : 374 entrées Loom sont mockées. Aucune intégration API Loom. | Contenu réel du cerveau absent | 🟡 Moyenne |
| B5 | **Recherche IG / Audit** : ✅ Résolu — tables Instagram créées, service CRUD, API REST, pipeline audit mocké, seed 12 comptes, lien Cerveau EWA | Module fonctionnel avec données Supabase template | 🟢 Résolu |
| B6 | **Banque** : clés API saisies dans Paramètres mais non exploitées. Pas de Qonto/Bridge/Plaid connecté. | Dashboard bancaire entièrement fictif | 🟡 Moyenne |
| B7 | **Frame.io** : connexion simulée, pas d'OAuth/API réel | Fichiers/activity/retours mockés | 🟡 Moyenne |
| B8 | **IA / RAG** : Cerveau EWA a une recherche textuelle simple, pas de chat IA ni d'embeddings | Expérience IA non livrée | 🟢 Future |
| B9 | **WhatsApp transcripts sous-utilisés** : 153 transcripts vocaux existent mais n'alimentent aucun module | Données riches inexploitées | 🟡 Moyenne |

---

## 4. Ce qu'il reste à faire

### 4.1 Finalisation des modules existants

- Créer l'API `GET /api/whatsapp/messages`.
- Finaliser l'**Observatoire WhatsApp** (`/observatoire`) : liens clients, statuts, fiche détail, actions rapides.

### 4.2 Connecteurs & automatisations

- **n8n** : **WF - WhatsApp Ingest** ✅ actif. Reste à importer/activer : Sync Clients, Sync Editors, Sync Playbooks, Instagram Audit, Knowledge Ingest.
- **Loom API** : importer les vraies vidéos/transcripts dans `knowledge_entries`.
- **Frame.io OAuth/API** : projets, assets, reviews, uploads.
- **Banque** : Qonto API ou agrégateur alternatif (Bridge, Truelayer, Nordigen, Plaid).

### 4.3 Évolutions du Cerveau EWA

- Chat IA avec RAG sur `knowledge_entries`.
- Les audits Instagram sont déjà liés automatiquement (source `instagram_audit`, subcategory `audit-profil`).

### 4.4 Modules opportunités

- Certains modules n'existaient pas dans l'original EWA (Recherche IG, Banque) : ce sont des ajouts template.

---

## 5. Plan d'exécution détaillé

### Étape 1 : Finaliser l'Observatoire WhatsApp (priorité 1) ✅ TERMINÉE — VERSION FINALE

**Objectif** : rendre `/observatoire` pleinement fonctionnel avec la table `observatoire_messages` du Supabase template, future source unique quand le Supabase client ne sera plus accessible.

#### Historique de la décision
1. **Première version** : l'Observatoire utilisait `whatsapp_messages` (Supabase client) + `whatsapp_message_status` (template) pour les statuts humains.
2. **Analyse croisée** : découverte de la table `observatoire_messages` (8 messages mockés) avec statuts IA : `PENDING`, `VALIDATED`, `RED`.
3. **Décision** : enrichir `observatoire_messages` pour en faire la **source principale et future** des messages WhatsApp classés par n8n. Les 5634 messages bruts de `whatsapp_messages` restent accessibles temporairement, mais l'UI `/observatoire` pointe maintenant sur `observatoire_messages`.

#### Livrables créés / modifiés
- `supabase/migrations/00003_whatsapp_status.sql` — statuts humains (conservé mais non utilisé par l'UI principale)
- `supabase/migrations/00004_observatoire_enrich.sql` — enrichment de `observatoire_messages`
- `lib/supabase/whatsapp-status.ts` — service de statuts humains (conservé)
- `lib/supabase/observatoire.ts` — nouveau service CRUD `observatoire_messages`
- `app/api/whatsapp/messages/route.ts` — API messages bruts (conservée)
- `app/api/whatsapp/messages/[id]/route.ts` — fiche brute (conservée)
- `app/api/whatsapp/messages/[id]/status/route.ts` — statut humain sur brute (conservée)
- `app/api/observatoire/messages/route.ts` — liste paginée des messages classés
- `app/api/observatoire/messages/[id]/route.ts` — fiche message classé
- `app/api/observatoire/messages/[id]/status/route.ts` — mise à jour statut + notes
- `app/api/observatoire/ingest/route.ts` — endpoint n8n protégé pour ingérer des messages classés
- `app/api/clients/lookup/route.ts` — liens clients par téléphone
- `app/(dashboard)/observatoire/page.tsx` — UI réécrite sur `observatoire_messages`

#### Schéma `observatoire_messages` final
| Colonne | Description |
|---|---|
| `id` | UUID interne |
| `message_id` | UUID du message source (`whatsapp_messages.id`) — optionnel |
| `phone` | Numéro de téléphone |
| `push_name` / `sender` | Nom affiché |
| `direction` | `INBOUND` / `OUTBOUND` |
| `body` / `content` | Contenu texte |
| `transcript` | Transcript vocal |
| `media_type` / `media_url` | Média WhatsApp |
| `is_group` / `group_id` / `group_name` | Groupe |
| `raw_payload` | Payload brut WAHA |
| `client_id` | Lien client |
| `source` | `whatsapp` / `manual` |
| `status` | `pending`, `validated`, `red`, `in_progress`, `resolved` |
| `priority` | `low`, `normal`, `high`, `critical` |
| `notes` | Notes humaines |
| `created_at` / `updated_at` | Timestamps |

#### Résultat
- UI `/observatoire` affiche les 8 messages classés existants + tout futur message ingéré par n8n.
- Filtres par statut IA, priorité, direction, date, transcripts.
- Stats adaptées : total, à traiter (`red`), en attente (`pending`), validés (`validated`), transcripts.
- Actions rapides de traitement : `pending`, `in_progress`, `resolved`, `validated`, `red`.
- Drawer détail avec notes, média, payload brut.
- API d'ingestion n8n prête : `POST /api/observatoire/ingest` avec `x-n8n-token`.
- Build Next.js : ✅

#### Transition future
Quand le Supabase client ne sera plus accessible :
- Le workflow n8n `Waha1_Pacome` (ou un nouveau workflow) enverra directement vers `POST /api/observatoire/ingest` au lieu de `POST /api/whatsapp/ingest`.
- `whatsapp_messages` et `whatsapp_message_status` deviendront obsolètes.
- Aucune modification de l'UI nécessaire.

---

### Étape 2 : Créer les workflows n8n fondamentaux

**Objectif** : documenter/créer les workflows qui alimentent Supabase.

**Accès disponibles** : n8n admin.

#### 2.1 Inventaire n8n

- Se connecter à l'instance n8n admin.
- Exporter les workflows existants au format JSON dans `Plans/n8n/`.
- Confirmer les credentials disponibles.

#### 2.2 Workflows à créer/valider

| Workflow | Source | Cible Supabase | Secret |
|---|---|---|---|
| `WF - Sync Clients` | Trigger manuel / webhook / Airtable | `clients` (client) | `SUPABASE_SERVICE_ROLE_KEY` |
| `WF - Sync Editors` | Trigger manuel | `editors`, `profiles` (client) | `SUPABASE_SERVICE_ROLE_KEY` |
| `WF - Sync Playbooks` | Trigger manuel | `playbooks` (client) | `SUPABASE_SERVICE_ROLE_KEY` |
| `WF - WhatsApp Ingest` | WAHA (existant) | `whatsapp_messages` (client) | `N8N_WEBHOOK_SECRET` |
| `WF - Instagram Audit` | Apify + OpenRouter | `instagram_accounts`, `instagram_posts`, `instagram_audits` (template) | `N8N_WEBHOOK_SECRET` |
| `WF - Knowledge Ingest` | Playbooks / Académie | `knowledge_entries` (template) | `N8N_WEBHOOK_SECRET` |

#### 2.3 Standardiser la sécurité

- Tous les endpoints d'ingestion doivent vérifier le header `x-n8n-token` contre `N8N_WEBHOOK_SECRET`.
- Documenter le format attendu de chaque payload.

---

### Étape 3 : Instagram / Recherche IG (demi-réel) ✅ TERMINÉE

**Objectif** : transformer Recherche IG de mock à données semi-réelles avec pipeline d'audit.

#### Livrables créés

**Service Supabase** : `lib/supabase/instagram.ts`
- CRUD complet : `getInstagramAccounts`, `getInstagramAccountById`, `getAccountsToAudit`
- `upsertInstagramAccount`, `upsertInstagramPosts`, `createInstagramAudit`
- `getInstagramStats` (total, byCategory, saved, audited, totalFollowers)
- `getInstagramAccountsWithAudits` (avec jointure `instagram_audits`)

**API REST** (6 endpoints) :
| Endpoint | Méthode | Rôle |
|---|---|---|
| `/api/instagram/accounts` | GET | Liste avec filtres (catégorie, search, saved, tags) + stats |
| `/api/instagram/accounts/[id]` | GET | Fiche détaillée avec posts et audits |
| `/api/instagram/accounts/[id]` | PATCH | Mise à jour (saved, notes, tags...) |
| `/api/instagram/accounts/[id]` | DELETE | Suppression |
| `/api/instagram/accounts/[id]/audit` | POST | Création d'audit + lien Cerveau EWA |
| `/api/instagram/accounts-to-audit` | GET | Endpoint n8n : comptes à auditer (protégé) |
| `/api/instagram/ingest` | POST | Endpoint n8n : ingestion complète (protégé) |
| `/api/instagram/audit-pipeline` | POST | Pipeline complet : création compte mock + posts + audit + Cerveau EWA |

**Migration** : `supabase/migrations/00005_instagram_enrich.sql`
- Colonnes manquantes : `display_name`, `business_category`, `is_verified`, `scraped_at`, `tags`, `notes`, `saved`, `client_id`, `raw_profile`
- Index FTS français, index GIN sur tags, index sur followers/score/status
- Trigger `updated_at` sur `instagram_accounts`

**Seed** : `scripts/seed-instagram.mjs` — 12 comptes mockés insérés via `npm run seed:instagram`

**UI `/recherche-ig`** :
- Données lues depuis Supabase template (plus de mock local)
- Stats réelles : comptes, sauvegardés, audités, audience totale
- Champ "Nouvel audit Instagram" : tape un handle → pipeline complet
- Bouton "Auditer" sur chaque carte → posts mockés + audit + Cerveau EWA
- Score cliquable → drawer détaillé (forces, faiblesses, recommandations, 5 scores)
- Bouton "Voir" après audit

**Lien Cerveau EWA** :
- Chaque audit crée automatiquement une entrée `knowledge_entries` avec `source: "instagram_audit"`, `subcategory: "audit-profil"`
- Page `/cerveau-ewa/audit-profil` affiche les audits comme connaissances structurées
- Filtre source `instagram_audit` déjà présent dans l'UI Cerveau EWA

**Workflow n8n** : `Plans/n8n/exports/wf-instagram-audit.json` prêt à importer
- Schedule → GET accounts-to-audit → Apify scraper → OpenRouter → POST /api/instagram/ingest

---

### Étape 4 : IA / Chat Cerveau EWA ✅ TERMINÉE

**Objectif** : ajouter un chat IA avec RAG sur la base de connaissances, avec choix du provider/modèle.

#### Livrables créés

**Service AI** : `lib/ai/providers.ts`
- 3 providers : OpenAI, Ollama Cloud, OpenRouter
- 12 modèles disponibles (GPT-4o Mini → DeepSeek V4 Flash → Claude Sonnet 4.5)
- Fonction `callAI()` unifiée pour tous les providers
- Configuration persistée dans Supabase template (table `app_settings`)

**API** :
| Endpoint | Méthode | Rôle |
|---|---|---|
| `/api/knowledge/chat` | POST | Chat RAG : recherche full-text + appel IA + retour sources |
| `/api/settings/ai` | GET | Récupérer la config IA actuelle |
| `/api/settings/ai` | PATCH | Sauvegarder provider + modèle |

**Migration** : `supabase/migrations/00006_app_settings.sql`
- Table `app_settings` (key/value JSONB)
- Seed de la config par défaut : OpenAI / GPT-4o Mini

**UI Chat Cerveau EWA** (`/cerveau-ewa`) :
- Bouton "Chat IA" en haut à droite → drawer latéral
- Bulles conversationnelles avec avatar bot/user
- Sources cliquables renvoyant vers les sous-catégories
- **Bouton "Ajouter au Cerveau EWA"** quand l'IA répond hors base de connaissances
- Modal d'ajout avec titre, contenu, catégorie pré-remplis
- Sauvegarde immédiate dans `knowledge_entries` via `/api/knowledge/ingest`

**UI Paramètres IA** (`/parametres` → onglet "IA") :
- Sélecteur de fournisseur (OpenAI / Ollama Cloud / OpenRouter)
- Sélecteur de modèle (dynamique selon le provider)
- Liste des clés API requises avec leur variable d'environnement
- Bouton Sauvegarder → persisté dans Supabase template

---

### Étape 5 : Connecteurs non disponibles (planification seule)

Ces connecteurs nécessitent des accès que nous n'avons pas encore. L'architecture sera préparée mais restera inactive en attendant les credentials.

#### 5.1 Loom API

- Objectif : remplacer les 374 entrées Loom mockées par des vraies vidéos/transcripts.
- Fichiers à préparer : `app/api/loom/ingest/route.ts`.
- Workflow n8n à préparer : "Loom Sync".
- Blocage : pas de clé API Loom / compte admin Loom.

#### 5.2 Frame.io OAuth/API

- Objectif : projets, assets, reviews, uploads réels.
- Fichiers à préparer : `app/api/frameio/ingest/route.ts`, flux OAuth.
- Tables à préparer : `frameio_projects`, `frameio_assets`, `frameio_reviews`.
- Blocage : pas de token OAuth Frame.io / abonnement.

#### 5.3 Banque (Qonto / agrégateurs)

- Objectif : transactions, soldes, virements réels.
- Fichiers à préparer : `app/api/bank/ingest/route.ts`.
- Tables à préparer : `bank_connections`, `transactions`.
- Fournisseurs supportés : Bridge, Truelayer, Budget Insight, Nordigen/GoCardless, Plaid.
- Blocage : pas d'IBAN/secret Qonto ni d'accès agrégateur.

---

## 6. Fichiers importants du projet

### UI / Pages

- `app/(dashboard)/page.tsx` : Dashboard
- `app/(dashboard)/clients/page.tsx` + `ClientsTable.tsx`
- `app/(dashboard)/projets/page.tsx` + `ProjectsView.tsx`
- `app/(dashboard)/equipe/page.tsx` + `TeamView.tsx`
- `app/(dashboard)/academie/page.tsx`
- `app/(dashboard)/playbooks/page.tsx` + `PlaybooksView.tsx`
- `app/(dashboard)/frameio/page.tsx`
- `app/(dashboard)/retour-montage/page.tsx`
- `app/(dashboard)/banque/page.tsx`
- `app/(dashboard)/parametres/page.tsx`
- `app/(dashboard)/analytics/page.tsx`
- `app/(dashboard)/recherche-ig/page.tsx`
- `app/(dashboard)/cerveau-ewa/page.tsx`
- `app/(dashboard)/cerveau-ewa/[subcategory]/page.tsx`
- `app/(dashboard)/observatoire/page.tsx` ✅ finalisé

### API

- `app/api/whatsapp/ingest/route.ts` ✅
- `app/api/observatoire/messages/route.ts` ✅
- `app/api/observatoire/messages/[id]/route.ts` ✅
- `app/api/observatoire/messages/[id]/status/route.ts` ✅
- `app/api/observatoire/ingest/route.ts` ✅
- `app/api/whatsapp/messages/route.ts` ✅
- `app/api/whatsapp/messages/[id]/route.ts` ✅
- `app/api/whatsapp/messages/[id]/status/route.ts` ✅
- `app/api/whatsapp/blacklist/route.ts` ✅
- `app/api/knowledge/search/route.ts` ✅
- `app/api/knowledge/ingest/route.ts` ✅
- `app/api/knowledge/[id]/route.ts` ✅
- `app/api/knowledge/chat/route.ts` ✅
- `app/api/settings/ai/route.ts` ✅
- `app/api/instagram/ingest/route.ts` ✅
- `app/api/instagram/accounts/route.ts` ✅
- `app/api/instagram/accounts/[id]/route.ts` ✅
- `app/api/instagram/accounts/[id]/audit/route.ts` ✅
- `app/api/instagram/accounts-to-audit/route.ts` ✅
- `app/api/instagram/audit-pipeline/route.ts` ✅
- `app/api/loom/ingest/route.ts` ⏳ à préparer
- `app/api/frameio/ingest/route.ts` ⏳ à préparer
- `app/api/bank/ingest/route.ts` ⏳ à préparer

### Services Supabase

- `lib/supabase/service.ts` : client service role Supabase client
- `lib/supabase/server.ts` : client serveur Supabase client
- `lib/supabase/template.ts` : client service role Supabase template
- `lib/supabase/knowledge.ts` : CRUD `knowledge_entries`
- `lib/supabase/whatsapp.ts` : CRUD WhatsApp + blacklist
- `lib/supabase/whatsapp-status.ts` : statuts humains sur messages bruts (mode transition)
- `lib/supabase/observatoire.ts` : CRUD `observatoire_messages` (source principale)
- `lib/supabase/instagram.ts` : CRUD `instagram_accounts`, `instagram_posts`, `instagram_audits`

### Configuration

- `.env` : variables d'environnement
- `supabase/migrations/00002_cerveau_ewa_and_instagram.sql` : schéma Cerveau EWA + Instagram
- `supabase/migrations/00003_whatsapp_status.sql` : statuts humains sur messages bruts
- `supabase/migrations/00004_observatoire_enrich.sql` : schéma enrichi `observatoire_messages`
- `supabase/migrations/00005_instagram_enrich.sql` : enrichissement Instagram (colonnes, index, trigger)
- `supabase/migrations/00006_app_settings.sql` : table de configuration (provider IA, modèle, etc.)

### Scripts

- `scripts/seed-instagram.mjs` : seed 12 comptes Instagram mockés (`npm run seed:instagram`)

---

## 7. Décisions clés

- **Supabase client en lecture seule** : jamais de modification des tables `ogwqvijwbzzzmswgifvx`. ✅ Vérifié et appliqué.
- **Supabase template pour les écritures** : statuts WhatsApp, `observatoire_messages`, `knowledge_entries`, tables Instagram, `whatsapp_blacklist`.
- **Observatoire WhatsApp basculé sur `observatoire_messages`** : cette table du template deviendra la source unique des messages WhatsApp classés par n8n.
- **WF - WhatsApp Ingest redirigé** : n8n envoie maintenant vers `/api/observatoire/ingest` (template) au lieu de `/api/whatsapp/ingest` (client).
- **Mock local avec hash stable** : éviter les erreurs d'hydratation sur les modules sans données réelles.
- **WhatsApp reste dans l'Observatoire** : les transcripts ne sont pas des entrées du Cerveau EWA (règle métier).
- **Connexions bancaires simulées** : clés API saisies dans Paramètres mais non exploitées en attendant les vrais credentials.
- **n8n est le backbone des automatisations** : sans workflows n8n, l'infrastructure de données reste incomplète.

---

## 8. Accès & outils disponibles

| Outil | Disponible | Notes |
|---|---|---|
| n8n admin | ✅ | Workflows à créer/documenter |
| Apify | ✅ | Pour scraping Instagram |
| OpenRouter | ✅ | Pour IA/audits/chat |
| Loom API | ❌ | En attente credentials |
| Frame.io OAuth | ❌ | En attente token/abonnement |
| Qonto / Bridge / Plaid | ❌ | En attente credentials bancaires |

---

## 9. Prochaines étapes immédiates

1. ✅ Créer ce fichier `Recap_Projet.md`.
2. ✅ Finaliser l'Observatoire WhatsApp sur `observatoire_messages`.
3. ✅ Implémenter l'étape 2 : créer/documenter les workflows n8n fondamentaux.
4. ✅ **Implémenter l'étape 3** : pipeline Instagram / Audit avec Apify + OpenRouter.
5. ✅ **Implémenter l'étape 4** : IA / Chat Cerveau EWA avec RAG.
6. ✅ **WF - WhatsApp Ingest** importé et actif sur l'instance n8n cloud, redirigé vers `/api/observatoire/ingest`.
7. ✅ **wf-knowledge-ingest** et **wf-instagram-audit** importés (bloqués : credentials Apify/OpenRouter à configurer dans n8n).
8. ✅ Workflows Sync supprimés (non pertinents — données déjà en base).
9. ✅ **Déploiement Vercel** : https://template-ewa-app.vercel.app
10. ✅ **Audit écritures Supabase client** : plus aucune écriture — lecture seule respectée.
11. ✅ **Credentials n8n configurés** (Apify + OpenRouter).
12. ✅ **Messages WAHA dans l'Observatoire** — flux opérationnel.

---

> Ce document est vivant. À mettre à jour après chaque étape terminée.
