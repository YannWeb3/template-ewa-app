import { NextRequest } from "next/server"
import { upsertObservatoireMessage, type ObservatoireMessageInput } from "@/lib/supabase/observatoire"

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

  const message = await upsertObservatoireMessage({
    message_id: (body.message_id as string) || undefined,
    phone: (body.phone as string) ?? "",
    push_name: (body.push_name as string) ?? "",
    direction: (body.direction as "INBOUND" | "OUTBOUND") ?? "INBOUND",
    body: (body.body as string) ?? (body.content as string) ?? "",
    transcript: (body.transcript as string | null) ?? null,
    media_type: (body.media_type as string) ?? "",
    media_url: (body.media_url as string) ?? "",
    is_group: Boolean(body.is_group),
    group_id: (body.group_id as string) ?? "",
    raw_payload: body.raw_payload ?? null,
    client_id: (body.client_id as string) ?? null,
    group_name: (body.group_name as string) ?? "",
    sender: (body.sender as string) ?? (body.push_name as string) ?? "",
    content: (body.content as string) ?? (body.body as string) ?? "",
    source: (body.source as "whatsapp" | "manual") ?? "whatsapp",
    status: (body.status as ObservatoireMessageInput["status"]) ?? "pending",
    priority: (body.priority as ObservatoireMessageInput["priority"]) ?? "normal",
    notes: (body.notes as string) ?? "",
  })

  if (!message) {
    return Response.json({ error: "Insert failed" }, { status: 500 })
  }

  return Response.json({ status: "ingested", id: message.id }, { status: 201 })
}
