import { NextResponse } from "next/server"
import { getKnowledgeStats, searchKnowledge } from "@/lib/supabase/knowledge"

export async function GET() {
  try {
    const [entries, stats] = await Promise.all([searchKnowledge(), getKnowledgeStats()])
    return NextResponse.json({ entries, stats })
  } catch (error) {
    console.error("[/api/knowledge/search] Error:", error)
    return NextResponse.json(
      { error: "Failed to fetch knowledge" },
      { status: 500 }
    )
  }
}
