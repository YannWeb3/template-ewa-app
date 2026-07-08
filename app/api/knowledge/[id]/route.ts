import { NextRequest, NextResponse } from "next/server"
import { updateKnowledgeEntry, deleteKnowledgeEntry, getKnowledgeById, type UpdateKnowledgeInput } from "@/lib/supabase/knowledge"
import { z } from "zod"

const updateSchema = z.object({
  title: z.string().min(1).optional(),
  content: z.string().min(1).optional(),
  category: z.string().min(1).optional(),
  subcategory: z.string().min(1).optional(),
  source: z.enum(["loom", "formation", "script", "manual", "whatsapp", "instagram_audit"]).optional(),
  metadata: z.object({}).passthrough().optional(),
})

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const entry = await getKnowledgeById(id)
    if (!entry) {
      return NextResponse.json({ error: "Not found" }, { status: 404 })
    }
    return NextResponse.json({ entry })
  } catch (error) {
    console.error("[/api/knowledge/[id] GET] Error:", error)
    return NextResponse.json({ error: "Failed to fetch knowledge" }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await request.json()
    const parsed = updateSchema.parse(body)

    const input: UpdateKnowledgeInput = {}
    if (parsed.title !== undefined) input.title = parsed.title
    if (parsed.content !== undefined) input.content = parsed.content
    if (parsed.category !== undefined) input.category = parsed.category
    if (parsed.subcategory !== undefined) input.subcategory = parsed.subcategory
    if (parsed.source !== undefined) input.source = parsed.source
    if (parsed.metadata !== undefined) input.metadata = parsed.metadata

    const entry = await updateKnowledgeEntry(id, input)
    return NextResponse.json({ success: true, entry })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid payload", details: error.flatten() }, { status: 400 })
    }
    console.error("[/api/knowledge/[id] PATCH] Error:", error)
    return NextResponse.json({ error: "Failed to update knowledge" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    await deleteKnowledgeEntry(id)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[/api/knowledge/[id] DELETE] Error:", error)
    return NextResponse.json({ error: "Failed to delete knowledge" }, { status: 500 })
  }
}
