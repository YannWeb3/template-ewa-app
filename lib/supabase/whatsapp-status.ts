import { createTemplateServiceClient } from "./template"

export interface WhatsAppMessageStatus {
  message_id: string
  status: "new" | "in_progress" | "resolved"
  notes: string
  updated_at: string
}

export async function getStatuses(
  messageIds: string[]
): Promise<Record<string, WhatsAppMessageStatus>> {
  if (messageIds.length === 0) return {}

  const supabase = createTemplateServiceClient()
  const { data, error } = await supabase
    .from("whatsapp_message_status")
    .select("*")
    .in("message_id", messageIds)

  if (error) {
    console.error("getStatuses error:", error)
    return {}
  }

  return (data ?? []).reduce<Record<string, WhatsAppMessageStatus>>((acc, row) => {
    acc[row.message_id] = row as WhatsAppMessageStatus
    return acc
  }, {})
}

export async function getStatus(
  messageId: string
): Promise<WhatsAppMessageStatus | null> {
  const statuses = await getStatuses([messageId])
  return statuses[messageId] ?? null
}

export async function upsertStatus(
  messageId: string,
  status: "new" | "in_progress" | "resolved",
  notes?: string
): Promise<WhatsAppMessageStatus | null> {
  const supabase = createTemplateServiceClient()

  const { data, error } = await supabase
    .from("whatsapp_message_status")
    .upsert(
      {
        message_id: messageId,
        status,
        notes: notes ?? "",
        updated_at: new Date().toISOString(),
      },
      { onConflict: "message_id" }
    )
    .select()
    .single()

  if (error) {
    console.error("upsertStatus error:", error)
    return null
  }

  return data as WhatsAppMessageStatus
}
