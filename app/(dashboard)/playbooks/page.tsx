import { createServiceClient } from "@/lib/supabase/service"
import PlaybooksView from "./PlaybooksView"

interface Playbook {
  id: string
  title: string
  emoji: string | null
  description: string | null
  content: string | null
  checklist: { label: string; required: boolean }[] | null
  position: number | null
  is_published: boolean
  created_at: string
  updated_at: string
  loom_url: string | null
  examples: { url: string; label: string }[] | null
}

export default async function PlaybooksPage() {
  const supabase = createServiceClient()

  const { data: playbooks, error } = await supabase
    .from("playbooks")
    .select("*")
    .order("position", { ascending: true })

  if (error) {
    return (
      <div className="space-y-6">
        <h1 className="text-lg font-semibold text-white">Playbooks</h1>
        <div className="rounded-xl border border-red-400/20 bg-red-400/10 p-4 text-sm text-red-200">
          Impossible de charger les playbooks : {error.message}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-lg font-semibold text-white">Playbooks</h1>
        <p className="mt-1 text-sm text-zinc-400">
          Guides de montage par cible et avatar. Crée des fiches avec checklists, vidéos Loom et exemples d&apos;ads.
        </p>
      </div>
      <PlaybooksView playbooks={(playbooks || []) as Playbook[]} />
    </div>
  )
}
