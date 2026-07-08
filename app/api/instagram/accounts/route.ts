import { NextRequest } from "next/server"
import { getInstagramAccountsWithAudits, getInstagramStats } from "@/lib/supabase/instagram"

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)

  const category = searchParams.get("category") || undefined
  const search = searchParams.get("search") || undefined
  const saved = searchParams.get("saved") === "true" ? true : undefined
  const tags = searchParams.get("tags")?.split(",").filter(Boolean) || undefined
  const limit = searchParams.get("limit") ? Number(searchParams.get("limit")) : undefined
  const includeStats = searchParams.get("stats") === "true"

  try {
    const [accounts, stats] = await Promise.all([
      getInstagramAccountsWithAudits({ category, search, saved, tags, limit }),
      includeStats ? getInstagramStats() : Promise.resolve(null),
    ])

    return Response.json({ accounts, stats })
  } catch (error) {
    const message = error instanceof Error ? error.message : "Internal server error"
    return Response.json({ error: message }, { status: 500 })
  }
}
