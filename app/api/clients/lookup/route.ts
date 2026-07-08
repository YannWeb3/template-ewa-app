import { NextRequest } from "next/server"
import { createServiceClient } from "@/lib/supabase/service"

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const phonesParam = searchParams.get("phones")

  if (!phonesParam) {
    return Response.json({ clients: {} }, { status: 200 })
  }

  const phones = phonesParam
    .split(",")
    .map((p) => p.trim())
    .filter(Boolean)

  if (phones.length === 0) {
    return Response.json({ clients: {} }, { status: 200 })
  }

  const supabase = createServiceClient()

  // Supabase .or() with multiple ilike conditions
  const orFilter = phones.map((phone) => `phone.ilike.%${phone}%`).join(",")

  const { data, error } = await supabase
    .from("clients")
    .select("id, name, phone")
    .or(orFilter)
    .limit(phones.length)

  if (error) {
    console.error("GET /api/clients/lookup error:", error)
    return Response.json({ error: error.message }, { status: 500 })
  }

  const clientsByPhone: Record<string, { id: string; name: string }> = {}

  for (const client of data ?? []) {
    if (client.phone) {
      clientsByPhone[client.phone] = { id: client.id, name: client.name }
    }
  }

  return Response.json({ clients: clientsByPhone })
}
