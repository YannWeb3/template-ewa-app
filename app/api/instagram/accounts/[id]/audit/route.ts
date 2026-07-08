import { NextRequest } from "next/server"
import { getInstagramAccountById, createInstagramAudit } from "@/lib/supabase/instagram"
import { createKnowledgeEntry } from "@/lib/supabase/knowledge"

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  try {
    const account = await getInstagramAccountById(id)
    if (!account) {
      return Response.json({ error: "Account not found" }, { status: 404 })
    }

    let body: Record<string, unknown> = {}
    try {
      body = await request.json()
    } catch {}

    const audit = await createInstagramAudit({
      account_id: id,
      score_profile: body.score_profile ? Number(body.score_profile) : undefined,
      score_content: body.score_content ? Number(body.score_content) : undefined,
      score_engagement: body.score_engagement ? Number(body.score_engagement) : undefined,
      score_conversion: body.score_conversion ? Number(body.score_conversion) : undefined,
      score_overall: body.score_overall ? Number(body.score_overall) : undefined,
      swot: (body.swot as Record<string, unknown>) ?? {},
      recommendations: (body.recommendations as Record<string, unknown>) ?? {},
      best_practices: (body.best_practices as Record<string, unknown>) ?? {},
      benchmark: (body.benchmark as Record<string, unknown>) ?? {},
      raw_report: body.raw_report as string,
      model_used: body.model_used as string,
    })

    try {
      const swot = (body.swot as Record<string, unknown>) ?? {}
      const strengths = (swot.strengths as string[]) ?? []
      const weaknesses = (swot.weaknesses as string[]) ?? []
      const recs = (body.recommendations as Record<string, unknown>) ?? {}
      const contentRecs = (recs.content as string[]) ?? []

      const knowledgeContent = [
        `## Audit Instagram : @${account.handle}`,
        ``,
        `**Score global : ${body.score_overall ?? "N/A"}/100**`,
        ``,
        `### Forces`,
        ...strengths.map((s: string) => `- ${s}`),
        ``,
        `### Faiblesses`,
        ...weaknesses.map((w: string) => `- ${w}`),
        ``,
        `### Recommandations`,
        ...contentRecs.map((r: string) => `- ${r}`),
        ``,
        `---`,
        `*Audit généré le ${new Date().toLocaleDateString("fr-FR")}*`,
      ].join("\n")

      await createKnowledgeEntry({
        title: `Audit Instagram : @${account.handle}`,
        content: knowledgeContent,
        category: "audit-profil",
        subcategory: "audit-profil",
        source: "instagram_audit",
        metadata: {
          account_id: account.id,
          account_handle: account.handle,
          audit_id: audit.id,
          score_overall: body.score_overall ?? null,
        },
        original_id: audit.id,
        original_table: "instagram_audits",
      })
    } catch {
      // Non bloquant : l'audit est déjà créé
    }

    return Response.json({ audit }, { status: 201 })
  } catch (error) {
    const message = error instanceof Error ? error.message : "Internal server error"
    return Response.json({ error: message }, { status: 500 })
  }
}
