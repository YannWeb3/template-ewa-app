import { NextRequest } from "next/server"
import {
  upsertInstagramAccount,
  upsertInstagramPosts,
  createInstagramAudit,
  getInstagramAccountById,
} from "@/lib/supabase/instagram"
import { createKnowledgeEntry } from "@/lib/supabase/knowledge"

function generateMockProfile(handle: string) {
  const followers = Math.floor(Math.random() * 50000) + 1000
  const following = Math.floor(Math.random() * 500) + 50
  const postsCount = Math.floor(Math.random() * 300) + 50
  const engagement = Number((Math.random() * 6 + 1).toFixed(1))

  return {
    handle,
    display_name: handle.charAt(0).toUpperCase() + handle.slice(1).replace(/[._]/g, " "),
    bio: "Créateur de contenu & entrepreneur digital.",
    category: "prospect" as const,
    followers,
    following,
    posts_count: postsCount,
    external_url: `https://instagram.com/${handle}`,
    tags: ["réseaux-sociaux", "créateur"],
    notes: "Compte ajouté depuis la recherche IG.",
    saved: false,
    is_verified: Math.random() > 0.8,
    profile_pic_url: undefined,
    raw_profile: {},
  }
}

function generateMockPosts(accountId: string, count: number) {
  const types = ["reel", "carousel", "image", "video"]
  return Array.from({ length: count }, (_, i) => ({
    external_id: `mock-post-${accountId}-${i}`,
    type: types[Math.floor(Math.random() * types.length)],
    short_code: `mock${i}`,
    caption: `Post #${i + 1} — Contenu généré automatiquement.`,
    hashtags: ["template", "ewa", "mock"],
    mentions: [],
    likes_count: Math.floor(Math.random() * 5000) + 50,
    comments_count: Math.floor(Math.random() * 200) + 5,
    views_count: Math.floor(Math.random() * 50000) + 500,
    plays_count: Math.floor(Math.random() * 30000) + 300,
    timestamp: new Date(Date.now() - i * 86400000).toISOString(),
    music_info: {},
    tagged_users: {},
    raw_post: {},
  }))
}

function generateMockAudit() {
  const scoreOverall = Math.floor(Math.random() * 30) + 50
  const scoreProfile = Math.floor(Math.random() * 30) + 50
  const scoreContent = Math.floor(Math.random() * 30) + 50
  const scoreEngagement = Math.floor(Math.random() * 30) + 50
  const scoreConversion = Math.floor(Math.random() * 30) + 50

  const strengths = [
    "Storytelling clair et cohérent",
    "Cohérence visuelle dans le feed",
    "Taux d'engagement au-dessus de la moyenne",
    "Utilisation efficace des hooks",
    "Fréquence de publication régulière",
    "Bonne interaction avec la communauté",
  ]

  const weaknesses = [
    "Lien en bio non optimisé",
    "Peu d'UGC (contenu généré par les utilisateurs)",
    "Manque de diversité dans les formats",
    "Description des Reels trop courte",
    "Absence de stratégie de hashtags",
    "CTA insuffisants dans les légendes",
  ]

  const shuffledStrengths = strengths.sort(() => Math.random() - 0.5).slice(0, 3)
  const shuffledWeaknesses = weaknesses.sort(() => Math.random() - 0.5).slice(0, 3)

  return {
    score_overall: scoreOverall,
    score_profile: scoreProfile,
    score_content: scoreContent,
    score_engagement: scoreEngagement,
    score_conversion: scoreConversion,
    swot: {
      strengths: shuffledStrengths,
      weaknesses: shuffledWeaknesses,
    },
    recommendations: {
      content: [
        "Publier 5 Reels par semaine minimum",
        "Utiliser des hooks dans les 3 premières secondes",
        "Ajouter des témoignages clients en format carrousel",
        "Optimiser le lien en bio avec un outil LikeShop",
        "Créer des séries de contenu récurrentes",
      ],
    },
    best_practices: {},
    benchmark: {},
    raw_report:
      "Audit généré automatiquement par le template EWA. Connecte Apify + OpenRouter pour des audits réels avec scraping et IA.",
    model_used: "template-ewa/mock-pipeline",
  }
}

export async function POST(request: NextRequest) {
  let body: { handle?: string; account_id?: string }
  try {
    body = await request.json()
  } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 })
  }

  const handle = body.handle?.trim().toLowerCase()
  const accountId = body.account_id

  if (!handle && !accountId) {
    return Response.json({ error: "Missing handle or account_id" }, { status: 400 })
  }

  try {
    let account

    if (accountId) {
      const existing = await getInstagramAccountById(accountId)
      if (!existing) {
        return Response.json({ error: "Account not found" }, { status: 404 })
      }
      account = existing
    } else {
      const profile = generateMockProfile(handle!)
      account = await upsertInstagramAccount(profile)
    }

    const posts = generateMockPosts(account.id, Math.floor(Math.random() * 8) + 3)
    await upsertInstagramPosts(account.id, posts)

    const auditData = generateMockAudit()
    const audit = await createInstagramAudit({
      account_id: account.id,
      ...auditData,
    })

    try {
      const knowledgeContent = [
        `## Audit Instagram : @${account.handle}`,
        ``,
        `**Score global : ${auditData.score_overall}/100**`,
        ``,
        `### Forces`,
        ...auditData.swot.strengths.map((s: string) => `- ${s}`),
        ``,
        `### Faiblesses`,
        ...auditData.swot.weaknesses.map((w: string) => `- ${w}`),
        ``,
        `### Recommandations`,
        ...(auditData.recommendations.content as string[]).map((r: string) => `- ${r}`),
        ``,
        `---`,
        `*Audit généré le ${new Date().toLocaleDateString("fr-FR")}*`,
      ].join("\n")

      await createKnowledgeEntry({
        title: `Audit Instagram : @${account.handle}`,
        content: knowledgeContent,
        category: "audit-profil",
        subcategory: "audit-profil",
        source: "instagram_audit",
        metadata: {
          account_id: account.id,
          account_handle: account.handle,
          audit_id: audit.id,
          score_overall: auditData.score_overall,
        },
        original_id: audit.id,
        original_table: "instagram_audits",
      })
    } catch {
      // Non bloquant
    }

    return Response.json(
      {
        status: "completed",
        account_id: account.id,
        audit,
        posts_count: posts.length,
      },
      { status: 201 }
    )
  } catch (error) {
    const message = error instanceof Error ? error.message : "Internal server error"
    return Response.json({ error: message }, { status: 500 })
  }
}
