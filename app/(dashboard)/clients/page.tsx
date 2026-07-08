import { createServiceClient } from "@/lib/supabase/service"
import ClientsTable from "./ClientsTable"

export default async function ClientsPage() {
  const supabase = createServiceClient()

  const { data: clients, error } = await supabase
    .from("clients")
    .select(
      "id, name, company, email, phone, status, source, created_at, whatsapp_phone, whatsapp_phone_canonical, phone_canonical, portal_token, onboarding_done, onboarding_step, onboarding_completed_at, drive_url, da_url, instagram_url, frameio_url, notes, address, tva_number, country"
    )
    .order("created_at", { ascending: false })

  if (error) {
    return (
      <div className="space-y-6">
        <h1 className="text-lg font-semibold text-white">Clients</h1>
        <div className="rounded-xl border border-red-400/20 bg-red-400/10 p-4 text-sm text-red-200">
          Impossible de charger les clients : {error.message}
        </div>
      </div>
    )
  }

  // Récupérer le dernier message WhatsApp par numéro de téléphone
  const displayClients = clients || []
  const phones = displayClients
    .map((c) => c.whatsapp_phone_canonical || c.phone_canonical || c.whatsapp_phone || c.phone)
    .filter(Boolean)

  let lastMessages: Record<string, string> = {}
  if (phones.length > 0) {
    const { data: messages } = await supabase
      .from("whatsapp_messages")
      .select("phone, created_at")
      .in("phone", phones)
      .order("created_at", { ascending: false })

    if (messages) {
      for (const msg of messages) {
        if (!lastMessages[msg.phone]) {
          lastMessages[msg.phone] = msg.created_at
        }
      }
    }
  }

  return <ClientsTable clients={displayClients} lastMessages={lastMessages} />
}
