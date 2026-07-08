import { createTemplateServiceClient } from "./template"

export interface ObservatoireMessage {
  id: string
  message_id?: string | null
  phone: string
  push_name: string
  direction: "INBOUND" | "OUTBOUND"
  body: string
  transcript: string | null
  media_type: string
  media_url: string
  is_group: boolean
  group_id: string
  raw_payload: unknown
  client_id: string | null
  group_name?: string
  sender?: string
  content?: string
  source: "whatsapp" | "manual"
  status: "pending" | "validated" | "red" | "resolved" | "in_progress"
  priority: "low" | "normal" | "high" | "critical"
  notes: string
  created_at: string
  updated_at: string
}

export interface ObservatoireMessageInput {
  message_id?: string
  phone: string
  push_name?: string
  direction?: "INBOUND" | "OUTBOUND"
  body?: string
  transcript?: string | null
  media_type?: string
  media_url?: string
  is_group?: boolean
  group_id?: string
  raw_payload?: unknown
  client_id?: string | null
  group_name?: string
  sender?: string
  content?: string
  source?: "whatsapp" | "manual"
  status?: "pending" | "validated" | "red" | "resolved" | "in_progress"
  priority?: "low" | "normal" | "high" | "critical"
  notes?: string
}

export async function listObservatoireMessages(options: {
  search?: string
  status?: string
  priority?: string
  direction?: string
  source?: string
  onlyTranscripts?: boolean
  startDate?: string
  endDate?: string
  limit?: number
  offset?: number
} = {}): Promise<{ messages: ObservatoireMessage[]; total: number }> {
  const supabase = createTemplateServiceClient()
  const limit = options.limit ?? 50
  const offset = options.offset ?? 0

  let query = supabase
    .from("observatoire_messages")
    .select("*", { count: "exact" })
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1)

  if (options.status) {
    query = query.eq("status", options.status)
  }
  if (options.priority) {
    query = query.eq("priority", options.priority)
  }
  if (options.direction) {
    query = query.eq("direction", options.direction)
  }
  if (options.source) {
    query = query.eq("source", options.source)
  }
  if (options.onlyTranscripts) {
    query = query.not("transcript", "is", null)
  }
  if (options.startDate) {
    query = query.gte("created_at", options.startDate)
  }
  if (options.endDate) {
    query = query.lte("created_at", `${options.endDate}T23:59:59.999Z`)
  }
  if (options.search) {
    const search = options.search.trim()
    query = query.or(
      `phone.ilike.%${search}%,push_name.ilike.%${search}%,body.ilike.%${search}%,transcript.ilike.%${search}%,group_name.ilike.%${search}%,sender.ilike.%${search}%`
    )
  }

  const { data, error, count } = await query

  if (error) {
    console.error("listObservatoireMessages error:", error)
    return { messages: [], total: 0 }
  }

  return {
    messages: (data ?? []) as ObservatoireMessage[],
    total: count ?? 0,
  }
}

export async function getObservatoireMessageById(
  id: string
): Promise<ObservatoireMessage | null> {
  const supabase = createTemplateServiceClient()
  const { data, error } = await supabase
    .from("observatoire_messages")
    .select("*")
    .eq("id", id)
    .single()

  if (error) {
    console.error("getObservatoireMessageById error:", error)
    return null
  }

  return data as ObservatoireMessage
}

export async function upsertObservatoireMessage(
  input: ObservatoireMessageInput
): Promise<ObservatoireMessage | null> {
  const supabase = createTemplateServiceClient()

  const payload: Record<string, unknown> = {
    phone: input.phone,
    push_name: input.push_name ?? "",
    direction: input.direction ?? "INBOUND",
    body: input.body ?? input.content ?? "",
    transcript: input.transcript ?? null,
    media_type: input.media_type ?? "",
    media_url: input.media_url ?? "",
    is_group: input.is_group ?? false,
    group_id: input.group_id ?? "",
    raw_payload: input.raw_payload ?? null,
    client_id: input.client_id ?? null,
    group_name: input.group_name ?? "",
    sender: input.sender ?? input.push_name ?? "",
    content: input.content ?? input.body ?? "",
    source: input.source ?? "whatsapp",
    status: input.status ?? "pending",
    priority: input.priority ?? "normal",
    notes: input.notes ?? "",
    updated_at: new Date().toISOString(),
  }

  if (input.message_id) {
    payload.message_id = input.message_id
  }

  // Upsert par message_id si fourni, sinon insert
  const { data, error } = await supabase
    .from("observatoire_messages")
    .upsert(payload, input.message_id ? { onConflict: "message_id" } : undefined)
    .select()
    .single()

  if (error) {
    console.error("upsertObservatoireMessage error:", error)
    return null
  }

  return data as ObservatoireMessage
}

export async function updateObservatoireMessageStatus(
  id: string,
  status: "pending" | "validated" | "red" | "resolved" | "in_progress",
  notes?: string
): Promise<ObservatoireMessage | null> {
  const supabase = createTemplateServiceClient()

  const update: Record<string, unknown> = {
    status,
    updated_at: new Date().toISOString(),
  }
  if (typeof notes === "string") {
    update.notes = notes
  }

  const { data, error } = await supabase
    .from("observatoire_messages")
    .update(update)
    .eq("id", id)
    .select()
    .single()

  if (error) {
    console.error("updateObservatoireMessageStatus error:", error)
    return null
  }

  return data as ObservatoireMessage
}

export async function deleteObservatoireMessage(id: string): Promise<boolean> {
  const supabase = createTemplateServiceClient()
  const { error } = await supabase.from("observatoire_messages").delete().eq("id", id)
  return !error
}
