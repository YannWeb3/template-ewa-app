import { createClient } from "@supabase/supabase-js"
import { readFileSync } from "fs"
import { resolve, dirname } from "path"
import { fileURLToPath } from "url"

const __dirname = dirname(fileURLToPath(import.meta.url))
const envPath = resolve(__dirname, "..", ".env")

function loadEnv(path) {
  const content = readFileSync(path, "utf-8")
  const env = {}
  for (const line of content.split("\n")) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith("#")) continue
    const eqIndex = trimmed.indexOf("=")
    if (eqIndex === -1) continue
    const key = trimmed.slice(0, eqIndex).trim()
    let value = trimmed.slice(eqIndex + 1).trim()
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1)
    }
    env[key] = value
  }
  return env
}

const env = loadEnv(envPath)

const supabaseUrl = env.NEXT_PUBLIC_TEMPLATE_SUPABASE_URL
const supabaseKey = env.TEMPLATE_SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error("❌ TEMPLATE_SUPABASE variables manquantes dans .env")
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: { autoRefreshToken: false, persistSession: false },
})

const SEED_ACCOUNTS = [
  {
    handle: "lewis",
    display_name: "Lewis",
    category: "concurrent",
    followers: 48200,
    following: 134,
    posts_count: 412,
    bio: "Motion & short-form content for brands that move fast.",
    external_url: "https://instagram.com",
    tags: ["motion", "reels", "brand"],
    notes: "Fort sur les transitions. Potentiel benchmark hook.",
    saved: true,
  },
  {
    handle: "ewa.studio",
    display_name: "EWA Studio",
    category: "client",
    followers: 12400,
    following: 287,
    posts_count: 198,
    bio: "Agence de production short-form. L'authenticité scale.",
    external_url: "https://instagram.com",
    tags: ["agence", "short-form", "production"],
    notes: "Compte principal. À monitorer pour calendrier éditorial.",
    saved: true,
  },
  {
    handle: "maison.edits",
    display_name: "Maison Edits",
    category: "concurrent",
    followers: 28900,
    following: 412,
    posts_count: 356,
    bio: "Creative studio. Edits & direction artistique.",
    external_url: "https://instagram.com",
    tags: ["direction artistique", "edits", "créatif"],
    notes: "Style très dark / premium. Inspirant pour référentiels clients luxe.",
    saved: false,
  },
  {
    handle: "sarah.business",
    display_name: "Sarah Business",
    category: "prospect",
    followers: 8600,
    following: 540,
    posts_count: 224,
    bio: "Coaching entrepreneur. 7 figures en 18 mois.",
    external_url: "https://instagram.com",
    tags: ["business", "coaching", "femme"],
    notes: "Prospect chaud. Recherche régulière de monteurs reels.",
    saved: true,
  },
  {
    handle: "julie.fitclub",
    display_name: "Julie Fit Club",
    category: "prospect",
    followers: 15300,
    following: 320,
    posts_count: 267,
    bio: "Coach sportive & créatrice de programmes.",
    external_url: "https://instagram.com",
    tags: ["fitness", "femme", "reels"],
    notes: "Bonne activité. Format carrousel à proposer.",
    saved: false,
  },
  {
    handle: "visual.mentor",
    display_name: "Visual Mentor",
    category: "inspiration",
    followers: 67200,
    following: 210,
    posts_count: 518,
    bio: "Tips, tutorials & visual storytelling.",
    external_url: "https://instagram.com",
    tags: ["tutoriel", "storytelling", "tips"],
    notes: "Excellent pour playbook hooks. Sauvegarder les top posts.",
    saved: true,
  },
  {
    handle: "lorealparis",
    display_name: "L'Oréal Paris",
    category: "inspiration",
    followers: 12800000,
    following: 89,
    posts_count: 3420,
    bio: "Official L'Oréal Paris account. Because you're worth it.",
    external_url: "https://instagram.com",
    tags: ["beauté", "marque", "corporate"],
    notes: "Benchmark marque corporate. Reels produits très aboutis.",
    saved: true,
  },
  {
    handle: "nike",
    display_name: "Nike",
    category: "inspiration",
    followers: 305000000,
    following: 110,
    posts_count: 5600,
    bio: "Just Do It.",
    external_url: "https://instagram.com",
    tags: ["sport", "marque", "lifestyle"],
    notes: "Inspiration direction artistique & sound design.",
    saved: false,
  },
  {
    handle: "gymshark",
    display_name: "Gymshark",
    category: "client",
    followers: 6200000,
    following: 140,
    posts_count: 2890,
    bio: "We do condition. Be a visionary.",
    external_url: "https://instagram.com",
    tags: ["fitness", "marque", "community"],
    notes: "Client actif. Suivre la cadence et les formats prioritaires.",
    saved: true,
  },
  {
    handle: "spotifyfrance",
    display_name: "Spotify France",
    category: "client",
    followers: 980000,
    following: 210,
    posts_count: 1240,
    bio: "Music for every mood.",
    external_url: "https://instagram.com",
    tags: ["musique", "motion", "marque"],
    notes: "Projets motion en cours. Veiller aux tendances visuelles.",
    saved: true,
  },
  {
    handle: "ledger",
    display_name: "Ledger",
    category: "client",
    followers: 450000,
    following: 180,
    posts_count: 980,
    bio: "Keep your crypto secure.",
    external_url: "https://instagram.com",
    tags: ["tech", "crypto", "sécurité"],
    notes: "Ton institutionnel. Opportunité formats éducatifs.",
    saved: false,
  },
  {
    handle: "the.monteur",
    display_name: "The Monteur",
    category: "inspiration",
    followers: 34100,
    following: 190,
    posts_count: 278,
    bio: "Freelance editor. Reels, hooks & transitions.",
    external_url: "https://instagram.com",
    tags: ["freelance", "montage", "reels"],
    notes: "Compte de référence pour tendances montage rapide.",
    saved: true,
  },
]

async function main() {
  console.log("🌱 Seed Instagram — insertion des 12 comptes mockés...\n")

  let inserted = 0
  let errors = 0

  for (const account of SEED_ACCOUNTS) {
    const { data, error } = await supabase
      .from("instagram_accounts")
      .upsert(
        {
          handle: account.handle,
          display_name: account.display_name,
          category: account.category,
          followers: account.followers,
          following: account.following,
          posts_count: account.posts_count,
          bio: account.bio,
          external_url: account.external_url,
          tags: account.tags,
          notes: account.notes,
          saved: account.saved,
          is_verified: false,
          scraped_at: new Date().toISOString(),
          raw_profile: {},
        },
        { onConflict: "handle", ignoreDuplicates: false }
      )
      .select("id, handle")

    if (error) {
      console.error(`  ❌ ${account.handle}: ${error.message}`)
      errors++
    } else {
      console.log(`  ✅ ${account.handle} (${account.category}) — ${account.followers.toLocaleString()} followers`)
      inserted++
    }
  }

  console.log(`\n📊 Résultat : ${inserted} insérés / mis à jour, ${errors} erreurs`)

  const { count } = await supabase
    .from("instagram_accounts")
    .select("*", { count: "exact", head: true })

  console.log(`📦 Total dans instagram_accounts : ${count}`)
}

main().catch((err) => {
  console.error("❌ Erreur fatale :", err)
  process.exit(1)
})
