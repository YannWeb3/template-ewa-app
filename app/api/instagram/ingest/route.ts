import { NextRequest } from "next/server"
import {
  upsertInstagramAccount,
  upsertInstagramPosts,
  createInstagramAudit,
} from "@/lib/supabase/instagram"

const EXPECTED_TOKEN = process.env.N8N_WEBHOOK_SECRET

export async function POST(request: NextRequest) {
  const token = request.headers.get("x-n8n-token")

  if (!token || token !== EXPECTED_TOKEN) {
    return Response.json({ error: "Unauthorized" }, { status: 401 })
  }

  let body: Record<string, unknown>
  try {
    body = await request.json()
  } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 })
  }

  const accountInput = body.account as Record<string, unknown> | undefined
  if (!accountInput || !accountInput.handle) {
    return Response.json({ error: "Missing required field: account.handle" }, { status: 400 })
  }

  const account = await upsertInstagramAccount({
    handle: accountInput.handle as string,
    display_name: accountInput.display_name as string,
    bio: accountInput.bio as string,
    category: (accountInput.category as string) ?? "prospect",
    followers: accountInput.followers ? Number(accountInput.followers) : undefined,
    following: accountInput.following ? Number(accountInput.following) : undefined,
    posts_count: accountInput.posts_count ? Number(accountInput.posts_count) : undefined,
    external_url: accountInput.external_url as string,
    business_category: accountInput.business_category as string,
    is_verified: Boolean(accountInput.is_verified),
    profile_pic_url: accountInput.profile_pic_url as string,
    scraped_at: accountInput.scraped_at as string,
    tags: (accountInput.tags as string[]) ?? [],
    notes: accountInput.notes as string,
    saved: Boolean(accountInput.saved),
    client_id: accountInput.client_id as string,
    raw_profile: (accountInput.raw_profile as Record<string, unknown>) ?? {},
  })

  const posts: Record<string, unknown>[] = (body.posts as Record<string, unknown>[]) ?? []
  if (posts.length > 0) {
    await upsertInstagramPosts(
      account.id,
      posts.map((p) => ({
        external_id: p.external_id as string,
        type: p.type as string,
        short_code: p.short_code as string,
        caption: p.caption as string,
        hashtags: (p.hashtags as string[]) ?? [],
        mentions: (p.mentions as string[]) ?? [],
        likes_count: p.likes_count ? Number(p.likes_count) : undefined,
        comments_count: p.comments_count ? Number(p.comments_count) : undefined,
        views_count: p.views_count ? Number(p.views_count) : undefined,
        plays_count: p.plays_count ? Number(p.plays_count) : undefined,
        duration_seconds: p.duration_seconds ? Number(p.duration_seconds) : undefined,
        transcript: p.transcript as string,
        video_url: p.video_url as string,
        display_url: p.display_url as string,
        timestamp: p.timestamp as string,
        music_info: (p.music_info as Record<string, unknown>) ?? {},
        tagged_users: (p.tagged_users as Record<string, unknown>) ?? {},
        raw_post: (p.raw_post as Record<string, unknown>) ?? {},
      }))
    )
  }

  const auditInput = body.audit as Record<string, unknown> | undefined
  if (auditInput) {
    await createInstagramAudit({
      account_id: account.id,
      score_profile: auditInput.score_profile ? Number(auditInput.score_profile) : undefined,
      score_content: auditInput.score_content ? Number(auditInput.score_content) : undefined,
      score_engagement: auditInput.score_engagement ? Number(auditInput.score_engagement) : undefined,
      score_conversion: auditInput.score_conversion ? Number(auditInput.score_conversion) : undefined,
      score_overall: auditInput.score_overall ? Number(auditInput.score_overall) : undefined,
      swot: (auditInput.swot as Record<string, unknown>) ?? {},
      recommendations: (auditInput.recommendations as Record<string, unknown>) ?? {},
      best_practices: (auditInput.best_practices as Record<string, unknown>) ?? {},
      benchmark: (auditInput.benchmark as Record<string, unknown>) ?? {},
      raw_report: auditInput.raw_report as string,
      model_used: (body.model as string) ?? (auditInput.model as string) ?? null,
    })
  }

  return Response.json(
    { status: "ingested", account_id: account.id },
    { status: 201 }
  )
}
