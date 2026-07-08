# Étape 2 — Créer les workflows n8n fondamentaux

> Objectif : documenter et créer les workflows n8n qui alimentent Supabase (client et template).
> Accès requis : n8n admin.

---

## 1. Inventaire n8n

### 1.1 Se connecter à l'instance n8n
- Récupérer l'URL et les credentials n8n admin.
- Exporter tous les workflows existants au format JSON dans `Plans/n8n/exports/existing/`.
- Les workflows existants sont listés dans `Plans/n8n/README.md`.

### 1.2 Workflows prêts à importer

Les exports ready-to-import se trouvent dans `Plans/n8n/exports/`.

| Fichier | Workflow | Déclencheur | Cible |
|---|---|---|---|
| `wf-whatsapp-ingest.json` | WF - WhatsApp Ingest | Webhook WAHA | `/api/whatsapp/ingest` |
| `wf-sync-clients.json` | WF - Sync Clients | Manuel | Supabase client `clients` |
| `wf-sync-editors.json` | WF - Sync Editors | Manuel | Supabase client `editors` + `profiles` |
| `wf-sync-playbooks.json` | WF - Sync Playbooks | Manuel | Supabase client `playbooks` |
| `wf-instagram-audit.json` | WF - Instagram Audit | Cron quotidien | `/api/instagram/ingest` |
| `wf-knowledge-ingest.json` | WF - Knowledge Ingest | Manuel | `/api/knowledge/ingest` |

Voir `Plans/n8n/README.md` pour la procédure d'import et les payloads détaillés.

### 1.2 Workflows existants connus

| ID | Nom | Actif | Description |
|---|---|---|---|
| `2gwJT4ck1svfbspi` | Template | ❌ | Template avec AI Agent OpenRouter désactivé + node Supabase WhatsApp |
| `2hPPFCi8uSXp08dL` | WF5 - Suivi groupe WhatsApp | ❌ | Gestion groupe WA + IA Claude/OpenAI |
| `4g36Xhr5uf36LJJ6` | WF2 - Qualification | ❌ | Qualification prospects WhatsApp |
| `7DLrtpiuo1cJ8AOU` | Error tracking | ❌ | Suivi d'erreurs |
| `C9x3nnrBoqobH9Ef` | WF-Detection-Validation | ❌ | Détection/validation |
| `Cet5o1GDJK78e8Lu` | WF3 - Création groupe WhatsApp | ❌ | Création de groupes WAHA |
| `Qz2yJugKzJBkHypp` | Waha1_Pacome | ✅ | Webhook WAHA → POST `/api/whatsapp/ingest` |
| `pfZ12H7yXefu5o7J` | WF4 - Airtable CRM | ❌ | Sync prospects Airtable ↔ app |
| `v8OyEMZglthwRaSc` | WF8 - Communication de Crise | ❌ | Envoi massif WhatsApp |

---

## 2. Workflows à créer/valider

### 2.1 WF - Sync Clients

**Objectif** : alimenter la table `clients` du Supabase client.

#### Source possible
- Trigger manuel
- Webhook depuis CRM externe
- Airtable (legacy WF4)

#### Cible
- Supabase client `ogwqvijwbzzzmswgifvx`
- Table `clients`

#### Format du payload attendu par l'app
```json
{
  "id": "uuid",
  "name": "Marie Dupont",
  "phone": "33612345678",
  "email": "marie@example.com",
  "instagram_url": "https://instagram.com/mariedp",
  "status": "active",
  "source": "whatsapp",
  "tags": ["fitness", "coaching"]
}
```

#### Sécurité
- Utiliser `service_role` Supabase côté n8n (pas l'`anon_key`).
- Ne pas exposer la clé dans les logs.

---

### 2.2 WF - Sync Editors

**Objectif** : alimenter `editors` et `profiles`.

#### Source
- Trigger manuel ou Google Sheets/Notion.

#### Cible
- Supabase client : tables `editors`, `profiles`.

#### Format
```json
{
  "editor": {
    "id": "uuid",
    "name": "Jean Martin",
    "email": "jean@ewa.fr",
    "skills": ["capcut", "sound-design"],
    "status": "active"
  },
  "profile": {
    "id": "uuid",
    "editor_id": "uuid",
    "role": "editor",
    "hide_financials": false
  }
}
```

---

### 2.3 WF - Sync Playbooks

**Objectif** : alimenter `playbooks`.

#### Source
- Notion / Google Docs / trigger manuel.

#### Cible
- Supabase client : table `playbooks`.

#### Format
```json
{
  "id": "uuid",
  "title": "Contenu pour Maman",
  "content": "...",
  "checklist": ["..."],
  "examples": ["..."],
  "loom_url": "https://loom.com/...",
  "position": 1
}
```

---

### 2.4 WF - WhatsApp Ingest (existant)

**Objectif** : vérifier/stabiliser le workflow actif `Waha1_Pacome`.

#### Pipeline
```
WAHA → Webhook n8n → POST /api/whatsapp/ingest (x-n8n-token) → Supabase client.whatsapp_messages
```

#### Vérifications
- [x] Le header `x-n8n-token` est bien envoyé (modèle JSON).
- [x] Le payload contient tous les champs requis : `waha_message_id`, `phone`, `push_name`, `direction`, `body`, `is_group`, `group_id`, `media_type`, `media_url`, `raw_payload`.
- [x] La blacklist est bien vérifiée avant insertion (côté app).
- [x] Les messages bloqués retournent `{ status: "blocked" }`.

---

### 2.5 WF - Instagram Audit

**Objectif** : scraper Instagram + générer un audit IA + envoyer à l'app.

**Accès requis** : Apify, OpenRouter.

#### Pipeline
```
Trigger manuel/cron → Apify (scraper profil) → OpenRouter (génération audit) → POST /api/instagram/ingest
```

#### Détail des nœuds

**Nœud 1 — Trigger**
- Type : Schedule (quotidien) ou Manual.

**Nœud 2 — Récupérer les comptes à auditer**
- HTTP Request `GET /api/instagram/accounts-to-audit` (à créer côté app)
- Ou lecture directe dans Supabase template `instagram_accounts`.

**Nœud 3 — Apify Instagram Scraper**
- Utiliser l'acteur Apify : `apify/instagram-profile-scraper` ou équivalent.
- Input : `usernames` (tableau de handles).
- Output : followers, following, posts_count, bio, posts (caption, likes, comments).

**Nœud 4 — OpenRouter (Audit IA)**
- Modèle : `anthropic/claude-sonnet-4.5`.
- Prompt système : tu es un expert Instagram, analyse ce profil et ces posts. Donne forces, faiblesses, 5 recommandations concrètes, score /100.
- Output structuré en JSON.

**Nœud 5 — HTTP Request**
- `POST /api/instagram/ingest`
- Header `x-n8n-token: {{N8N_WEBHOOK_SECRET}}`
- Body : `{ account, posts, audit }`.

---

### 2.6 WF - Knowledge Ingest

**Objectif** : transformer Playbooks et Académie en entrées `knowledge_entries`.

#### Pipeline
```
Trigger manuel/cron → Récupérer playbooks/académie → OpenRouter (catégorisation) → POST /api/knowledge/ingest
```

#### Format de sortie
```json
{
  "title": "Contenu pour Maman",
  "content": "...",
  "category": "contenu",
  "subcategory": "contenu",
  "source": "manual",
  "sources": { "manual": 1 },
  "metadata": { "origin": "playbook", "playbook_id": "uuid" }
}
```

---

## 3. Standardisation des endpoints d'ingestion

Tous les endpoints d'ingestion doivent vérifier le header `x-n8n-token` :

```ts
const token = request.headers.get("x-n8n-token")
if (!token || token !== process.env.N8N_WEBHOOK_SECRET) {
  return Response.json({ error: "Unauthorized" }, { status: 401 })
}
```

### Endpoints concernés
- `POST /api/whatsapp/ingest` ✅
- `POST /api/observatoire/ingest` ✅
- `POST /api/knowledge/ingest` ✅
- `POST /api/instagram/ingest` ⏳ (créé étape 3)
- `POST /api/loom/ingest` ⏳
- `POST /api/frameio/ingest` ⏳
- `POST /api/bank/ingest` ⏳

---

## 4. Variables d'environnement n8n

| Variable | Description |
|---|---|
| `N8N_WEBHOOK_SECRET` | Token commun pour authentifier les webhooks |
| `SUPABASE_SERVICE_ROLE_KEY` | Clé service role du Supabase client |
| `TEMPLATE_SUPABASE_SERVICE_ROLE_KEY` | Clé service role du Supabase template |
| `OPENROUTER_API_KEY` | Clé API OpenRouter |
| `APIFY_API_TOKEN` | Clé API Apify |

### Note importante

Dans les fichiers JSON exportés, les credentials Supabase sont référencés avec l'ID placeholder `TODO_SERVICE_ROLE_CREDENTIAL_ID`. Remplacer cet ID par l'identifiant réel du credential Supabase API créé dans l'instance n8n.

---

## 5. Livrables

1. Dossier `Plans/n8n/exports/existing/` avec les workflows existants exportés (à faire depuis l'interface n8n admin).
2. Workflows n8n créés et prêts à importer dans `Plans/n8n/exports/` pour :
   - Sync Clients
   - Sync Editors
   - Sync Playbooks
   - Instagram Audit
   - Knowledge Ingest
3. Documentation des webhooks et payloads dans `Plans/n8n/README.md`.
4. Vérification du workflow WhatsApp existant : modèle JSON reproduit dans `wf-whatsapp-ingest.json`.
5. Sécurisation de `/api/knowledge/ingest` avec `x-n8n-token`.
6. Variables d'environnement n8n ajoutées dans `.env`.

---

## 6. Fichiers liés

- `app/api/whatsapp/ingest/route.ts`
- `app/api/instagram/ingest/route.ts` (créé étape 3)
- `app/api/knowledge/ingest/route.ts`
- `.env`
- `Plans/n8n/exports/`

---

## 7. Tests

- [ ] Importer les workflows dans l'instance n8n admin.
- [ ] Remplacer `TODO_SERVICE_ROLE_CREDENTIAL_ID` par les vrais IDs de credentials.
- [ ] Chaque workflow peut être déclenché manuellement.
- [ ] Chaque webhook reçoit le bon token.
- [ ] Les données arrivent correctement dans Supabase.
- [ ] Les erreurs sont loguées dans n8n.

---

## 8. Notes

- Prioriser les workflows qui ne nécessitent pas de credentials externes manquants.
- Le workflow Instagram Audit est réalisable dès l'étape 3 terminée.
- Le workflow Knowledge Ingest peut être créé en parallèle de l'étape 1.
