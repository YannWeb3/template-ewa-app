"use client"

import { useState, useMemo } from "react"
import {
  Scissors,
  Search,
  Filter,
  X,
  CheckCircle2,
  AlertCircle,
  Clock,
  MessageSquare,
  ExternalLink,
  MoreHorizontal,
  ArrowUpCircle,
  ArrowDownCircle,
  MinusCircle,
  Film,
} from "lucide-react"

type Status = "pending" | "in_progress" | "resolved"
type Priority = "high" | "medium" | "low"

interface Feedback {
  id: string
  project: string
  client: string
  editor: string
  text: string
  status: Status
  priority: Priority
  timestamp: string
  source: "Frame.io" | "WhatsApp" | "Email" | "Loom"
  assetUrl?: string
  comments: number
}

const FEEDBACKS: Feedback[] = [
  {
    id: "fb-001",
    project: "Campagne Printemps 2026",
    client: "L'Oréal",
    editor: "Camille",
    text: "Le hook est un peu long, couper les 2 premières secondes. Le reste est top.",
    status: "pending",
    priority: "high",
    timestamp: "2026-07-01T14:30:00Z",
    source: "Frame.io",
    assetUrl: "https://frame.io",
    comments: 2,
  },
  {
    id: "fb-002",
    project: "Spot Publicitaire",
    client: "Nike",
    editor: "Matt",
    text: "Musique trop forte sur la voix off à 00:45. À baisser de 3dB.",
    status: "in_progress",
    priority: "medium",
    timestamp: "2026-06-30T09:15:00Z",
    source: "Frame.io",
    assetUrl: "https://frame.io",
    comments: 1,
  },
  {
    id: "fb-003",
    project: "Motion Design Saison 2",
    client: "Spotify",
    editor: "Ambre",
    text: "Ralentir la transition à 00:06. Typo à corriger : 'Saisons' → 'Saison'.",
    status: "pending",
    priority: "high",
    timestamp: "2026-07-01T11:00:00Z",
    source: "WhatsApp",
    comments: 3,
  },
  {
    id: "fb-004",
    project: "Série Reels Q3",
    client: "Gymshark",
    editor: "Léo",
    text: "Version validée, merci pour la réactivité !",
    status: "resolved",
    priority: "low",
    timestamp: "2026-06-28T16:00:00Z",
    source: "Email",
    comments: 0,
  },
  {
    id: "fb-005",
    project: "Lancement Produit Tech",
    client: "Ledger",
    editor: "Killian",
    text: "Peut-on ajouter un plan du produit en plan fixe au début ?",
    status: "pending",
    priority: "medium",
    timestamp: "2026-07-01T08:45:00Z",
    source: "Loom",
    assetUrl: "https://www.loom.com/share/example",
    comments: 1,
  },
  {
    id: "fb-006",
    project: "Recap Annuel",
    client: "EWA Internal",
    editor: "Rayane",
    text: "Faute de frappe dans le carton final : 'réussite' avec un seul s.",
    status: "resolved",
    priority: "low",
    timestamp: "2026-06-25T18:30:00Z",
    source: "WhatsApp",
    comments: 2,
  },
]

const statusConfig: Record<Status, { label: string; badge: string; icon: React.ElementType }> = {
  pending: { label: "En attente", badge: "bg-amber-400/10 text-amber-400 border-amber-400/20", icon: AlertCircle },
  in_progress: { label: "En cours", badge: "bg-blue-400/10 text-blue-400 border-blue-400/20", icon: Clock },
  resolved: { label: "Résolu", badge: "bg-emerald-400/10 text-emerald-400 border-emerald-400/20", icon: CheckCircle2 },
}

const priorityConfig: Record<Priority, { label: string; icon: React.ElementType; color: string }> = {
  high: { label: "Haute", icon: ArrowUpCircle, color: "text-red-400" },
  medium: { label: "Moyenne", icon: MinusCircle, color: "text-amber-400" },
  low: { label: "Basse", icon: ArrowDownCircle, color: "text-emerald-400" },
}

const sourceConfig: Record<Feedback["source"], string> = {
  "Frame.io": "bg-purple-400/10 text-purple-400 border-purple-400/20",
  WhatsApp: "bg-green-400/10 text-green-400 border-green-400/20",
  Email: "bg-blue-400/10 text-blue-400 border-blue-400/20",
  Loom: "bg-pink-400/10 text-pink-400 border-pink-400/20",
}

function formatRelativeDate(dateStr: string) {
  const date = new Date(dateStr)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMin = Math.floor(diffMs / 60000)
  const diffH = Math.floor(diffMs / 3600000)
  const diffD = Math.floor(diffMs / 86400000)
  if (diffMin < 1) return "À l'instant"
  if (diffMin < 60) return `Il y a ${diffMin} min`
  if (diffH < 24) return `Il y a ${diffH}h`
  if (diffD < 7) return `Il y a ${diffD}j`
  return date.toLocaleDateString("fr-FR", { day: "numeric", month: "short" })
}

export default function RetourMontagePage() {
  const [feedbacks, setFeedbacks] = useState<Feedback[]>(FEEDBACKS)
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState<"all" | Status>("all")
  const [priorityFilter, setPriorityFilter] = useState<"all" | Priority>("all")
  const [sourceFilter, setSourceFilter] = useState<"all" | Feedback["source"]>("all")

  const filteredFeedbacks = useMemo(() => {
    return feedbacks.filter((f) => {
      const term = search.toLowerCase()
      const matchesSearch =
        !term ||
        f.project.toLowerCase().includes(term) ||
        f.client.toLowerCase().includes(term) ||
        f.editor.toLowerCase().includes(term) ||
        f.text.toLowerCase().includes(term)
      const matchesStatus = statusFilter === "all" || f.status === statusFilter
      const matchesPriority = priorityFilter === "all" || f.priority === priorityFilter
      const matchesSource = sourceFilter === "all" || f.source === sourceFilter
      return matchesSearch && matchesStatus && matchesPriority && matchesSource
    })
  }, [feedbacks, search, statusFilter, priorityFilter, sourceFilter])

  const stats = useMemo(() => {
    return {
      total: feedbacks.length,
      pending: feedbacks.filter((f) => f.status === "pending").length,
      in_progress: feedbacks.filter((f) => f.status === "in_progress").length,
      resolved: feedbacks.filter((f) => f.status === "resolved").length,
      highPriority: feedbacks.filter((f) => f.priority === "high" && f.status !== "resolved").length,
    }
  }, [feedbacks])

  function updateStatus(id: string, status: Status) {
    setFeedbacks((prev) => prev.map((f) => (f.id === id ? { ...f, status } : f)))
  }

  const activeFiltersCount =
    (search ? 1 : 0) +
    (statusFilter !== "all" ? 1 : 0) +
    (priorityFilter !== "all" ? 1 : 0) +
    (sourceFilter !== "all" ? 1 : 0)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-white">Retour montage</h1>
          <p className="text-sm text-white/40">Commentaires, retours clients et validations de montage</p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <div className="rounded-2xl border border-white/[0.08] bg-[hsl(0_0%_13%)] p-4">
          <div className="mb-2 flex items-center gap-2 text-white/40">
            <MessageSquare className="h-4 w-4" />
            <span className="text-xs font-medium">Retours</span>
          </div>
          <p className="text-2xl font-semibold text-white">{stats.total}</p>
        </div>
        <div className="rounded-2xl border border-white/[0.08] bg-[hsl(0_0%_13%)] p-4">
          <div className="mb-2 flex items-center gap-2 text-white/40">
            <AlertCircle className="h-4 w-4" />
            <span className="text-xs font-medium">En attente</span>
          </div>
          <p className="text-2xl font-semibold text-white">{stats.pending}</p>
        </div>
        <div className="rounded-2xl border border-white/[0.08] bg-[hsl(0_0%_13%)] p-4">
          <div className="mb-2 flex items-center gap-2 text-white/40">
            <Clock className="h-4 w-4" />
            <span className="text-xs font-medium">En cours</span>
          </div>
          <p className="text-2xl font-semibold text-white">{stats.in_progress}</p>
        </div>
        <div className="rounded-2xl border border-white/[0.08] bg-[hsl(0_0%_13%)] p-4">
          <div className="mb-2 flex items-center gap-2 text-white/40">
            <CheckCircle2 className="h-4 w-4" />
            <span className="text-xs font-medium">Résolus</span>
          </div>
          <p className="text-2xl font-semibold text-white">{stats.resolved}</p>
        </div>
        <div className="rounded-2xl border border-white/[0.08] bg-[hsl(0_0%_13%)] p-4">
          <div className="mb-2 flex items-center gap-2 text-white/40">
            <ArrowUpCircle className="h-4 w-4" />
            <span className="text-xs font-medium">Priorité haute</span>
          </div>
          <p className="text-2xl font-semibold text-white">{stats.highPriority}</p>
        </div>
      </div>

      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative sm:max-w-xs">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/30" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Rechercher un retour..."
              className="w-full rounded-xl border border-white/[0.08] bg-[hsl(0_0%_13%)] py-2.5 pl-10 pr-4 text-sm text-white placeholder:text-white/30 focus:border-ewa-orange/50 focus:outline-none"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)}
            className="rounded-xl border border-white/[0.08] bg-[hsl(0_0%_13%)] px-3 py-2.5 text-sm text-white outline-none focus:border-ewa-orange/50"
          >
            <option value="all">Tous les statuts</option>
            <option value="pending">En attente</option>
            <option value="in_progress">En cours</option>
            <option value="resolved">Résolus</option>
          </select>

          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value as typeof priorityFilter)}
            className="rounded-xl border border-white/[0.08] bg-[hsl(0_0%_13%)] px-3 py-2.5 text-sm text-white outline-none focus:border-ewa-orange/50"
          >
            <option value="all">Toutes les priorités</option>
            <option value="high">Haute</option>
            <option value="medium">Moyenne</option>
            <option value="low">Basse</option>
          </select>

          <select
            value={sourceFilter}
            onChange={(e) => setSourceFilter(e.target.value as typeof sourceFilter)}
            className="rounded-xl border border-white/[0.08] bg-[hsl(0_0%_13%)] px-3 py-2.5 text-sm text-white outline-none focus:border-ewa-orange/50"
          >
            <option value="all">Toutes les sources</option>
            <option value="Frame.io">Frame.io</option>
            <option value="WhatsApp">WhatsApp</option>
            <option value="Email">Email</option>
            <option value="Loom">Loom</option>
          </select>

          {activeFiltersCount > 0 && (
            <button
              onClick={() => {
                setSearch("")
                setStatusFilter("all")
                setPriorityFilter("all")
                setSourceFilter("all")
              }}
              className="flex items-center gap-1.5 rounded-xl border border-white/[0.08] bg-white/[0.04] px-3 py-2.5 text-sm font-medium text-white/70 transition-colors hover:bg-white/[0.08] hover:text-white"
            >
              <X className="h-3.5 w-3.5" />
              Réinitialiser
            </button>
          )}
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-white/[0.08] bg-[hsl(0_0%_13%)]">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/[0.08] text-left text-white/40">
                <th className="px-4 py-3 font-medium">Retour</th>
                <th className="px-4 py-3 font-medium">Projet / Client</th>
                <th className="px-4 py-3 font-medium">Monteur</th>
                <th className="px-4 py-3 font-medium">Priorité</th>
                <th className="px-4 py-3 font-medium">Source</th>
                <th className="px-4 py-3 font-medium">Statut</th>
                <th className="px-4 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredFeedbacks.map((feedback) => {
                const status = statusConfig[feedback.status]
                const StatusIcon = status.icon
                const priority = priorityConfig[feedback.priority]
                const PriorityIcon = priority.icon
                const sourceBadge = sourceConfig[feedback.source]

                return (
                  <tr key={feedback.id} className="border-b border-white/[0.04] transition-colors hover:bg-white/[0.02]">
                    <td className="px-4 py-3">
                      <div className="max-w-xs">
                        <p className="text-sm text-white">{feedback.text}</p>
                        <p className="mt-1 text-xs text-white/40">{formatRelativeDate(feedback.timestamp)}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-sm text-white">{feedback.project}</p>
                      <p className="text-xs text-white/40">{feedback.client}</p>
                    </td>
                    <td className="px-4 py-3 text-white/70">{feedback.editor}</td>
                    <td className="px-4 py-3">
                      <span className={`flex items-center gap-1 text-xs font-medium ${priority.color}`}>
                        <PriorityIcon className="h-3.5 w-3.5" />
                        {priority.label}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`rounded border px-2 py-0.5 text-[10px] font-medium ${sourceBadge}`}>{feedback.source}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1 rounded border px-2 py-0.5 text-[11px] font-medium ${status.badge}`}>
                        <StatusIcon className="h-3 w-3" />
                        {status.label}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        {feedback.assetUrl && (
                          <a
                            href={feedback.assetUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="rounded-lg p-1.5 text-white/40 transition-colors hover:bg-white/[0.08] hover:text-white"
                            title="Ouvrir l'asset"
                          >
                            <ExternalLink className="h-4 w-4" />
                          </a>
                        )}
                        <button
                          onClick={() => updateStatus(feedback.id, feedback.status === "resolved" ? "pending" : "resolved")}
                          className="rounded-lg p-1.5 text-white/40 transition-colors hover:bg-emerald-400/10 hover:text-emerald-400"
                          title={feedback.status === "resolved" ? "Rouvrir" : "Marquer résolu"}
                        >
                          <CheckCircle2 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => updateStatus(feedback.id, feedback.status === "in_progress" ? "pending" : "in_progress")}
                          className="rounded-lg p-1.5 text-white/40 transition-colors hover:bg-blue-400/10 hover:text-blue-400"
                          title={feedback.status === "in_progress" ? "Remettre en attente" : "Marquer en cours"}
                        >
                          <Clock className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}

              {filteredFeedbacks.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-sm text-white/30">
                    Aucun retour ne correspond aux filtres.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
