import { NextRequest, NextResponse } from "next/server"
import { createKnowledgeEntry, type KnowledgeSource } from "@/lib/supabase/knowledge"
import { z } from "zod"

const EXPECTED_TOKEN = process.env.N8N_WEBHOOK_SECRET

const ingestSchema = z.object({
  title: z.string().min(1),
  content: z.string().min(1),
  category: z.string().min(1),
  subcategory: z.string().optional(),
  source: z.enum(["loom", "formation", "script", "manual", "whatsapp", "instagram_audit"]),
  metadata: z.object({}).passthrough().optional(),
  original_id: z.string().optional(),
  original_table: z.string().optional(),
})

export async function POST(request: NextRequest) {
  const token = request.headers.get("x-n8n-token")

  if (!token || token !== EXPECTED_TOKEN) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const body = await request.json()
    const parsed = ingestSchema.parse(body)

    const entry = await createKnowledgeEntry({
      title: parsed.title,
      content: parsed.content,
      category: parsed.category,
      subcategory: parsed.subcategory,
      source: parsed.source as KnowledgeSource,
      metadata: parsed.metadata || {},
      original_id: parsed.original_id,
      original_table: parsed.original_table,
    })

    return NextResponse.json({ success: true, entry }, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid payload", details: error.flatten() },
        { status: 400 }
      )
    }
    console.error("[/api/knowledge/ingest] Error:", error)
    console.error("[/api/knowledge/ingest] Error:", error)
    return NextResponse.json(
      { error: "Failed to ingest knowledge" },
      { status: 500 }
    )
  }
}
