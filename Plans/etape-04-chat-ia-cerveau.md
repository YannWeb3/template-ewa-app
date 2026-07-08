# Étape 4 — Chat IA / RAG sur le Cerveau EWA

> Objectif : ajouter un chat IA capable de répondre depuis la base de connaissances du Cerveau EWA.
> Accès requis : OpenRouter.
> Données cibles : `knowledge_entries` dans le Supabase template `yfeutiagwgbrsbncmixx`.

---

## 1. Contexte

### État actuel
- Le Cerveau EWA a 392 entrées structurées par 18 sous-catégories.
- La recherche actuelle est textuelle simple.
- L'original EWA a une barre de recherche "Posez une question à Cerveau EWA..." mais sans véritable IA connectée dans le build analysé.

### Opportunité
- Ajouter un chat IA avec RAG (Retrieval-Augmented Generation) pour répondre aux questions du staff.
- Utiliser OpenRouter pour appeler Claude ou GPT.

---

## 2. Architecture cible

```
Question utilisateur
        │
        ▼
[API /api/knowledge/chat]
        │
        ├───▶ Recherche dans knowledge_entries (full-text ou vectoriel)
        │
        ▼
[Construction du prompt]
        │
        ▼
[OpenRouter Claude/GPT]
        │
        ▼
Réponse + sources citées
```

---

## 3. Option d'indexation

### Option A — Full-text PostgreSQL (recommandé pour commencer)

Avantages :
- Rapide à mettre en place.
- Pas de dépendance externe.
- Suffisant pour 392 entrées.

Inconvénients :
- Moins performant sur les questions sémantiques.
- Nécessite des mots-clés présents dans la question.

#### Migration

```sql
ALTER TABLE knowledge_entries ADD COLUMN IF NOT EXISTS search_vector tsvector;

UPDATE knowledge_entries
SET search_vector = to_tsvector('french', coalesce(title, '') || ' ' || coalesce(content, ''));

CREATE INDEX idx_knowledge_entries_search ON knowledge_entries USING GIN(search_vector);
```

### Option B — pgvector (évolution future)

Avantages :
- Recherche sémantique.
- Meilleure compréhension des questions.

Inconvénients :
- Nécessite de générer des embeddings.
- Coût OpenRouter/OpenAI pour les embeddings.
- Plus complexe.

---

## 4. Créer l'API `POST /api/knowledge/chat`

**Fichier** : `app/api/knowledge/chat/route.ts`

### Body attendu

```json
{
  "question": "Comment faire un bon hook pour une vidéo fitness ?"
}
```

### Étapes internes

1. **Recherche de contexte**
   - Avec full-text : `SELECT * FROM knowledge_entries WHERE search_vector @@ plainto_tsquery('french', $1) LIMIT 5`
   - Avec vectoriel (futur) : recherche par similarité cosinus.

2. **Construction du prompt**

```txt
Tu es Cerveau EWA, un assistant expert en création de contenu, montage vidéo et stratégie Instagram pour l'agence EWA.
Réponds à la question en te basant UNIQUEMENT sur les extraits de la base de connaissances ci-dessous.
Si la réponse n'est pas dans les extraits, dis-le clairement.

EXTRAITS :
{context}

QUESTION : {question}

Réponds de manière concise et actionnable. Cite les titres des sources utilisées.
```

3. **Appel OpenRouter**

```ts
const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
  method: "POST",
  headers: {
    "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
    "Content-Type": "application/json",
    "HTTP-Referer": process.env.NEXT_PUBLIC_APP_URL,
    "X-Title": "Template EWA App"
  },
  body: JSON.stringify({
    model: "anthropic/claude-sonnet-4.5",
    messages: [{ role: "user", content: prompt }],
    temperature: 0.3,
    max_tokens: 1500
  })
})
```

4. **Retour**

```json
{
  "answer": "...",
  "sources": [
    { "id": "uuid", "title": "Hooks et approche", "subcategory": "scripting", "source": "formation" }
  ]
}
```

### Gestion des erreurs
- Si OpenRouter indisponible : retourner une erreur 503 avec message clair.
- Si aucun contexte trouvé : retourner `answer: "Je n'ai pas trouvé de réponse dans le Cerveau EWA."`.

---

## 5. Créer le service `lib/ai/openrouter.ts`

**Fichier** : `lib/ai/openrouter.ts`

### Fonction principale

```ts
export async function askOpenRouter(prompt: string, model?: string): Promise<{ content: string; usage?: { prompt: number; completion: number } }>
```

### Modèles supportés
- `anthropic/claude-sonnet-4.5` (défaut)
- `openai/gpt-5`
- `anthropic/claude-3.5-sonnet`

---

## 6. Enrichir l'UI du Cerveau EWA

### 6.1 Ajouter une section chat sur `/cerveau-ewa`

Composant : `components/cerveau-chat.tsx`

Fonctionnalités :
- Input "Posez une question au Cerveau EWA..."
- Historique de conversation (session locale).
- Affichage de la réponse en markdown.
- Liste des sources utilisées sous la réponse.
- Bouton "Nouvelle conversation".
- États de chargement.

### 6.2 Suggestions rapides

Afficher 4 suggestions mockées comme dans l'original EWA :
- "Comment améliorer la productivité des monteurs ?"
- "Quelles sont les tendances du moment ?"
- "Comment gérer un client difficile ?"
- "Quels sont les meilleurs hooks pour le fitness ?"

### 6.3 Fiche sous-catégorie

Conserver l'affichage markdown. Ajouter éventuellement un bouton "Poser une question sur cette catégorie" qui pré-remplit le chat.

---

## 7. Créer le composant `components/cerveau-chat.tsx`

### Props

```ts
interface CerveauChatProps {
  subcategory?: string // optionnel, pour filtrer les recherches
}
```

### États

```ts
const [messages, setMessages] = useState<Message[]>([])
const [input, setInput] = useState("")
const [loading, setLoading] = useState(false)
```

### Affichage

- Bulles utilisateur à droite (orange).
- Bulles assistant à gauche (gris).
- Sources affichées sous chaque réponse assistant.
- Bouton copier la réponse.
- Skeleton loader pendant la réponse.

---

## 8. Améliorations optionnelles

### 8.1 Filtrer par sous-catégorie

Dans le prompt, privilégier les entrées de la sous-catégorie courante si l'utilisateur pose une question depuis `/cerveau-ewa/{subcategory}`.

### 8.2 Sauvegarde des conversations

Stocker l'historique dans le Supabase template :

```sql
CREATE TABLE IF NOT EXISTS chat_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT,
  messages JSONB NOT NULL DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

### 8.3 Feedback sur les réponses

Ajouter des boutons 👍 / 👎 pour chaque réponse.

```sql
CREATE TABLE IF NOT EXISTS chat_feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID,
  message_index INTEGER,
  rating INTEGER, -- 1 ou -1
  comment TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

---

## 9. Tests et validation

### 9.1 API
- [ ] `POST /api/knowledge/chat` retourne une réponse.
- [ ] Les sources sont correctement citées.
- [ ] Le full-text retourne des résultats pertinents.
- [ ] Gestion des erreurs OpenRouter.

### 9.2 UI
- [ ] Le chat s'affiche sur `/cerveau-ewa`.
- [ ] Les suggestions fonctionnent.
- [ ] Les sources sont cliquables et mènent aux fiches.
- [ ] L'historique de session persiste.

### 9.3 Qualité des réponses
- [ ] Tester 10 questions métier.
- [ ] Vérifier que l'IA ne répond pas hors contexte.
- [ ] Ajuster le prompt si nécessaire.

---

## 10. Fichiers à créer/modifier

| Fichier | Action |
|---|---|
| `lib/ai/openrouter.ts` | Créer |
| `app/api/knowledge/chat/route.ts` | Créer |
| `components/cerveau-chat.tsx` | Créer |
| `app/(dashboard)/cerveau-ewa/page.tsx` | Modifier |
| `supabase/migrations/00005_knowledge_fulltext.sql` | Créer |
| `supabase/migrations/00006_chat_conversations.sql` | Créer (optionnel) |

---

## 11. Notes

- Commencer par la full-text PostgreSQL. C'est suffisant pour 392 entrées.
- Le modèle par défaut est `anthropic/claude-sonnet-4.5` car déjà utilisé dans les workflows existants.
- Coût OpenRouter : compteur à surveiller (Claude Sonnet 4.5 ~ 3$/1M tokens input, 15$/1M output).
- Les réponses doivent toujours rester ancrées dans `knowledge_entries` (pas d'hallucination).
