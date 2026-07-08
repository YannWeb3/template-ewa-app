import { NextRequest } from "next/server"
import { getAccountsToAudit } from "@/lib/supabase/instagram"

const EXPECTED_TOKEN = process.env.N8N_WEBHOOK_SECRET

export async function GET(request: NextRequest) {
  const token = request.headers.get("x-n8n-token")

  if (!token || token !== EXPECTED_TOKEN) {
    return Response.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const limit = searchParams.get("limit") ? Number(searchParams.get("limit")) : 5

  try {
    const accounts = await getAccountsToAudit(limit)
    return Response.json({ accounts })
  } catch (error) {
    const message = error instanceof Error ? error.message : "Internal server error"
    return Response.json({ error: message }, { status: 500 })
  }
}
