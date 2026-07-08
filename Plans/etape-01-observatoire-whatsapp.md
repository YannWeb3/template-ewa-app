# Étape 1 — Finaliser l'Observatoire WhatsApp ✅ TERMINÉE

> Objectif final : l'Observatoire est maintenant basé sur `observatoire_messages` dans le Supabase template `yfeutiagwgbrsbncmixx`, qui deviendra la source unique des messages WhatsApp classés par n8n.
> Principe : le Supabase client `ogwqvijwbzzzmswgifvx` reste en lecture seule. Toutes les écritures se font dans le Supabase template.

---

## Historique de la décision

### Version 1 (intermédiaire)
- Lecture des messages depuis `whatsapp_messages` (Supabase client).
- Statuts humains stockés dans `whatsapp_message_status` (Supabase template).

### Version 2 (finale)
- Découverte de `observatoire_messages` dans le Supabase template : 8 messages avec statuts IA (`PENDING`, `VALIDATED`, `RED`).
- Enrichissement de `observatoire_messages` pour en faire la source principale.
- L'UI `/observatoire` pointe maintenant sur `observatoire_messages`.

---

## Fichiers créés / modifiés

| Fichier | Rôle | État |
|---|---|---|
| `supabase/migrations/00003_whatsapp_status.sql` | Statuts humains sur messages bruts (mode transition) | ✅ Créé et appliqué |
| `supabase/migrations/00004_observatoire_enrich.sql` | Schéma enrichi `observatoire_messages` | ✅ Créé et appliqué |
| `lib/supabase/whatsapp-status.ts` | Service statuts messages bruts | ✅ Créé |
| `lib/supabase/observatoire.ts` | Service CRUD `observatoire_messages` | ✅ Créé |
| `app/api/whatsapp/messages/route.ts` | API messages bruts | ✅ Conservé |
| `app/api/whatsapp/messages/[id]/route.ts` | Fiche message brut | ✅ Conservé |
| `app/api/whatsapp/messages/[id]/status/route.ts` | Statut humain message brut | ✅ Conservé |
| `app/api/observatoire/messages/route.ts` | Liste messages classés | ✅ Créé |
| `app/api/observatoire/messages/[id]/route.ts` | Fiche message classé | ✅ Créé |
| `app/api/observatoire/messages/[id]/status/route.ts` | Mise à jour statut + notes | ✅ Créé |
| `app/api/observatoire/ingest/route.ts` | Endpoint n8n pour ingestion | ✅ Créé |
| `app/api/clients/lookup/route.ts` | Lien clients par téléphone | ✅ Créé |
| `app/(dashboard)/observatoire/page.tsx` | UI Observatoire | ✅ Réécrit |

---

## Schéma `observatoire_messages` final

```sql
CREATE TABLE observatoire_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id UUID, -- lien optionnel vers whatsapp_messages.id
  phone TEXT,
  push_name TEXT NOT NULL DEFAULT '',
  sender TEXT,
  direction TEXT NOT NULL DEFAULT 'INBOUND' CHECK (direction IN ('INBOUND', 'OUTBOUND')),
  body TEXT NOT NULL DEFAULT '',
  content TEXT,
  transcript TEXT,
  media_type TEXT NOT NULL DEFAULT '',
  media_url TEXT NOT NULL DEFAULT '',
  is_group BOOLEAN NOT NULL DEFAULT false,
  group_id TEXT NOT NULL DEFAULT '',
  group_name TEXT,
  raw_payload JSONB,
  client_id UUID,
  source TEXT NOT NULL DEFAULT 'whatsapp' CHECK (source IN ('whatsapp', 'manual')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'validated', 'red', 'resolved', 'in_progress')),
  priority TEXT NOT NULL DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'critical')),
  notes TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

---

## API endpoints

### `GET /api/observatoire/messages`
Query params : `search`, `status`, `priority`, `direction`, `source`, `onlyTranscripts`, `startDate`, `endDate`, `limit`, `offset`.

### `GET /api/observatoire/messages/[id]`
Retourne la fiche complète d'un message classé.

### `PATCH /api/observatoire/messages/[id]/status`
Body : `{ status, notes? }`.
Statuts acceptés : `pending`, `validated`, `red`, `resolved`, `in_progress`.

### `POST /api/observatoire/ingest`
Header requis : `x-n8n-token`.
Body attendu : payload complet d'un message WhatsApp classé par n8n.

---

## UI `/observatoire`

- Stats : total, à traiter (`red`), en attente (`pending`), validés (`validated`), transcripts.
- Filtres : recherche, statut, priorité, direction, date, transcripts.
- Tableau avec : date, contact, client lié, direction, contenu, type, priorité, statut, actions.
- Drawer détail : contact, client, date, groupe, statut, priorité, actions, notes, contenu, média, payload brut.
- Actions rapides : `pending`, `in_progress`, `resolved`, `validated`, `red`.

---

## Transition future

Quand le Supabase client ne sera plus accessible :
1. Modifier le workflow n8n WAHA existant (`Waha1_Pacome`) ou créer un nouveau workflow.
2. Au lieu d'envoyer vers `POST /api/whatsapp/ingest`, il enverra vers `POST /api/observatoire/ingest`.
3. L'IA n8n qualifie le message et définit `status` (`red`, `pending`, `validated`) et `priority` (`low` à `critical`).
4. L'UI `/observatoire` continue de fonctionner sans modification.
5. `whatsapp_messages` et `whatsapp_message_status` deviennent obsolètes.

---

## Tests validés

- [x] `GET /api/observatoire/messages` retourne les messages classés.
- [x] `PATCH /api/observatoire/messages/[id]/status` met à jour statut + notes.
- [x] `POST /api/observatoire/ingest` insère un nouveau message (protégé par token).
- [x] Build Next.js passe sans erreur.
- [x] Aucune écriture sur le Supabase client.

---

## Notes

- Ne pas toucher à `templaterV2-ewa-app`.
- `whatsapp_messages` reste accessible temporairement via `/api/whatsapp/messages`.
- Les 8 entrées `observatoire_messages` initiales ont été migrées avec les nouveaux statuts minuscules.
