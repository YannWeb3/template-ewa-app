import { createClient } from "./server"
import { createServiceClient } from "./service"

export interface WhatsAppMessage {
  waha_message_id: string
  phone: string
  push_name: string
  direction: "INBOUND" | "OUTBOUND"
  body: string
  is_group: boolean
  group_id: string
  media_type: string
  media_url: string
  raw_payload: unknown
}

export interface BlacklistEntry {
  id: string
  phone: string
  label: string
  created_at: string
}

export async function getBlacklist(): Promise<string[]> {
  const supabase = await createClient()
  const { data } = await supabase
    .from("whatsapp_blacklist")
    .select("phone")
  return data?.map((e) => e.phone) ?? []
}

export async function isBlacklisted(phone: string): Promise<boolean> {
  const phones = await getBlacklist()
  return phones.includes(phone)
}

export async function insertMessage(msg: WhatsAppMessage): Promise<boolean> {
  const supabase = createServiceClient()
  const { error } = await supabase.from("whatsapp_messages").insert({
    waha_message_id: msg.waha_message_id,
    phone: msg.phone,
    push_name: msg.push_name,
    direction: msg.direction,
    body: msg.body,
    is_group: msg.is_group,
    group_id: msg.group_id,
    media_type: msg.media_type,
    media_url: msg.media_url,
    raw_payload: msg.raw_payload,
  })
  return !error
}

export async function addToBlacklist(phone: string, label: string): Promise<boolean> {
  const supabase = createServiceClient()
  const { error } = await supabase.from("whatsapp_blacklist").insert({ phone, label })
  return !error
}

export async function removeFromBlacklist(phone: string): Promise<boolean> {
  const supabase = createServiceClient()
  const { error } = await supabase.from("whatsapp_blacklist").delete().eq("phone", phone)
  return !error
}

export async function listBlacklist(): Promise<BlacklistEntry[]> {
  const supabase = await createClient()
  const { data } = await supabase
    .from("whatsapp_blacklist")
    .select("*")
    .order("created_at", { ascending: false })
  return data ?? []
}
