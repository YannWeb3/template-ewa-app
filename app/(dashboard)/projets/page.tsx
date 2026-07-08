import { createServiceClient } from "@/lib/supabase/service"
import ProjectsView from "./ProjectsView"

interface Client {
  id: string
  name: string | null
  company: string | null
}

interface Editor {
  id: string
  name: string | null
}

const FORMATS = ["Reel", "Carrousel", "Long format", "Motion design", "Ad"]

const STATUSES = [
  { id: "a_faire", label: "À faire", progressBase: 0, progressRange: 5 },
  { id: "en_cours", label: "En cours", progressBase: 30, progressRange: 40 },
  { id: "en_validation", label: "En validation", progressBase: 85, progressRange: 10 },
  { id: "termine", label: "Terminé", progressBase: 100, progressRange: 0 },
  { id: "en_retard", label: "En retard", progressBase: 20, progressRange: 30 },
]

const PROJECT_TITLES = [
  "Campagne Printemps 2026",
  "Video Branding V2",
  "Shooting Lookbook",
  "Spot Publicitaire",
  "Motion Design Saison 2",
  "Série Reels Q3",
  "Lancement Produit Tech",
  "Recap Mensuel Juin",
  "Tutoriel Client",
  "Teaser Événementiel",
  "Campagne Été 2026",
  "Rebrand Corporate",
  "Série Shorts YouTube",
  "Making-of Tournage",
  "Pub Réseaux Sociaux",
  "Story Instagram",
  "Vidéo Formation",
  "Motion Logo",
  "Podcast Visuel",
  "Recap Annuel",
]

function hashString(str: string) {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = (hash << 5) - hash + char
    hash |= 0
  }
  return Math.abs(hash)
}

function generateMockProjects(clients: Client[], editors: Editor[]) {
  const today = new Date()
  const projects = []

  for (let i = 0; i < 20; i++) {
    const title = PROJECT_TITLES[i]
    const clientIndex = hashString(`${title}-client`) % clients.length
    const editorIndex = hashString(`${title}-editor`) % editors.length
    const statusIndex = hashString(`${title}-status`) % STATUSES.length
    const formatIndex = hashString(`${title}-format`) % FORMATS.length

    const client = clients[clientIndex]
    const editor = editors[editorIndex]
    const status = STATUSES[statusIndex]
    const format = FORMATS[formatIndex]

    const daysOffset = (hashString(`${title}-deadline`) % 40) - 10
    const deadline = new Date(today)
    deadline.setDate(deadline.getDate() + daysOffset)

    const progress = status.progressBase + (status.progressRange > 0 ? hashString(`${title}-progress`) % status.progressRange : 0)
    const budget = 1500 + (hashString(`${title}-budget`) % 15000)
    const deliverables = 1 + (hashString(`${title}-deliverables`) % 5)

    projects.push({
      id: `proj-mock-${i.toString().padStart(2, "0")}`,
      title,
      client_id: client.id,
      client_name: client.name || client.company || "Client inconnu",
      client_company: client.company,
      editor_id: editor.id,
      editor_name: editor.name || "Monteur",
      format,
      status: status.id,
      status_label: status.label,
      deadline: deadline.toISOString(),
      progress,
      budget,
      deliverables_count: deliverables,
      created_at: new Date(today.getTime() - hashString(`${title}-created`) % 10000000000).toISOString(),
    })
  }

  return projects
}

export default async function ProjetsPage() {
  const supabase = createServiceClient()

  const [{ data: clients, error: clientsError }, { data: editors, error: editorsError }] = await Promise.all([
    supabase.from("clients").select("id, name, company").order("created_at", { ascending: false }),
    supabase.from("editors").select("id, name").order("name", { ascending: true }),
  ])

  if (clientsError || editorsError) {
    return (
      <div className="space-y-6">
        <h1 className="text-lg font-semibold text-white">Projets</h1>
        <div className="rounded-xl border border-red-400/20 bg-red-400/10 p-4 text-sm text-red-200">
          Impossible de charger les données : {(clientsError || editorsError)?.message}
        </div>
      </div>
    )
  }

  const safeClients = (clients || []).length > 0 ? (clients as Client[]) : [{ id: "client-1", name: "Client Demo", company: "Demo" }]
  const safeEditors = (editors || []).length > 0 ? (editors as Editor[]) : [{ id: "editor-1", name: "Monteur Demo" }]

  const projects = generateMockProjects(safeClients, safeEditors)

  return <ProjectsView projects={projects} />
}
