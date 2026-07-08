import { NextRequest } from "next/server"
import { getInstagramAccountById } from "@/lib/supabase/instagram"

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  try {
    const account = await getInstagramAccountById(id)

    if (!account) {
      return Response.json({ error: "Account not found" }, { status: 404 })
    }

    return Response.json({ account })
  } catch (error) {
    const message = error instanceof Error ? error.message : "Internal server error"
    return Response.json({ error: message }, { status: 500 })
  }
}
