import { NextRequest } from "next/server"
import { createTemplateServiceClient } from "@/lib/supabase/template"
import { DEFAULT_AI_SETTINGS, type AISettings } from "@/lib/ai/providers"

export async function GET() {
  try {
    const supabase = createTemplateServiceClient()
    const { data, error } = await supabase
      .from("app_settings")
      .select("value")
      .eq("key", "ai_settings")
      .single()

    if (error && error.code !== "PGRST116") throw error

    const settings: AISettings = data?.value ?? DEFAULT_AI_SETTINGS
    return Response.json({ settings })
  } catch (error) {
    const message = error instanceof Error ? error.message : "Internal server error"
    return Response.json({ error: message }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  let body: { settings?: Partial<AISettings> }
  try {
    body = await request.json()
  } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 })
  }

  if (!body.settings) {
    return Response.json({ error: "Missing settings" }, { status: 400 })
  }

  try {
    const supabase = createTemplateServiceClient()

    const { data: existing } = await supabase
      .from("app_settings")
      .select("value")
      .eq("key", "ai_settings")
      .single()

    const current: AISettings = existing?.value ?? DEFAULT_AI_SETTINGS
    const merged: AISettings = { ...current, ...body.settings }

    const { error } = await supabase
      .from("app_settings")
      .upsert(
        { key: "ai_settings", value: merged, updated_at: new Date().toISOString() },
        { onConflict: "key" }
      )

    if (error) throw error

    return Response.json({ settings: merged })
  } catch (error) {
    const message = error instanceof Error ? error.message : "Internal server error"
    return Response.json({ error: message }, { status: 500 })
  }
}
