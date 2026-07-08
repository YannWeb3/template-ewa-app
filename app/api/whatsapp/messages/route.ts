import { NextRequest } from "next/server"
import { createServiceClient } from "@/lib/supabase/service"
import { getStatuses } from "@/lib/supabase/whatsapp-status"

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const limit = Math.min(parseInt(searchParams.get("limit") || "50", 10), 200)
  const offset = parseInt(searchParams.get("offset") || "0", 10)
  const direction = searchParams.get("direction")
  const search = searchParams.get("search")?.trim()
  const onlyTranscripts = searchParams.get("onlyTranscripts") === "true"
  const startDate = searchParams.get("startDate")
  const endDate = searchParams.get("endDate")

  const supabase = createServiceClient()
  let query = supabase
    .from("whatsapp_messages")
    .select(
      "id, created_at, phone, push_name, direction, body, media_type, media_url, transcript, client_id, group_id, is_group, raw_payload",
      { count: "exact" }
    )
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1)

  if (direction) query = query.eq("direction", direction)
  if (onlyTranscripts) query = query.not("transcript", "is", null)
  if (startDate) query = query.gte("created_at", startDate)
  if (endDate) query = query.lte("created_at", `${endDate}T23:59:59.999Z`)
  if (search) {
    query = query.or(
      `phone.ilike.%${search}%,push_name.ilike.%${search}%,body.ilike.%${search}%,transcript.ilike.%${search}%`
    )
  }

  const { data, error, count } = await query

  if (error) {
    console.error("GET /api/whatsapp/messages error:", error)
    return Response.json({ error: error.message }, { status: 500 })
  }

  const messages = (data ?? []) as {
    id: string
    created_at: string
    phone: string
    push_name: string
    direction: "INBOUND" | "OUTBOUND"
    body: string
    media_type: string
    media_url: string
    transcript: string | null
    client_id: string | null
    group_id: string | null
    is_group: boolean
    raw_payload: unknown
  }[]

  const messageIds = messages.map((m) => m.id)
  const statuses = await getStatuses(messageIds)

  const messagesWithStatus = messages.map((msg) => ({
    ...msg,
    status: statuses[msg.id]?.status ?? "new",
    notes: statuses[msg.id]?.notes ?? "",
    status_updated_at: statuses[msg.id]?.updated_at ?? null,
  }))

  return Response.json({ messages: messagesWithStatus, total: count ?? 0 })
}
