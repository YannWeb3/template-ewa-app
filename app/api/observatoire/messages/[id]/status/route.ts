import { NextRequest } from "next/server"
import {
  getObservatoireMessageById,
  updateObservatoireMessageStatus,
} from "@/lib/supabase/observatoire"

const VALID_STATUSES = [
  "pending",
  "validated",
  "red",
  "resolved",
  "in_progress",
] as const

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
      { error: "Invalid status" },
      { status: 400 }
    )
  }

  const existing = await getObservatoireMessageById(id)
  if (!existing) {
    return Response.json({ error: "Message not found" }, { status: 404 })
  }

  const updated = await updateObservatoireMessageStatus(id, status, notes)

  if (!updated) {
    return Response.json({ error: "Failed to update status" }, { status: 500 })
  }

  return Response.json(updated)
}
