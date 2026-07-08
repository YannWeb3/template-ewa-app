import { createServiceClient } from "@/lib/supabase/service"
import AnalyticsView from "./AnalyticsView"

export default async function AnalyticsPage() {
  const supabase = createServiceClient()

  const [{ data: editors, error: editorsError }, { data: clients, error: clientsError }] = await Promise.all([
    supabase.from("editors").select("id, name").order("name", { ascending: true }),
    supabase.from("clients").select("id, name, company, source"),
  ])

  if (editorsError || clientsError) {
    return (
      <div className="space-y-6">
        <h1 className="text-lg font-semibold text-white">Analytics</h1>
        <div className="rounded-xl border border-red-400/20 bg-red-400/10 p-4 text-sm text-red-200">
          Impossible de charger les analytics : {(editorsError || clientsError)?.message}
        </div>
      </div>
    )
  }

  return <AnalyticsView editors={editors || []} clients={clients || []} />
}
