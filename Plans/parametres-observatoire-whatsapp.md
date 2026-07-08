# Paramètres — Observatoire WhatsApp (EWA)

## Objectif

Système 100% lecture seule qui capte les messages WhatsApp via n8n, filtre les numéros personnels via une liste rouge, et stocke le reste dans Supabase. L'app ne répond jamais et n'envoie rien.

## Architecture

```
WAHA (WhatsApp) → n8n (webhook) → POST /api/whatsapp/ingest → filtre liste rouge → Supabase
```

## Endpoint unique

```
POST https://ewa-app.vercel.app/api/whatsapp/ingest
Header: x-n8n-token: ewa_wh_sk_2026_xK9mP
```

C'est le seul point d'entrée. Le filtre liste rouge s'applique ici avant tout stockage.

## Workflow n8n

- **Nom** : Qz2yJugKzJBkHypp
- **Projet** : celui que WAHA appelle sur `/webhook/waha-EWA_Pacome-webhooks`
- **Action** : HTTP POST vers l'endpoint ci-dessus (remplace l'ancienne écriture directe Supabase)
- **Body JSON** (mappé depuis l'event WAHA) :

```json
{
  "waha_message_id": "{{ $json.body.payload.id }}",
  "phone": "{{ $json.body.payload.participant || $json.body.payload.from }}",
  "push_name": "{{ ($json.body.payload._data && $json.body.payload._data.notifyName) || '' }}",
  "direction": "{{ $json.body.payload.fromMe ? 'OUTBOUND' : 'INBOUND' }}",
  "body": "{{ $json.body.payload.body || '' }}",
  "is_group": "{{ ($json.body.payload.from || '').includes('@g.us') }}",
  "group_id": "{{ ($json.body.payload.from || '').includes('@g.us') ? $json.body.payload.from : '' }}",
  "media_type": "{{ ($json.body.payload.hasMedia && $json.body.payload.media) ? $json.body.payload.media.mimetype.split('/')[0] : '' }}",
  "media_url": "{{ ($json.body.payload.hasMedia && $json.body.payload.media) ? $json.body.payload.media.url : '' }}",
  "raw_payload": "{{ $json.body.payload }}"
}
```

## Tables Supabase

### `whatsapp_messages`
Stockage des messages filtrés (lecture seule).

| Colonne | Type | Description |
|---|---|---|
| id | BIGINT PK | Auto-généré |
| waha_message_id | TEXT UNIQUE | ID unique WAHA |
| phone | TEXT | Numéro expéditeur |
| push_name | TEXT | Nom WhatsApp |
| direction | TEXT | INBOUND / OUTBOUND |
| body | TEXT | Texte du message |
| is_group | BOOLEAN | Groupe ou non |
| group_id | TEXT | ID du groupe |
| media_type | TEXT | image/video/... |
| media_url | TEXT | URL du média |
| raw_payload | JSONB | Payload brut |
| created_at | TIMESTAMPTZ | Auto |

### `whatsapp_blacklist`
Liste rouge des numéros à ignorer.

| Colonne | Type | Description |
|---|---|---|
| id | BIGINT PK | Auto-généré |
| phone | TEXT UNIQUE | Numéro à bloquer |
| label | TEXT | Label (ex: "Perso") |
| created_at | TIMESTAMPTZ | Auto |

## API Routes (Next.js App Router)

### `POST /api/whatsapp/ingest`
- Valide le header `x-n8n-token` (secret partagé)
- Vérifie si le numéro est dans la blacklist → si oui, retourne `200 { status: "blocked" }`
- Insère le message dans `whatsapp_messages`
- Retourne `201 { status: "ingested" }`

### `GET /api/whatsapp/blacklist`
Liste tous les numéros de la liste rouge.

### `POST /api/whatsapp/blacklist`
Ajoute un numéro à la liste rouge. Body : `{ phone, label }`.

### `DELETE /api/whatsapp/blacklist?phone=...`
Supprime un numéro de la liste rouge.

## Variables d'environnement

### template-ewa-app (Supabase client EWA)
```
NEXT_PUBLIC_SUPABASE_URL=https://ogwqvijwbzzzmswgifvx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9nd3F2aWp3Ynp6em1zd2dpZnZ4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkzNTg0NDgsImV4cCI6MjA5NDkzNDQ0OH0.HwMwxFCTt6fXc97oFxA-jYNMSiVc3XL1W5KglS0N5qc
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9nd3F2aWp3Ynp6em1zd2dpZnZ4Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3OTM1ODQ0OCwiZXhwIjoyMDk0OTM0NDQ4fQ.QhQAcrbwABeybYeduzc36D5tpSgkDyd2rZQBRvqvTfw
N8N_WEBHOOK_SECRET=ewa_wh_sk_2026_xK9mP
```

### templaterV2-ewa-app (Supabase EWA interne)
```
NEXT_PUBLIC_SUPABASE_URL=https://yfeutiagwgbrsbncmixx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlmZXV0aWFnd2dicnNibmNtaXh4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc4MDg0NzAsImV4cCI6MjA5MzM4NDQ3MH0.fmU5B_qpse3t6T8Gm2Rg_xNQVcwbn1pfJw7xzdU6TF8
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlmZXV0aWFnd2dicnNibmNtaXh4Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NzgwODQ3MCwiZXhwIjoyMDkzMzg0NDcwfQ.DGvBe9IdmUWwInDLi1q_Axd9lFePutjyTlmhctJ4tzw
```

## Accès n8n (si besoin)

- Email : camara.ianne@gmail.com
- Mot de passe : Pocpocmaster33!
- API Key : eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI4Y2NhZGFiYy02ZGQyLTQ4MDctOGY3NC1hNDFlNDJlMjAyMzMiLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwianRpIjoiMzUwZDdiZmItMDY1ZC00YmM3LWFmODMtZmQ1MTQwZWE3NWQ2IiwiaWF0IjoxNzgyNTY1NjEzfQ.rTSWpXFOpSU_-o2GbfFBK2RBHAhrdVkkFkgMc-WaIc0

## Fichiers du projet (template-ewa-app)

```
app/
  api/
    whatsapp/
      ingest/route.ts      ← endpoint de réception n8n
      blacklist/route.ts    ← CRUD liste rouge
lib/
  supabase/
    client.ts              ← client browser Supabase
    server.ts              ← client server Supabase
    whatsapp.ts            ← service WhatsApp (insert, blacklist, etc.)
.env                       ← variables d'environnement
supabase/
  migrations/
    00001_whatsapp_observatoire.sql  ← script SQL des tables
```
Accès app versel : 

->https://ewa-app.vercel.app/login

-adresse mail : ianne@ewa-dev.com
-mdp : EwaDev2026!

Mode editeur : 

-editor@ewa-test.com
-EwaEdit2026!