import { NextRequest } from "next/server"
import { listBlacklist, addToBlacklist, removeFromBlacklist } from "@/lib/supabase/whatsapp"

export async function GET() {
  const data = await listBlacklist()
  return Response.json(data)
}

export async function POST(request: NextRequest) {
  const { phone, label } = await request.json()
  if (!phone) {
    return Response.json({ error: "phone is required" }, { status: 400 })
  }
  const ok = await addToBlacklist(phone, label ?? "")
  if (!ok) {
    return Response.json({ error: "Insert failed" }, { status: 500 })
  }
  return Response.json({ status: "added" }, { status: 201 })
}

export async function DELETE(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const phone = searchParams.get("phone")
  if (!phone) {
    return Response.json({ error: "phone is required" }, { status: 400 })
  }
  const ok = await removeFromBlacklist(phone)
  if (!ok) {
    return Response.json({ error: "Delete failed" }, { status: 500 })
  }
  return Response.json({ status: "removed" })
}
