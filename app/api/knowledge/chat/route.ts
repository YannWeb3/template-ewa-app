import { NextRequest } from "next/server"
import { createTemplateServiceClient } from "@/lib/supabase/template"
import { callAI, DEFAULT_AI_SETTINGS, type AISettings } from "@/lib/ai/providers"

interface KnowledgeEntry {
  id: string
  title: string
  content: string
  subcategory: string
  source: string
  created_at: string
  updated_at: string
}

export async function POST(request: NextRequest) {
  let body: { question?: string }
  try {
    body = await request.json()
  } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 })
  }

  const question = body.question?.trim()
  if (!question) {
    return Response.json({ error: "Question is required" }, { status: 400 })
  }

  try {
    const supabase = createTemplateServiceClient()

    const { data: entries, error } = await supabase
      .from("knowledge_entries")
      .select("id, title, content, subcategory, source, created_at, updated_at")
      .or(`title.ilike.%${question}%,content.ilike.%${question}%`)
      .order("updated_at", { ascending: false })
      .limit(10)

    if (error) throw error

    const results = (entries || []) as KnowledgeEntry[]

    const context = results
      .map(
        (e, i) =>
          `[${i + 1}] Titre: ${e.title}\nCatégorie: ${e.subcategory}\nSource: ${e.source}\nContenu: ${e.content.slice(0, 2000)}`
      )
      .join("\n\n---\n\n")

    const systemPrompt = `Tu es un assistant expert en production de contenu short-form et montage vidéo. Tu réponds UNIQUEMENT à partir du contexte fourni ci-dessous (base de connaissances interne "Cerveau EWA"). Si la réponse ne s'y trouve pas, dis-le poliment et suggère de reformuler la question.

Contexte :
${context || "Aucune information pertinente trouvée dans la base de connaissances."}

Réponds en français, de manière concise et utile. Cite les sources entre crochets [1], [2] etc. à la fin de ta réponse.

IMPORTANT : Si tu as dû répondre avec tes propres connaissances (hors contexte), termine ta réponse par la ligne exacte : [AJOUTER_CERVEAL]`

    const { data: settingsData } = await supabase
      .from("app_settings")
      .select("value")
      .eq("key", "ai_settings")
      .single()

    const settings: AISettings = settingsData?.value ?? DEFAULT_AI_SETTINGS

    const answer = await callAI(settings, systemPrompt, question)

    const sources = results.map((e) => ({
      id: e.id,
      title: e.title,
      subcategory: e.subcategory,
      source: e.source,
    }))

    const canAdd = results.length === 0 || answer.includes("[AJOUTER_CERVEAL]")
    const cleanAnswer = answer.replace("[AJOUTER_CERVEAL]", "").trim()

    return Response.json({ answer: cleanAnswer, sources, canAdd, settings })
  } catch (error) {
    const message = error instanceof Error ? error.message : "Internal server error"
    return Response.json({ error: message }, { status: 500 })
  }
}
