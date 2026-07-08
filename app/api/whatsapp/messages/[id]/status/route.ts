import { NextRequest } from "next/server"
import { createServiceClient } from "@/lib/supabase/service"
import { upsertStatus } from "@/lib/supabase/whatsapp-status"

const VALID_STATUSES = ["new", "in_progress", "resolved"] as const

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const body = await request.json().catch(() => ({}))
  const status = body.status
  const notes = typeof body.notes === "string" ? body.notes : undefined

  if (!VALID_STATUSES.includes(status)) {
    return Response.json(
      { error: "Invalid status. Must be one of: new, in_progress, resolved" },
      { status: 400 }
    )
  }

  const supabase = createServiceClient()
  const { data: message, error } = await supabase
    .from("whatsapp_messages")
    .select("id")
    .eq("id", id)
    .single()

  if (error || !message) {
    return Response.json({ error: "Message not found" }, { status: 404 })
  }

  const updated = await upsertStatus(id, status, notes)

  if (!updated) {
    return Response.json({ error: "Failed to update status" }, { status: 500 })
  }

  return Response.json(updated)
}
