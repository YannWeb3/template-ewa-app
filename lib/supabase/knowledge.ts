import { createTemplateServiceClient } from "./template"

export type KnowledgeSource = "loom" | "formation" | "script" | "manual" | "whatsapp" | "instagram_audit"

export interface KnowledgeEntry {
  id: string
  title: string
  content: string
  category: string
  subcategory: string
  source: KnowledgeSource
  sources: Record<string, number>
  metadata: Record<string, unknown>
  original_id?: string | null
  original_table?: string | null
  created_at: string
  updated_at: string
}

export interface KnowledgeStats {
  total: number
  bySubcategory: Record<string, number>
  bySource: Record<string, number>
}

export async function getKnowledgeStats(): Promise<KnowledgeStats> {
  const supabase = createTemplateServiceClient()
  const { count: total, error: countError } = await supabase
    .from("knowledge_entries")
    .select("*", { count: "exact", head: true })

  if (countError) throw countError

  const { data: subcategoryRows, error: subcategoryError } = await supabase
    .from("knowledge_entries")
    .select("subcategory")

  if (subcategoryError) throw subcategoryError

  const { data: sourceRows, error: sourceError } = await supabase
    .from("knowledge_entries")
    .select("source")

  if (sourceError) throw sourceError

  const bySubcategory: Record<string, number> = {}
  subcategoryRows.forEach((row) => {
    bySubcategory[row.subcategory] = (bySubcategory[row.subcategory] || 0) + 1
  })

  const bySource: Record<string, number> = {}
  sourceRows.forEach((row) => {
    bySource[row.source] = (bySource[row.source] || 0) + 1
  })

  return {
    total: total || 0,
    bySubcategory,
    bySource,
  }
}

export async function searchKnowledge(
  query?: string,
  subcategory?: string,
  source?: string,
  limit = 200
): Promise<KnowledgeEntry[]> {
  const supabase = createTemplateServiceClient()

  let dbQuery = supabase
    .from("knowledge_entries")
    .select("*")
    .order("updated_at", { ascending: false })
    .limit(limit)

  if (query && query.trim()) {
    dbQuery = dbQuery.or(`title.ilike.%${query.trim()}%,content.ilike.%${query.trim()}%`)
  }

  if (subcategory && subcategory !== "all") {
    dbQuery = dbQuery.eq("subcategory", subcategory)
  }

  if (source && source !== "all") {
    dbQuery = dbQuery.eq("source", source)
  }

  const { data, error } = await dbQuery

  if (error) throw error
  return (data || []) as KnowledgeEntry[]
}

export async function getKnowledgeBySubcategory(subcategory: string): Promise<KnowledgeEntry[]> {
  const supabase = createTemplateServiceClient()
  const { data, error } = await supabase
    .from("knowledge_entries")
    .select("*")
    .eq("subcategory", subcategory)
    .order("updated_at", { ascending: false })

  if (error) throw error
  return (data || []) as KnowledgeEntry[]
}

export async function getKnowledgeById(id: string): Promise<KnowledgeEntry | null> {
  const supabase = createTemplateServiceClient()
  const { data, error } = await supabase
    .from("knowledge_entries")
    .select("*")
    .eq("id", id)
    .single()

  if (error) {
    if (error.code === "PGRST116") return null
    throw error
  }

  return data as KnowledgeEntry
}

export interface CreateKnowledgeInput {
  title: string
  content: string
  category: string
  subcategory?: string
  source: KnowledgeSource
  metadata?: Record<string, unknown>
  original_id?: string
  original_table?: string
}

export interface UpdateKnowledgeInput {
  title?: string
  content?: string
  category?: string
  subcategory?: string
  source?: KnowledgeSource
  metadata?: Record<string, unknown>
}

export async function createKnowledgeEntry(input: CreateKnowledgeInput): Promise<KnowledgeEntry> {
  const supabase = createTemplateServiceClient()

  const { data, error } = await supabase
    .from("knowledge_entries")
    .insert({
      title: input.title,
      content: input.content,
      category: input.category,
      subcategory: input.subcategory || input.category,
      source: input.source,
      sources: { [input.source]: 1 },
      metadata: input.metadata || {},
      original_id: input.original_id || null,
      original_table: input.original_table || null,
    })
    .select()
    .single()

  if (error) throw error
  return data as KnowledgeEntry
}

export async function updateKnowledgeEntry(id: string, input: UpdateKnowledgeInput): Promise<KnowledgeEntry> {
  const supabase = createTemplateServiceClient()

  const { data, error } = await supabase
    .from("knowledge_entries")
    .update({
      ...input,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select()
    .single()

  if (error) throw error
  return data as KnowledgeEntry
}

export async function deleteKnowledgeEntry(id: string): Promise<void> {
  const supabase = createTemplateServiceClient()
  const { error } = await supabase.from("knowledge_entries").delete().eq("id", id)
  if (error) throw error
}
