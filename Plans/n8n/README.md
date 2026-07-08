# n8n — Workflows EWA

> Dossier des workflows n8n pour le template EWA.
> Les exports au format JSON sont prêts à importer dans n8n (`Workflows > Import from File`).

---

## Prérequis

### Variables d'environnement côté n8n

Dans l'instance n8n, configurer :

```env
N8N_WEBHOOK_SECRET=ewa_wh_sk_2026_xK9mP
SUPABASE_SERVICE_ROLE_KEY=<clé service role du Supabase client>
TEMPLATE_SUPABASE_SERVICE_ROLE_KEY=<clé service role du Supabase template>
OPENROUTER_API_KEY=<clé OpenRouter>
APIFY_API_TOKEN=<clé Apify>
NEXT_PUBLIC_APP_URL=http://localhost:3000  # ou l'URL de prod
```

### Credentials Supabase

Créer un credential n8n de type **Supabase API** par projet :

| Credential | Host | Key | Usage |
|---|---|---|---|
| `Supabase Service Role - Client` | `https://ogwqvijwbzzzmswgifvx.supabase.co` | `SUPABASE_SERVICE_ROLE_KEY` | `clients`, `editors`, `profiles`, `playbooks`, `whatsapp_messages` |
| `Supabase Service Role - Template` | `https://yfeutiagwgbrsbncmixx.supabase.co` | `TEMPLATE_SUPABASE_SERVICE_ROLE_KEY` | `knowledge_entries`, tables Instagram, Frame.io, banque |

**Important** : dans les fichiers JSON exportés, remplacer `TODO_SERVICE_ROLE_CREDENTIAL_ID` par l'ID réel du credential Supabase créé dans n8n.

---

## Workflows disponibles

| Fichier | Workflow | Description | Déclencheur | Cible |
|---|---|---|---|---|
| `wf-whatsapp-ingest.json` | **WF - WhatsApp Ingest** | Reçoit les messages WAHA et les envoie à l'app | Webhook WAHA | `/api/whatsapp/ingest` |
| `wf-sync-clients.json` | **WF - Sync Clients** | Alimente la table `clients` | Manuel | Supabase client `clients` |
| `wf-sync-editors.json` | **WF - Sync Editors** | Alimente `editors` + `profiles` | Manuel | Supabase client |
| `wf-sync-playbooks.json` | **WF - Sync Playbooks** | Alimente `playbooks` | Manuel | Supabase client |
| `wf-instagram-audit.json` | **WF - Instagram Audit** | Scraping Apify + audit OpenRouter | Cron quotidien | `/api/instagram/ingest` |
| `wf-knowledge-ingest.json` | **WF - Knowledge Ingest** | Convertit les playbooks en `knowledge_entries` | Manuel | `/api/knowledge/ingest` |

---

## Endpoints d'ingestion

Tous les endpoints POST sont protégés par le header `x-n8n-token`.

### `POST /api/whatsapp/ingest`

```json
{
  "waha_message_id": "msg-id",
  "phone": "33612345678",
  "push_name": "Marie",
  "direction": "INBOUND",
  "body": "Bonjour",
  "is_group": false,
  "group_id": "",
  "media_type": "",
  "media_url": "",
  "raw_payload": {}
}
```

### `POST /api/observatoire/ingest`

```json
{
  "message_id": "uuid-source",
  "phone": "33612345678",
  "push_name": "Marie",
  "direction": "INBOUND",
  "body": "...",
  "transcript": "...",
  "media_type": "",
  "media_url": "",
  "is_group": false,
  "group_id": "",
  "group_name": "",
  "raw_payload": {},
  "client_id": "uuid-client",
  "source": "whatsapp",
  "status": "pending",
  "priority": "normal",
  "notes": ""
}
```

### `POST /api/knowledge/ingest`

```json
{
  "title": "Contenu pour Maman",
  "content": "...",
  "category": "contenu",
  "subcategory": "contenu",
  "source": "manual",
  "metadata": { "origin": "playbook", "playbook_id": "uuid" },
  "original_id": "uuid",
  "original_table": "playbooks"
}
```

Sources acceptées : `loom`, `formation`, `script`, `manual`, `whatsapp`, `instagram_audit`.

### `POST /api/instagram/ingest`

```json
{
  "account": {
    "handle": "mariedp",
    "name": "Marie Dupont",
    "bio": "...",
    "followers": 1234,
    "following": 567,
    "posts_count": 89,
    "engagement_rate": 4.5,
    "profile_pic_url": "...",
    "website": "...",
    "category": "client",
    "tags": ["fitness", "coaching"],
    "source": "apify"
  },
  "posts": [
    { "post_url": "...", "caption": "...", "likes": 120, "comments": 12, "posted_at": "2026-01-01T00:00:00Z" }
  ],
  "audit": {
    "content": "...",
    "strengths": ["..."],
    "weaknesses": ["..."],
    "recommendations": ["..."],
    "score": 78,
    "model": "anthropic/claude-sonnet-4.5"
  }
}
```

---

## Procédure d'import dans n8n

1. Se connecter à l'instance n8n admin.
2. Aller dans **Workflows** > **Import from File**.
3. Sélectionner les fichiers JSON du dossier `exports/`.
4. Remplacer les credentials `TODO_SERVICE_ROLE_CREDENTIAL_ID` par le vrai ID Supabase.
5. Activer le workflow **WF - WhatsApp Ingest** et copier l'URL du webhook.
6. Configurer WAHA pour poster sur cette URL.
7. Tester chaque workflow en mode manuel.

---

## Workflows existants à exporter

Exporter depuis l'instance n8n admin les workflows listés dans `Plans/etape-02-workflows-n8n.md` :

| ID | Nom |
|---|---|
| `2gwJT4ck1svfbspi` | Template |
| `2hPPFCi8uSXp08dL` | WF5 - Suivi groupe WhatsApp |
| `4g36Xhr5uf36LJJ6` | WF2 - Qualification |
| `7DLrtpiuo1cJ8AOU` | Error tracking |
| `C9x3nnrBoqobH9Ef` | WF-Detection-Validation |
| `Cet5o1GDJK78e8Lu` | WF3 - Création groupe WhatsApp |
| `Qz2yJugKzJBkHypp` | Waha1_Pacome |
| `pfZ12H7yXefu5o7J` | WF4 - Airtable CRM |
| `v8OyEMZglthwRaSc` | WF8 - Communication de Crise |

Les exporter sous `Plans/n8n/exports/existing/` pour conserver une sauvegarde.

---

## Notes

- Les workflows de sync (Clients, Editors, Playbooks) utilisent un **trigger manuel** avec un nœud Function contenant des données exemples. Remplacer ce nœud par votre vraie source (Airtable, Google Sheets, Notion, webhook).
- Le workflow Instagram Audit nécessite un acteur Apify configuré et testé car les formats de sortie varient selon l'acteur.
- Le workflow Knowledge Ingest lit depuis `playbooks` du Supabase client et catégorise avec OpenRouter.
