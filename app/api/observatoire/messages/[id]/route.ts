import { getObservatoireMessageById } from "@/lib/supabase/observatoire"

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const message = await getObservatoireMessageById(id)

  if (!message) {
    return Response.json({ error: "Message not found" }, { status: 404 })
  }

  return Response.json({ message })
}
