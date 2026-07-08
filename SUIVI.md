# Suivi Template EWA App

> Dernière mise à jour : juillet 2026

## Contexte

Réplication de l'app EWA originale dans `template-ewa-app`. `templaterV2-ewa-app` ne doit pas être touché.
Le Supabase client (`ogwqvijwbzzzmswgifvx`) est utilisé en lecture seule via `service_role`.

## Modules terminés

### Dashboard (`/`)
- Header mois `Juillet 2026`
- 5 KPIs mockés
- Évolution CA (12 mois), répartition par format
- Projets urgents, Top 5 clients
- Performance monteurs, finances/charges
- Fond corrigé `hsl(0_0%_7.5%)`

### Clients (`/clients`)
- 289 vrais contacts Supabase
- Filtres statut/source/complétude/pays
- Recherche
- Tableau avec CA mocké, complétude, dernier contact WhatsApp
- Lien onboarding

### Projets (`/projets`)
- 20 projets mockés liés aux vrais clients et 9 vrais monteurs
- Vues Grille / Liste / Kanban
- Recherche, filtres statut/format, budget

### Équipe (`/equipe`)
- 9 monteurs réels (table `editors`)
- 4 profils staff réels (table `profiles`)
- Filtres type/statut, vue grille/liste
- Stats mockées côté template

### Académie (`/academie`)
- Vraies références YouTube EWA intégrées :
  - Présentation EWA
  - Ton premier jour
  - Couper au bon moment
  - Hooks et approche
  - Sound Design
- Autres formations mockées
- CRUD local : créer / dépublier / supprimer
- Filtres catégorie/niveau/format/statut

### Playbooks (`/playbooks`)
- 2 vrais playbooks Supabase (`Contenu pour femme 18-25ans`, `Contenu pour Maman`)
- 4 playbooks mockés
- Vue grille/liste, modal détail avec checklist interactive
- CRUD local

### Frame.io (`/frameio`)
- Bouton "Connecté : EWA" + lien d'authentification Frame.io
- Fichiers récents mockés
- Activité monteurs
- 3 KPIs basiques

### Retour montage (`/retour-montage`)
- Tableau des retours clients mockés
- Filtres statut/priorité/source
- Actions rapides (résolu/en cours)
- 5 KPIs

### Observatoire WhatsApp (`/observatoire`)
- Source principale : table `observatoire_messages` du Supabase template `yfeutiagwgbrsbncmixx`
- 8 messages classés initiaux (statuts `pending`, `validated`, `red`) + ingestion future via n8n
- Filtres statut/priorité/direction/date/transcripts
- Recherche textuelle
- Tableau avec contact, client lié, contenu, type, priorité, statut
- Drawer détail avec notes, média, payload brut
- Actions rapides : `pending`, `in_progress`, `resolved`, `validated`, `red`
- API ingestion n8n : `POST /api/observatoire/ingest`

### Banque (`/banque`)
- Dashboard bancaire mocké
- Solde total, entrées/sorties Juillet
- 3 comptes (Qonto, Wise) avec IBAN
- Graphique flux mensuels
- Transactions avec filtres recherche/catégorie/type
- Modal détail compte
- Modal virement (simulation)

### Paramètres (`/parametres`)
- Onglet Général (cartes placeholder)
- Onglet Connexions bancaires :
  - Liste des connexions (connecté/erreur)
  - Synchroniser / supprimer
  - Ajouter une connexion (nom, fournisseur API, clé API)
  - Fournisseurs supportés : Bridge, Truelayer, Budget Insight, Nordigen/GoCardless, Plaid
- Onglet Observatoire WhatsApp avec blacklist

### Analytics (`/analytics`)
- Dashboard fidèle à l'original EWA
- CA encaissé, dépenses totales, marge nette, paiements éditeurs
- Projets/retouches à 0 (données réelles indisponibles)
- Évolution CA & Marge sur 10 mois
- Sources d'acquisition basées sur les vrais clients
- Production Frame.io mockée (fichiers, uploads, volume)
- Tendance uploads sur 12 mois
- Productivité monteurs basée sur les vrais editors
- Volume production par client (vrais clients)
- KPIs bas : délai moyen, projets livrés, retouches, clients total

### Recherche IG (`/recherche-ig`) ✅
- Données lues depuis Supabase template (table `instagram_accounts`)
- 12 comptes seed via `npm run seed:instagram`
- Stats réelles : comptes suivis, sauvegardés, audités, audience totale
- Filtres catégorie, recherche, tags, sauvegardés
- Pipeline d'audit : champ "Nouvel audit Instagram" + bouton "Auditer" sur chaque carte
- Création automatique de posts mockés + audit + entrée dans le Cerveau EWA
- Drawer détail avec forces, faiblesses, recommandations, 5 scores (global, profil, contenu, engagement, conversion)
- Score cliquable, bouton "Voir" après audit
- API REST complète : accounts, ingest, audit-pipeline, accounts-to-audit (n8n)

## Modules en attente

- Aucun — tous les modules initialement prévus sont terminés. Les prochaines étapes sont des connecteurs externes (n8n, Apify, OpenRouter).

## Modules implémentés récemment

### Cerveau EWA (`/cerveau-ewa`) ✅

- Base de connaissances interne avec **392 entrées** dans notre Supabase `yfeutiagwgbrsbncmixx`.
- 18 sous-catégories exactes du build original EWA, avec icônes et couleurs personnalisées.
- Dashboard avec KPIs : **Vidéos Loom**, **Formations & Scripts**, **Sous-catégories**.
- Recherche textuelle + filtre par source (dont `instagram_audit`).
- Navigation `/cerveau-ewa/{subcategory}` avec fiche détaillée.
- Contenu affiché en **markdown**.
- Section **Vidéos Loom** avec liens directs.
- Actions **Modifier / Supprimer** par entrée.
- API CRUD complète.
- **Lien Instagram** : les audits créent automatiquement des entrées `knowledge_entries` avec `source: "instagram_audit"`, `subcategory: "audit-profil"`.
- **Chat IA avec RAG** : drawer latéral, recherche full-text + appel IA (OpenAI / Ollama Cloud / OpenRouter), sources cliquables.
- **Bouton "Ajouter au Cerveau EWA"** : quand l'IA répond hors base, possibilité d'ajouter la connaissance directement.
- **Provider IA configurable** dans Paramètres > IA (OpenAI, Ollama Cloud, OpenRouter, 12 modèles).

**Composition des 392 entrées :**

| Source | Entrées | Nature |
|---|---|---|
| `loom` | 374 | Mockées — remplaçables par vraies vidéos Loom |
| `formation` | 8 | Mockées |
| `script` | 8 | Mockées |
| `manual` | 2 | Vrais playbooks du Supabase client |

> Les transcripts WhatsApp ont été retirés du Cerveau EWA car ils appartiennent à l'Observatoire.

## Décisions clés

- Utilisation de `SUPABASE_SERVICE_ROLE_KEY` pour lire les tables avec RLS restrictives.
- Notre Supabase `yfeutiagwgbrsbncmixx` est utilisé comme base template autonome pour `knowledge_entries` et les tables propres à l'app.
- Le Supabase client `ogwqvijwbzzzmswgifvx` reste en lecture seule pour les données opérationnelles (clients, monteurs, WhatsApp, playbooks).
- `whatsapp_blacklist` gérée côté app sans toucher au Supabase client.
- Modules sans données réelles entièrement mockés côté template.
- CA client, stats équipe, financements, données bancaires : tous mockés avec hash stable pour éviter les erreurs d'hydratation.
- Les connexions bancaires sont simulées localement. En production, les clés API seraient chiffrées côté serveur.

## Fichiers importants

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
- `app/(dashboard)/cerveau-ewa/page.tsx`
- `app/(dashboard)/cerveau-ewa/[subcategory]/page.tsx`
- `app/api/observatoire/ingest/route.ts`
- `app/api/observatoire/messages/route.ts`
- `app/api/observatoire/messages/[id]/route.ts`
- `app/api/observatoire/messages/[id]/status/route.ts`
- `app/api/whatsapp/messages/route.ts`
- `app/api/whatsapp/messages/[id]/route.ts`
- `app/api/whatsapp/messages/[id]/status/route.ts`
- `app/api/clients/lookup/route.ts`
- `lib/supabase/observatoire.ts`
- `lib/supabase/whatsapp-status.ts`
- `supabase/migrations/00003_whatsapp_status.sql`
- `supabase/migrations/00004_observatoire_enrich.sql`
- `.env`

## Prochaines étapes suggérées

### Finalisation UI/UX
1. ✅ Recherche IG
2. ✅ Cerveau EWA
3. ✅ Observatoire WhatsApp
4. ✅ Chat IA Cerveau EWA avec RAG
5. ✅ Paramètres IA (provider/modèle)

### Automatisations & connecteurs
6. ✅ **Connecteur n8n** : **WF - WhatsApp Ingest** actif sur `n8nv3.iapourasso.com`. **wf-knowledge-ingest** et **wf-instagram-audit** importés (bloqués : app non déployée). Workflows Sync supprimés (non pertinents — données déjà en base).
7. **Intégration Loom** : importer les 374 vidéos Loom réelles et leurs transcripts dans le Cerveau EWA. Bloqué : pas de clé API Loom.
8. **Frame.io OAuth/API** : projets, assets, reviews, uploads. Bloqué : pas de token/abonnement.
9. **Qonto API / agrégateur bancaire** : transactions, soldes, virements réels. Bloqué : pas de credentials.
10. **WhatsApp transcripts** : exploiter les 153 transcripts vocaux existants dans l'Observatoire.
11. **Déploiement** : déployer l'app Next.js (Vercel/Railway) et mettre à jour l'URL dans les workflows n8n.

> Pour l'instant, les modules Banque et Analytics utilisent des données mockées. Les clés API sont saisies dans Paramètres > Connexions bancaires mais non exploitées. Les entrées Loom du Cerveau EWA sont mockées en attendant l'intégration réelle.
