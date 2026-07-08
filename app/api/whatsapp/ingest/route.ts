import { NextRequest } from "next/server"
import { isBlacklisted, insertMessage } from "@/lib/supabase/whatsapp"
import type { WhatsAppMessage } from "@/lib/supabase/whatsapp"

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

  const phone = (body.phone as string) ?? ""

  const blocked = await isBlacklisted(phone)
  if (blocked) {
    return Response.json({ status: "blocked", reason: "blacklisted" }, { status: 200 })
  }

  const msg: WhatsAppMessage = {
    waha_message_id: (body.waha_message_id as string) ?? "",
    phone,
    push_name: (body.push_name as string) ?? "",
    direction: (body.direction as "INBOUND" | "OUTBOUND") ?? "INBOUND",
    body: (body.body as string) ?? "",
    is_group: Boolean(body.is_group),
    group_id: (body.group_id as string) ?? "",
    media_type: (body.media_type as string) ?? "",
    media_url: (body.media_url as string) ?? "",
    raw_payload: body.raw_payload ?? null,
  }

  const ok = await insertMessage(msg)

  if (!ok) {
    return Response.json({ error: "Insert failed" }, { status: 500 })
  }

  return Response.json({ status: "ingested" }, { status: 201 })
}
