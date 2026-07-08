import { createServiceClient } from "@/lib/supabase/service"
import { getStatus } from "@/lib/supabase/whatsapp-status"

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  const supabase = createServiceClient()
  const { data, error } = await supabase
    .from("whatsapp_messages")
    .select("*")
    .eq("id", id)
    .single()

  if (error) {
    console.error("GET /api/whatsapp/messages/[id] error:", error)
    return Response.json({ error: "Message not found" }, { status: 404 })
  }

  const status = await getStatus(id)

  return Response.json({
    message: data,
    status: status ?? { message_id: id, status: "new", notes: "", updated_at: null },
  })
}
