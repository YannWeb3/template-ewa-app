const fs = require('fs');
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_TEMPLATE_SUPABASE_URL,
  process.env.TEMPLATE_SUPABASE_SERVICE_ROLE_KEY
);

const SUBCATEGORIES = [
  { id: 'retour-client', label: 'Retour client', category: 'client' },
  { id: 'montage', label: 'Montage', category: 'technique' },
  { id: 'scripting', label: 'Scripting', category: 'contenu' },
  { id: 'ads', label: 'Ads / Pub', category: 'sales' },
  { id: 'audit-profil', label: 'Audit profil', category: 'market' },
  { id: 'contenu', label: 'Contenu / Idées', category: 'contenu' },
  { id: 'tournage', label: 'Tournage', category: 'technique' },
  { id: 'process', label: 'Process', category: 'methodologie' },
  { id: 'formation', label: 'Formation', category: 'mindset' },
  { id: 'proposition', label: 'Proposition', category: 'sales' },
  { id: 'stories', label: 'Stories', category: 'contenu' },
  { id: 'outil', label: 'Outils / Tutos', category: 'technique' },
  { id: 'design', label: 'Design / Style', category: 'contenu' },
  { id: 'strategie', label: 'Stratégie', category: 'methodologie' },
  { id: 'client', label: 'Client', category: 'client' },
  { id: 'conversion', label: 'Conversion', category: 'sales' },
  { id: 'viralite', label: 'Viralité', category: 'market' },
  { id: 'autre', label: 'Autre', category: 'autre' },
];

const LOOM_TITLES = [
  'Review montage V1 — client fitness',
  'Retour sur hooks ads coaching',
  'Correction colorimétrie reel',
  'Setup face caméra pour coach',
  'Template script VSL',
  'Process validation livraison',
  'Formation onboarding éditeur',
  'Audit Instagram — compte business',
  'Idées de contenu juillet',
  'Workflow Frame.io → Notion',
  'Stratégie contenu femme 18-25',
  'Pitch proposition 3 offres',
  'Tuto export CapCut pro',
  'Direction artistique dark mode',
  'CTA et tunnel de conversion',
  'Analyse viralité reel 100k',
  'B-rolls et planification tournage',
  'Stories engageantes — best practices',
  'Relation client : relances',
  'Outils d\'automation montage',
];

const LOOM_TRANSCRIPTS = [
  'On va reprendre le montage depuis le début. Le hook est bon mais le rythme du cut doit être plus dynamique. Pense à ajouter des zooms progressifs et à caler la musique sur les transitions.',
  'Pour les hooks ads, la règle d\'or c\'est : problème + promesse + preuve en moins de 3 secondes. On garde le premier plan, on coupe tout le reste.',
  'La colorimétrie est trop froide. Monte les rouges et baisse légèrement les bleus. Le skin tone du client doit ressortir naturel.',
  'Le setup face caméra : œil de bœuf à hauteur des yeux, lumière 45°, fond flou. Évite le contre-jour, ça tue la qualité.',
  'Structure VSL : accroche émotionnelle, story, transformation, offre, CTA. Chaque partie fait 20-25% du temps total.',
  'Nouveau process validation : V1 envoyée → 48h retour client max → retouches en 24h → V2 → validation orale ou écrite obligatoire.',
  'Onboarding éditeur : semaine 1 on shadow, semaine 2 premier montage supervisé, semaine 3 autonomie, semaine 4 review qualité.',
  'L\'audit Instagram se fait en 5 points : bio, feed, reels, stories, CTA. On note chaque critère de 0 à 5 et on priorise les quick wins.',
  'Calendrier éditorial juillet : 3 reels par semaine, 1 carrousel, 5 stories par jour. Thèmes : process, résultats client, behind the scenes.',
  'Workflow Frame.io → Notion : commentaire résolu = carte Notion déplacée. Retouche demandée = nouvelle tâche assignée.',
  'Stratégie contenu femme 18-25 : format carrousel éducatif + reel transformation + stories interactives. Ton : proche, inspirant, sans langage corporate.',
  'Proposition 3 offres : starter, growth, scale. Chaque offre a un prix, une livraison, un résultat promis. Jamais plus de 3 options.',
  'Export CapCut pro : H.264, 1080p minimum, 30fps, bitrate élevé. Pas de compression double, ça dégrade le rendu final.',
  'Direction artistique dark mode : noir profond, orange EWA en accent, typographie clean, espacement généreux. Pas plus de 3 couleurs principales.',
  'CTA efficace : un seul appel à l\'action par vidéo, répété 2 fois. La fin du reel doit dire exactement quoi faire.',
  'Analyse viralité : 100k vues viennent d\'un hook fort + rétention 70% + partage en story. Le sujet doit être polarisant ou hyper utile.',
  'Tournage optimisé : 5 plans par idée, 15 secondes max par plan, variété d\'angles. Ça donne du rythme au montage.',
  'Stories engageantes : boomerang, sondage, slider, réponse aux DM. Le but c\'est la conversation, pas la perfection.',
  'Relances client : 48h après V1, 24h après V2. Message court, une question fermée, proposition de call si bloqué.',
  'Automation montage : templates de texte, presets de couleurs, banques de musiques classées. Moins on réfléchit, plus on produit.',
];

function rand(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function generateLoomEntries(count) {
  const entries = [];
  for (let i = 0; i < count; i++) {
    const sub = rand(SUBCATEGORIES);
    const titleBase = rand(LOOM_TITLES);
    const transcript = rand(LOOM_TRANSCRIPTS);
    entries.push({
      title: `${titleBase} #${i + 1}`,
      content: transcript,
      category: sub.category,
      subcategory: sub.id,
      source: 'loom',
      sources: { loom: 1 },
      metadata: {
        loom_url: `https://www.loom.com/share/mock-${(100000 + i).toString(36)}`,
        duration_seconds: 120 + Math.floor(Math.random() * 480),
        subcategory_label: sub.label,
      },
      original_id: null,
      original_table: null,
    });
  }
  return entries;
}

function generateFormationScriptEntries(countFormation, countScript) {
  const entries = [];
  for (let i = 0; i < countFormation; i++) {
    const sub = rand(SUBCATEGORIES.filter(s => s.id !== 'formation'));
    entries.push({
      title: `Formation — ${sub.label} ${i + 1}`,
      content: `Module formation sur ${sub.label}. Ce module couvre les fondamentaux, les erreurs courantes et les exercices pratiques pour monter en compétence rapidement.`,
      category: sub.category,
      subcategory: sub.id,
      source: 'formation',
      sources: { formation: 1 },
      metadata: { type: 'formation', subcategory_label: sub.label },
    });
  }
  for (let i = 0; i < countScript; i++) {
    const sub = rand(SUBCATEGORIES.filter(s => s.id !== 'scripting'));
    entries.push({
      title: `Script — ${sub.label} ${i + 1}`,
      content: `Script prêt à l'emploi pour ${sub.label}. Hook, corps, CTA et variations inclus. À adapter selon la voix du créateur.`,
      category: sub.category,
      subcategory: sub.id,
      source: 'script',
      sources: { script: 1 },
      metadata: { type: 'script', subcategory_label: sub.label },
    });
  }
  return entries;
}

async function seed() {
  // 2 playbooks existent déjà. On vise 394 total => 392 à ajouter.
  // Répartition cible : 376 loom, 16 formation/script (par exemple 8 formation + 8 script)
  const loomEntries = generateLoomEntries(374); // 376 - 2 playbooks (manual) ≈ 374 loom + 2 manual
  const formationScriptEntries = generateFormationScriptEntries(8, 8);

  const all = [...loomEntries, ...formationScriptEntries];
  console.log('Inserting', all.length, 'entries...');

  const batchSize = 50;
  for (let i = 0; i < all.length; i += batchSize) {
    const batch = all.slice(i, i + batchSize);
    const { error } = await supabase.from('knowledge_entries').insert(batch);
    if (error) {
      console.error('Batch error', i, error);
      process.exit(1);
    }
    console.log('Inserted batch', i / batchSize + 1);
  }

  const { count, error } = await supabase.from('knowledge_entries').select('*', { count: 'exact', head: true });
  console.log('Total knowledge_entries now:', count, error ? error.message : '');
}

seed().catch(console.error);
