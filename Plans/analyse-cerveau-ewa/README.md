# Analyse Cerveau EWA — Base de connaissances et IA interne

> Objectif : valider/invalider les hypothèses sur le Cerveau EWA avant implémentation.
> Date : juillet 2026
> Projet cible : `template-ewa-app`

---

## 1. État actuel dans `template-ewa-app` — ✅ Implémenté

Le module `/cerveau-ewa` est maintenant fonctionnel avec une base de connaissances autonome dans notre Supabase `yfeutiagwgbrsbncmixx`.

### Fonctionnalités livrées

- Dashboard avec les 3 KPIs originaux : **Vidéos Loom**, **Formations & Scripts**, **Sous-catégories**.
- 18 sous-catégories exactes du build original EWA, avec icônes et couleurs personnalisées.
- Recherche textuelle globale + filtre par source.
- Navigation vers `/cerveau-ewa/{subcategory}` avec fiche détaillée.
- Affichage des entrées en **markdown**.
- Section dédiée aux **vidéos Loom** avec liens directs.
- Boutons **Modifier / Supprimer** par entrée.
- API CRUD complète : `GET /api/knowledge/search`, `POST /api/knowledge/ingest`, `PATCH /api/knowledge/[id]`, `DELETE /api/knowledge/[id]`.

### Données actuelles dans `knowledge_entries`

| Source | Entrées | Nature |
|---|---|---|
| `loom` | 374 | Mockées — structure réaliste, prêtes à être remplacées par vraies vidéos Loom |
| `formation` | 8 | Mockées |
| `script` | 8 | Mockées |
| `manual` | 2 | Vrais playbooks du Supabase client (`Contenu pour femme 18-25ans`, `Contenu pour Maman`) |
| **Total** | **392** | Base de connaissances interne fonctionnelle |

> Les 163 transcripts WhatsApp ont été **retirés** de `knowledge_entries` car ils appartiennent au module Observatoire, pas au Cerveau EWA.

---

## 2. État actuel dans `templaterV2-ewa-app`

Version un peu plus aboutie mais **toujours mockée** :

- Header avec icône cerveau.
- Barre de recherche : "Posez une question à Cerveau EWA..."
- 4 suggestions d'IA mockées (productivité, tendances, équipe, clients).
- Aucune connexion à une base de connaissances réelle.

---

## 3. Architecture originale EWA (extraite du build)

Le build original (`Modele App EWA`) contient un `CerveauDashboard` et un `CerveauSearchResults` beaucoup plus riches.

### Catégories de connaissance

| Clé | Label | Description |
|---|---|---|
| `retour-client` | Retour client | Reviews montages, retours qualité, corrections |
| `montage` | Montage | Techniques CapCut, styles, sous-titrage, colorimétrie |
| `scripting` | Scripting | Structures de scripts, hooks, templates, IA |
| `ads` | Ads / Pub | Scripts publicitaires, hooks ads, conversion |
| `audit-profil` | Audit profil | **Audits Instagram, bios, optimisation profil** |
| `contenu` | Contenu / Idées | Idées de contenu, formats, calendrier éditorial |
| `tournage` | Tournage | Cadrage, lumière, b-rolls, setup face caméra |
| `process` | Process | Workflow interne, outils, organisation |
| `formation` | Formation | Formations générales, onboarding, montée en compétence |
| `proposition` | Proposition | Propositions clients, offres, pitch |
| `stories` | Stories | Stories Instagram, formats éphémères, engagement |
| `outil` | Outils / Tutos | Tutoriels outils, Frame.io, Notion, logiciels |
| `design` | Design / Style | Direction artistique, charte graphique, styles visuels |
| `strategie` | Stratégie | Positionnement, branding, stratégie de contenu |
| `client` | Client | Relation client, suivi, communication |
| `conversion` | Conversion | Vente, CTA, tunnels, offres |
| `viralite` | Viralité | Algorithme, tendances, reach, viralité |
| `autre` | Autre | Divers, non classé |

### Sources de connaissance

| Source | Label | Couleur |
|---|---|---|
| `loom` | Loom | violet |
| `formation` | Formation | bleu |
| `script` | Script | orange |
| `manual` | Manuel | gris |
| `whatsapp` | WhatsApp | vert |

### Structure d'une entrée de connaissance (déduite du build)

```ts
interface KnowledgeEntry {
  id: string
  title: string
  content: string
  category: string        // catégorie principale
  subcategory: string       // clé de la catégorie ci-dessus
  source: "loom" | "formation" | "script" | "manual" | "whatsapp"
  sources: {
    loom?: number
    formation?: number
    script?: number
    manual?: number
    whatsapp?: number
  }
  metadata?: {
    subcategory?: string
  }
  created_at: string
}
```

### Dashboard Cerveau EWA original

- Titre : "Cerveau EWA — Base de connaissances interne — {totalEntries} entrées"
- 3 KPIs : Vidéos Loom, Formations & Scripts, Sous-catégories
- Grille des sous-catégories avec icône, description, nombre d'entrées, compteur Loom
- Recherche textuelle dans toutes les transcriptions
- Navigation `/cerveau-ewa/{subcategory}` puis `/cerveau-ewa/{subcategory}/{id}`
- Résultats de recherche avec surlignage du contexte autour du terme recherché

---

## 4. Schéma Supabase client (`ogwqvijwbzzzmswgifvx`)

### Tables actives confirmées

| Table | Lignes | Utilité pour Cerveau EWA |
|---|---|---|
| `clients` | 289 | Relation client, `instagram_url`, tags, briefs |
| `editors` | 9 | Compétences monteurs, bio, skills |
| `profiles` | 4 | Rôles staff |
| `playbooks` | 2 | Contenu procédural qui peut devenir entrée `manual`/`formation` |
| `whatsapp_messages` | 5153 | Messages avec **153 transcripts vocaux** → source `whatsapp` potentielle |

### Tables inexistantes liées au Cerveau EWA

- `knowledge_entries`, `knowledge_base`, `brain`, `entries`, `cerveau_ewa`
- `loom_videos`, `scripts`, `manuals`, `formations`
- `ai_embeddings`, `vectors`, `search_index`

### Colonnes intéressantes pour le Cerveau EWA

- `whatsapp_messages.transcript` : 153 messages vocaux déjà transcrits.
- `whatsapp_messages.body` : texte des messages.
- `whatsapp_messages.client_id` : lien vers un client.
- `playbooks.content` & `checklist` : procédures existantes.
- `clients.tags`, `clients.montage_brief` : connaissances client contextuelles.
- `editors.skills`, `editors.bio` : connaissances équipe.

---

## 5. Workflows n8n existants — lien avec Cerveau EWA

### Modèles LLM utilisés

- `gpt-5` (OpenAI)
- `anthropic/claude-sonnet-4.5` (via OpenRouter)

### Workflows utilisant l'IA

| Workflow | Usage IA |
|---|---|
| `WF2 - Qualification` | Qualification prospects WhatsApp (Claude/OpenAI) |
| `WF5 - Suivi groupe WhatsApp` | Réponse IA secrétaire dans groupe client |
| `Template` | Contient un AI Agent OpenRouter désactivé + node Supabase |

### Intégrations n8n

- WAHA (WhatsApp)
- Supabase
- OpenRouter
- Airtable (legacy)

### Intégrations NON présentes

- Aucune intégration Loom
- Aucune intégration de transcription dédiée (Deepgram, Whisper, AssemblyAI)
- Aucune intégration vectorielle (Pinecone, Weaviate, Supabase `pgvector`)

---

## 6. Hypothèses validées / invalidées

| # | Hypothèse | Statut | Preuve |
|---|---|---|---|
| H1 | Le Cerveau EWA original est une base de connaissances structurée par catégories | ✅ Validé | Build original avec 18 catégories et dashboard dédié. |
| H2 | Les sources de connaissance incluent Loom, formations, scripts, manuel, WhatsApp | ✅ Validé | Mapping `sources` dans le build original. |
| H3 | Les transcripts WhatsApp sont une source réelle de connaissance | ✅ Validé | 153 messages vocaux transcrits dans `whatsapp_messages.transcript`. |
| H4 | Il existe une table `knowledge_entries` ou équivalente dans Supabase | ❌ Invalidé | Aucune table de ce type. |
| H5 | Loom est connecté via API ou webhook pour alimenter le Cerveau EWA | ⚠️ Non confirmé | Aucune intégration Loom dans n8n ni dans le code. Les URLs Loom sont stockées manuellement dans les playbooks. |
| H6 | Les formations (Académie) alimentent le Cerveau EWA automatiquement | ⚠️ Non confirmé | L'Académie existe en UI mais aucun pipeline vers le Cerveau EWA. |
| H7 | Le Cerveau EWA utilise un moteur de recherche vectorielle | ❌ Invalidé | Aucune table `pgvector`, aucun embedding, recherche textuelle simple dans le build original. |
| H8 | L'IA du Cerveau EWA passe par OpenRouter (Claude/OpenAI) | ✅ Partiellement validé | OpenRouter est utilisé dans les workflows WhatsApp, mais pas encore pour le Cerveau EWA. |

---

## 7. Sources de connaissance réelles disponibles aujourd'hui

### Source 1 : WhatsApp (la plus mature)

- **Volume** : 5153 messages, dont 153 transcripts vocaux.
- **Qualité** : conversations clients/monteurs, briefs, retours, questions récurrentes.
- **Pipeline existant** : n8n WAHA → `/api/whatsapp/ingest` → `whatsapp_messages`.
- **Opportunité** : transformer les messages/textos en entrées `whatsapp` du Cerveau EWA.

### Source 2 : Playbooks

- **Volume** : 2 playbooks réels + 4 mockés.
- **Contenu** : procédures, checklists, exemples, liens Loom.
- **Opportunité** : exporter chaque playbook comme entrée `manual`/`formation`.

### Source 3 : Académie

- **Volume** : 5 vraies vidéos YouTube + mockées.
- **Opportunité** : générer des entrées `formation` avec transcription YouTube.

### Source 4 : Loom

- **Volume** : URLs Loom dans les playbooks, mais pas de données brutes.
- **Opportunité** : récupérer les transcripts Loom via l'API Loom ou via n8n.

### Source 5 : Retours montage

- **Volume** : module mocké actuellement.
- **Opportunité** : futur lien avec Frame.io pour alimenter `retour-client`.

---

## 8. Architecture cible proposée

```
[SOURCES]
  ├── WhatsApp (transcripts + texte) ──→ n8n ──┐
  ├── Playbooks ────────────────────────────────┤
  ├── Académie / YouTube ─────────────────────→│
  ├── Loom ─────────────────────────────────────┤
  ├── Retours montage ──────────────────────────┤
  └── Audits Instagram (Recherche IG) ────────────┘
                    │
                    ▼
        [NORMALISATION n8n]
                    │
                    ▼
        [Supabase : knowledge_entries]
                    │
                    ▼
        [Cerveau EWA UI]
            ├── Dashboard par catégories
            ├── Recherche textuelle
            ├── Fiche entrée
            └── Chat IA (OpenRouter)
```

### Table `knowledge_entries` recommandée

```sql
CREATE TABLE knowledge_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  category TEXT NOT NULL,        -- ex: montage, scripting, audit-profil
  subcategory TEXT NOT NULL,     -- alias de category pour compatibilité UI
  source TEXT NOT NULL,          -- loom | formation | script | manual | whatsapp | instagram_audit
  sources JSONB DEFAULT '{}',    -- { loom: 0, formation: 0, script: 0, manual: 0, whatsapp: 1 }
  metadata JSONB DEFAULT '{}',   -- contexte spécifique à la source
  client_id UUID REFERENCES clients(id),
  editor_id UUID REFERENCES editors(id),
  original_id TEXT,              -- ID source (ex: waha_message_id, playbook_id)
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

---

## 9. Implémentation réalisée

### Fichiers créés / modifiés

| Fichier | Rôle |
|---|---|
| `app/(dashboard)/cerveau-ewa/page.tsx` | Dashboard principal avec 18 catégories, stats, recherche |
| `app/(dashboard)/cerveau-ewa/[subcategory]/page.tsx` | Fiche sous-catégorie avec markdown, Loom, edit/delete |
| `lib/supabase/knowledge.ts` | Service CRUD `knowledge_entries` |
| `lib/supabase/template.ts` | Client Supabase template (service role) |
| `lib/supabase/template-client.ts` | Client Supabase template (browser) |
| `app/api/knowledge/search/route.ts` | Recherche d'entrées + stats |
| `app/api/knowledge/ingest/route.ts` | Ingestion protégée (n8n) |
| `app/api/knowledge/[id]/route.ts` | GET / PATCH / DELETE d'une entrée |
| `supabase/migrations/00002_cerveau_ewa_and_instagram.sql` | Schéma `knowledge_entries` + tables Instagram |
| `scripts/seed-cerveau-mock.js` | Seed des entrées Loom/formation/script mockées |
| `.env` | Variables du Supabase template ajoutées |

### Ce qui reste à faire (évolutions)

- Intégrer les **vraies vidéos Loom** via l'API Loom ou export workspace.
- Ajouter un **chat IA** avec RAG sur `knowledge_entries` (OpenRouter).
- Connecter **Académie YouTube** pour générer des entrées `formation`.
- Connecter **Recherche IG** (audits profil) quand le pipeline sera prêt.

---

## 10. Fichiers de référence

- `app/(dashboard)/cerveau-ewa/page.tsx`
- `app/(dashboard)/cerveau-ewa/[subcategory]/page.tsx`
- `lib/supabase/knowledge.ts`
- `Modele App EWA/_next/static/chunks/app/Dashboard/cerveau-ewa/cerveau_EWA.js` : build original complet.
- `Plans/analyse-infra/README.md` : analyse Recherche IG / Audit en stand by.

---

## 11. Notes importantes

- Les entrées WhatsApp ne doivent **pas** être dans le Cerveau EWA : elles appartiennent à l'**Observatoire WhatsApp**.
- Le Cerveau EWA est alimenté par des **connaissances structurées** : Loom, formations, scripts, playbooks, audits.
- Recherche IG reste **en stand by** en attendant les bons workflows n8n.
