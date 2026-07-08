import { NextRequest } from "next/server"
import { listObservatoireMessages } from "@/lib/supabase/observatoire"

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const limit = Math.min(parseInt(searchParams.get("limit") || "50", 10), 200)
  const offset = parseInt(searchParams.get("offset") || "0", 10)
  const status = searchParams.get("status") || undefined
  const priority = searchParams.get("priority") || undefined
  const direction = searchParams.get("direction") || undefined
  const source = searchParams.get("source") || undefined
  const search = searchParams.get("search")?.trim() || undefined
  const onlyTranscripts = searchParams.get("onlyTranscripts") === "true"
  const startDate = searchParams.get("startDate") || undefined
  const endDate = searchParams.get("endDate") || undefined

  const { messages, total } = await listObservatoireMessages({
    limit,
    offset,
    status,
    priority,
    direction,
    source,
    search,
    onlyTranscripts,
    startDate,
    endDate,
  })

  return Response.json({ messages, total })
}
