import { createTemplateServiceClient } from "./template"

export interface InstagramAccount {
  id: string
  handle: string
  display_name: string | null
  bio: string | null
  category: string
  followers: number | null
  following: number | null
  posts_count: number | null
  external_url: string | null
  business_category: string | null
  is_verified: boolean
  profile_pic_url: string | null
  scraped_at: string | null
  created_at: string
  tags: string[]
  notes: string | null
  saved: boolean
  client_id: string | null
  raw_profile: Record<string, unknown>
}

export interface InstagramPost {
  id: string
  account_id: string
  external_id: string | null
  type: string | null
  short_code: string | null
  caption: string | null
  hashtags: string[]
  mentions: string[]
  likes_count: number | null
  comments_count: number | null
  views_count: number | null
  plays_count: number | null
  duration_seconds: number | null
  transcript: string | null
  video_url: string | null
  display_url: string | null
  timestamp: string | null
  music_info: Record<string, unknown>
  tagged_users: Record<string, unknown>
  raw_post: Record<string, unknown>
  created_at: string
}

export interface InstagramAudit {
  id: string
  account_id: string
  status: string
  score_profile: number | null
  score_content: number | null
  score_engagement: number | null
  score_conversion: number | null
  score_overall: number | null
  swot: Record<string, unknown>
  recommendations: Record<string, unknown>
  best_practices: Record<string, unknown>
  benchmark: Record<string, unknown>
  raw_report: string | null
  model_used: string | null
  generated_at: string | null
}

export interface InstagramAccountWithRelations extends InstagramAccount {
  posts: InstagramPost[]
  audits: InstagramAudit[]
}

export async function getInstagramAccounts(options?: {
  category?: string
  search?: string
  saved?: boolean
  tags?: string[]
  limit?: number
}): Promise<InstagramAccount[]> {
  const supabase = createTemplateServiceClient()
  let query = supabase
    .from("instagram_accounts")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(options?.limit ?? 200)

  if (options?.category && options.category !== "tous") {
    query = query.eq("category", options.category)
  }

  if (options?.search) {
    const term = options.search.trim()
    query = query.or(
      `handle.ilike.%${term}%,display_name.ilike.%${term}%,bio.ilike.%${term}%`
    )
  }

  if (options?.saved) {
    query = query.eq("saved", true)
  }

  if (options?.tags && options.tags.length > 0) {
    query = query.contains("tags", options.tags)
  }

  const { data, error } = await query
  if (error) throw error
  return (data || []) as InstagramAccount[]
}

export async function getInstagramAccountsWithAudits(options?: {
  category?: string
  search?: string
  saved?: boolean
  tags?: string[]
  limit?: number
}): Promise<InstagramAccountWithRelations[]> {
  const supabase = createTemplateServiceClient()
  let query = supabase
    .from("instagram_accounts")
    .select("*, audits:instagram_audits(*)")
    .order("created_at", { ascending: false })
    .limit(options?.limit ?? 200)

  if (options?.category && options.category !== "tous") {
    query = query.eq("category", options.category)
  }

  if (options?.search) {
    const term = options.search.trim()
    query = query.or(
      `handle.ilike.%${term}%,display_name.ilike.%${term}%,bio.ilike.%${term}%`
    )
  }

  if (options?.saved) {
    query = query.eq("saved", true)
  }

  if (options?.tags && options.tags.length > 0) {
    query = query.contains("tags", options.tags)
  }

  const { data, error } = await query
  if (error) throw error
  return (data || []) as InstagramAccountWithRelations[]
}

export async function getInstagramAccountById(id: string): Promise<InstagramAccountWithRelations | null> {
  const supabase = createTemplateServiceClient()

  const { data: account, error: accountError } = await supabase
    .from("instagram_accounts")
    .select("*")
    .eq("id", id)
    .single()

  if (accountError) {
    if (accountError.code === "PGRST116") return null
    throw accountError
  }

  const { data: posts } = await supabase
    .from("instagram_posts")
    .select("*")
    .eq("account_id", id)
    .order("timestamp", { ascending: false })
    .limit(50)

  const { data: audits } = await supabase
    .from("instagram_audits")
    .select("*")
    .eq("account_id", id)
    .order("generated_at", { ascending: false })
    .limit(10)

  return {
    ...(account as InstagramAccount),
    posts: (posts || []) as InstagramPost[],
    audits: (audits || []) as InstagramAudit[],
  }
}

export async function getAccountsToAudit(limit = 5): Promise<InstagramAccount[]> {
  const supabase = createTemplateServiceClient()

  const { data: auditedIds, error: auditedError } = await supabase
    .from("instagram_audits")
    .select("account_id")
    .eq("status", "completed")
    .order("generated_at", { ascending: false })

  if (auditedError) throw auditedError

  const recentlyAudited = new Set((auditedIds || []).map((a) => a.account_id))

  const { data, error } = await supabase
    .from("instagram_accounts")
    .select("*")
    .order("followers", { ascending: false })
    .limit(limit * 3)

  if (error) throw error

  const accounts = (data || []) as InstagramAccount[]
  const toAudit = accounts.filter((a) => !recentlyAudited.has(a.id)).slice(0, limit)

  return toAudit.length > 0 ? toAudit : accounts.slice(0, limit)
}

export async function upsertInstagramAccount(input: {
  handle: string
  display_name?: string
  bio?: string
  category?: string
  followers?: number
  following?: number
  posts_count?: number
  external_url?: string
  business_category?: string
  is_verified?: boolean
  profile_pic_url?: string
  scraped_at?: string
  tags?: string[]
  notes?: string
  saved?: boolean
  client_id?: string
  raw_profile?: Record<string, unknown>
}): Promise<InstagramAccount> {
  const supabase = createTemplateServiceClient()

  const { data, error } = await supabase
    .from("instagram_accounts")
    .upsert(
      {
        handle: input.handle,
        display_name: input.display_name ?? null,
        bio: input.bio ?? null,
        category: input.category ?? "prospect",
        followers: input.followers ?? null,
        following: input.following ?? null,
        posts_count: input.posts_count ?? null,
        external_url: input.external_url ?? null,
        business_category: input.business_category ?? null,
        is_verified: input.is_verified ?? false,
        profile_pic_url: input.profile_pic_url ?? null,
        scraped_at: input.scraped_at ?? new Date().toISOString(),
        tags: input.tags ?? [],
        notes: input.notes ?? null,
        saved: input.saved ?? false,
        client_id: input.client_id ?? null,
        raw_profile: input.raw_profile ?? {},
      },
      { onConflict: "handle", ignoreDuplicates: false }
    )
    .select()
    .single()

  if (error) throw error
  return data as InstagramAccount
}

export async function upsertInstagramPosts(
  accountId: string,
  posts: Array<{
    external_id?: string
    type?: string
    short_code?: string
    caption?: string
    hashtags?: string[]
    mentions?: string[]
    likes_count?: number
    comments_count?: number
    views_count?: number
    plays_count?: number
    duration_seconds?: number
    transcript?: string
    video_url?: string
    display_url?: string
    timestamp?: string
    music_info?: Record<string, unknown>
    tagged_users?: Record<string, unknown>
    raw_post?: Record<string, unknown>
  }>
): Promise<number> {
  const supabase = createTemplateServiceClient()

  const rows = posts.map((post) => ({
    account_id: accountId,
    external_id: post.external_id ?? null,
    type: post.type ?? null,
    short_code: post.short_code ?? null,
    caption: post.caption ?? null,
    hashtags: post.hashtags ?? [],
    mentions: post.mentions ?? [],
    likes_count: post.likes_count ?? null,
    comments_count: post.comments_count ?? null,
    views_count: post.views_count ?? null,
    plays_count: post.plays_count ?? null,
    duration_seconds: post.duration_seconds ?? null,
    transcript: post.transcript ?? null,
    video_url: post.video_url ?? null,
    display_url: post.display_url ?? null,
    timestamp: post.timestamp ?? null,
    music_info: post.music_info ?? {},
    tagged_users: post.tagged_users ?? {},
    raw_post: post.raw_post ?? {},
  }))

  const { data, error } = await supabase
    .from("instagram_posts")
    .upsert(rows, { onConflict: "account_id,external_id", ignoreDuplicates: false })
    .select()

  if (error) throw error
  return (data || []).length
}

export async function createInstagramAudit(input: {
  account_id: string
  score_profile?: number
  score_content?: number
  score_engagement?: number
  score_conversion?: number
  score_overall?: number
  swot?: Record<string, unknown>
  recommendations?: Record<string, unknown>
  best_practices?: Record<string, unknown>
  benchmark?: Record<string, unknown>
  raw_report?: string
  model_used?: string
}): Promise<InstagramAudit> {
  const supabase = createTemplateServiceClient()

  const { data, error } = await supabase
    .from("instagram_audits")
    .insert({
      account_id: input.account_id,
      status: "completed",
      score_profile: input.score_profile ?? null,
      score_content: input.score_content ?? null,
      score_engagement: input.score_engagement ?? null,
      score_conversion: input.score_conversion ?? null,
      score_overall: input.score_overall ?? null,
      swot: input.swot ?? {},
      recommendations: input.recommendations ?? {},
      best_practices: input.best_practices ?? {},
      benchmark: input.benchmark ?? {},
      raw_report: input.raw_report ?? null,
      model_used: input.model_used ?? null,
      generated_at: new Date().toISOString(),
    })
    .select()
    .single()

  if (error) throw error
  return data as InstagramAudit
}

export async function updateInstagramAccount(
  id: string,
  input: Partial<{
    display_name: string
    bio: string
    category: string
    followers: number
    following: number
    posts_count: number
    external_url: string
    business_category: string
    is_verified: boolean
    profile_pic_url: string
    tags: string[]
    notes: string
    saved: boolean
    client_id: string
  }>
): Promise<InstagramAccount> {
  const supabase = createTemplateServiceClient()

  const { data, error } = await supabase
    .from("instagram_accounts")
    .update(input)
    .eq("id", id)
    .select()
    .single()

  if (error) throw error
  return data as InstagramAccount
}

export async function deleteInstagramAccount(id: string): Promise<void> {
  const supabase = createTemplateServiceClient()
  const { error } = await supabase.from("instagram_accounts").delete().eq("id", id)
  if (error) throw error
}

export async function getInstagramStats(): Promise<{
  total: number
  byCategory: Record<string, number>
  saved: number
  avgEngagement: number
  totalFollowers: number
  audited: number
}> {
  const supabase = createTemplateServiceClient()

  const { count: total } = await supabase
    .from("instagram_accounts")
    .select("*", { count: "exact", head: true })

  const { data: accounts } = await supabase
    .from("instagram_accounts")
    .select("category, saved, followers")

  const { count: audited } = await supabase
    .from("instagram_audits")
    .select("*", { count: "exact", head: true })
    .eq("status", "completed")

  const list = (accounts || []) as Array<{ category: string; saved: boolean; followers: number | null }>
  const byCategory: Record<string, number> = {}
  let savedCount = 0
  let totalFollowers = 0

  list.forEach((a) => {
    byCategory[a.category] = (byCategory[a.category] || 0) + 1
    if (a.saved) savedCount++
    if (a.followers) totalFollowers += a.followers
  })

  return {
    total: total || 0,
    byCategory,
    saved: savedCount,
    avgEngagement: 0,
    totalFollowers,
    audited: audited || 0,
  }
}
