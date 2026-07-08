import { createServiceClient } from "@/lib/supabase/service"
import TeamView from "./TeamView"

interface Editor {
  id: string
  name: string | null
  status: string | null
  onboarding_status: string | null
  current_load: number | null
  created_at: string
}

interface Profile {
  id: string
  email: string | null
  full_name: string | null
  role: string | null
  created_at: string
}

export default async function EquipePage() {
  const supabase = createServiceClient()

  const [{ data: editors, error: editorsError }, { data: profiles, error: profilesError }] = await Promise.all([
    supabase
      .from("editors")
      .select("id, name, status, onboarding_status, current_load, created_at")
      .order("name", { ascending: true }),
    supabase.from("profiles").select("id, email, full_name, role, created_at").order("full_name", { ascending: true }),
  ])

  if (editorsError || profilesError) {
    return (
      <div className="space-y-6">
        <h1 className="text-lg font-semibold text-white">Équipe</h1>
        <div className="rounded-xl border border-red-400/20 bg-red-400/10 p-4 text-sm text-red-200">
          Impossible de charger l'équipe : {(editorsError || profilesError)?.message}
        </div>
      </div>
    )
  }

  // Fusionner editors et profiles en un seul tableau de membres
  const editorMembers = (editors || []).map((editor) => ({
    id: editor.id,
    name: editor.name,
    email: null,
    role: "Monteur",
    status: editor.status,
    type: "editor" as const,
    created_at: editor.created_at,
  }))

  const profileMembers = (profiles || []).map((profile) => ({
    id: profile.id,
    name: profile.full_name,
    email: profile.email,
    role: profile.role === "ADMIN" ? "Administrateur" : profile.role === "DA" ? "Directrice Artistique" : profile.role,
    status: "active" as const,
    type: "profile" as const,
    created_at: profile.created_at,
  }))

  const members = [...editorMembers, ...profileMembers]

  return <TeamView members={members} />
}
