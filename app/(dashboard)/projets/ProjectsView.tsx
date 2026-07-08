"use client"

import { useState, useMemo } from "react"
import {
  Plus,
  Search,
  LayoutGrid,
  List,
  Kanban,
  MoreHorizontal,
  Clock,
  CheckCircle2,
  AlertCircle,
  PauseCircle,
  X,
  FolderKanban,
  User,
  CalendarDays,
  CreditCard,
} from "lucide-react"

interface Project {
  id: string
  title: string
  client_id: string
  client_name: string
  client_company: string | null
  editor_id: string
  editor_name: string
  format: string
  status: string
  status_label: string
  deadline: string
  progress: number
  budget: number
  deliverables_count: number
  created_at: string
}

interface ProjectsViewProps {
  projects: Project[]
}

const statusConfig: Record<string, { label: string; badge: string; icon: React.ElementType }> = {
  a_faire: { label: "À faire", badge: "bg-blue-400/10 text-blue-400 border-blue-400/20", icon: AlertCircle },
  en_cours: { label: "En cours", badge: "bg-amber-400/10 text-amber-400 border-amber-400/20", icon: Clock },
  en_validation: { label: "En validation", badge: "bg-purple-400/10 text-purple-400 border-purple-400/20", icon: PauseCircle },
  termine: { label: "Terminé", badge: "bg-emerald-400/10 text-emerald-400 border-emerald-400/20", icon: CheckCircle2 },
  en_retard: { label: "En retard", badge: "bg-red-400/10 text-red-400 border-red-400/20", icon: AlertCircle },
}

const kanbanOrder = ["a_faire", "en_cours", "en_validation", "en_retard", "termine"]

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(amount)
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("fr-FR", { day: "numeric", month: "short" })
}

function formatRelativeDate(dateStr: string) {
  const date = new Date(dateStr)
  const now = new Date()
  const diffMs = date.getTime() - now.getTime()
  const diffD = Math.floor(diffMs / 86400000)

  if (diffD < 0) return `En retard de ${Math.abs(diffD)}j`
  if (diffD === 0) return "Aujourd'hui"
  if (diffD === 1) return "Demain"
  if (diffD < 7) return `Dans ${diffD}j`
  return formatDate(dateStr)
}

export default function ProjectsView({ projects }: ProjectsViewProps) {
  const [view, setView] = useState<"grid" | "list" | "kanban">("grid")
  const [statusFilter, setStatusFilter] = useState<string | null>(null)
  const [formatFilter, setFormatFilter] = useState<string | null>(null)
  const [search, setSearch] = useState("")

  const uniqueFormats = useMemo(() => Array.from(new Set(projects.map((p) => p.format))).sort(), [projects])

  const filteredProjects = useMemo(() => {
    return projects.filter((p) => {
      const matchesStatus = !statusFilter || p.status === statusFilter
      const matchesFormat = !formatFilter || p.format === formatFilter
      const term = search.toLowerCase()
      const matchesSearch =
        !term ||
        p.title.toLowerCase().includes(term) ||
        p.client_name.toLowerCase().includes(term) ||
        p.editor_name.toLowerCase().includes(term) ||
        p.format.toLowerCase().includes(term)
      return matchesStatus && matchesFormat && matchesSearch
    })
  }, [projects, statusFilter, formatFilter, search])

  const counts = useMemo(() => {
    return {
      TOUS: projects.length,
      a_faire: projects.filter((p) => p.status === "a_faire").length,
      en_cours: projects.filter((p) => p.status === "en_cours").length,
      en_validation: projects.filter((p) => p.status === "en_validation").length,
      termine: projects.filter((p) => p.status === "termine").length,
      en_retard: projects.filter((p) => p.status === "en_retard").length,
    }
  }, [projects])

  const statusFilters = [
    { id: null, label: "Tous" },
    { id: "a_faire", label: "À faire" },
    { id: "en_cours", label: "En cours" },
    { id: "en_validation", label: "En validation" },
    { id: "termine", label: "Terminés" },
    { id: "en_retard", label: "En retard" },
  ]

  const activeFiltersCount = [statusFilter, formatFilter].filter(Boolean).length + (search ? 1 : 0)

  const renderGrid = () => (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {filteredProjects.map((project) => {
        const status = statusConfig[project.status] || statusConfig.a_faire
        const StatusIcon = status.icon
        return (
          <div
            key={project.id}
            className="group flex flex-col rounded-2xl border border-white/[0.08] bg-[hsl(0_0%_13%)] p-5 transition-all duration-300 hover:-translate-y-0.5 hover:border-white/[0.15] hover:shadow-[0_8px_30px_rgba(255,107,26,0.06)]"
          >
            <div className="mb-3 flex items-start justify-between">
              <div className="min-w-0">
                <p className="font-medium text-white truncate">{project.title}</p>
                <p className="text-xs text-white/40 truncate">{project.client_name} · {project.format}</p>
              </div>
              <span className={`inline-flex shrink-0 items-center gap-1 rounded border px-2 py-0.5 text-[11px] font-medium ${status.badge}`}>
                <StatusIcon className="h-3 w-3" />
                {status.label}
              </span>
            </div>

            <div className="mt-auto space-y-3">
              <div className="flex items-center gap-2 text-xs text-white/40">
                <CalendarDays className="h-3.5 w-3.5" />
                {formatRelativeDate(project.deadline)}
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-white/40">Progression</span>
                  <span className="text-white/60">{project.progress}%</span>
                </div>
                <div className="h-1.5 w-full rounded-full bg-white/[0.08]">
                  <div
                    className="h-full rounded-full bg-ewa-orange transition-all duration-500"
                    style={{ width: `${project.progress}%` }}
                  />
                </div>
              </div>

              <div className="flex items-center justify-between border-t border-white/[0.06] pt-3">
                <div className="flex items-center gap-1.5">
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-ewa-orange/10 text-[10px] font-medium text-ewa-orange">
                    {project.editor_name[0]}
                  </div>
                  <span className="text-xs text-white/50">{project.editor_name}</span>
                </div>
                <div className="flex items-center gap-1 text-xs font-medium text-white">
                  <CreditCard className="h-3.5 w-3.5 text-white/30" />
                  {formatCurrency(project.budget)}
                </div>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )

  const renderList = () => (
    <div className="overflow-hidden rounded-2xl border border-white/[0.08] bg-[hsl(0_0%_13%)]">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/[0.08] text-left text-white/40">
              <th className="px-4 py-3 font-medium">Projet</th>
              <th className="px-4 py-3 font-medium">Client</th>
              <th className="px-4 py-3 font-medium">Statut</th>
              <th className="px-4 py-3 font-medium">Format</th>
              <th className="px-4 py-3 font-medium">Deadline</th>
              <th className="px-4 py-3 font-medium">Avancement</th>
              <th className="px-4 py-3 font-medium">Monteur</th>
              <th className="px-4 py-3 font-medium">Budget</th>
              <th className="px-4 py-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredProjects.map((project) => {
              const status = statusConfig[project.status] || statusConfig.a_faire
              const StatusIcon = status.icon
              return (
                <tr key={project.id} className="border-b border-white/[0.04] transition-colors hover:bg-white/[0.02]">
                  <td className="px-4 py-3 font-medium text-white">{project.title}</td>
                  <td className="px-4 py-3 text-white/60">{project.client_name}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center gap-1 rounded border px-2 py-0.5 text-[11px] font-medium ${status.badge}`}>
                      <StatusIcon className="h-3 w-3" />
                      {status.label}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-white/60">{project.format}</td>
                  <td className="px-4 py-3 text-white/60">{formatRelativeDate(project.deadline)}</td>
                  <td className="px-4 py-3">
                    <div className="w-24">
                      <div className="mb-1 flex items-center justify-between text-xs">
                        <span className="text-white/60">{project.progress}%</span>
                      </div>
                      <div className="h-1.5 w-full rounded-full bg-white/[0.08]">
                        <div className="h-full rounded-full bg-ewa-orange" style={{ width: `${project.progress}%` }} />
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-white/60">{project.editor_name}</td>
                  <td className="px-4 py-3 font-medium text-white">{formatCurrency(project.budget)}</td>
                  <td className="px-4 py-3">
                    <button className="rounded-lg p-1.5 text-white/30 transition-colors hover:bg-white/[0.08] hover:text-white/60">
                      <MoreHorizontal className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )

  const renderKanban = () => (
    <div className="grid gap-4 lg:grid-cols-5">
      {kanbanOrder.map((statusId) => {
        const status = statusConfig[statusId] || statusConfig.a_faire
        const columnProjects = filteredProjects.filter((p) => p.status === statusId)
        const StatusIcon = status.icon
        return (
          <div key={statusId} className="flex flex-col rounded-2xl border border-white/[0.08] bg-[hsl(0_0%_10%)] p-3">
            <div className="mb-3 flex items-center justify-between">
              <span className={`inline-flex items-center gap-1 rounded border px-2 py-0.5 text-[11px] font-medium ${status.badge}`}>
                <StatusIcon className="h-3 w-3" />
                {status.label}
              </span>
              <span className="text-xs text-white/40">{columnProjects.length}</span>
            </div>
            <div className="flex flex-1 flex-col gap-2">
              {columnProjects.map((project) => (
                <div
                  key={project.id}
                  className="rounded-xl border border-white/[0.08] bg-[hsl(0_0%_13%)] p-3 transition-all duration-200 hover:-translate-y-0.5 hover:border-white/[0.15]"
                >
                  <p className="mb-1 text-sm font-medium text-white">{project.title}</p>
                  <p className="mb-3 text-xs text-white/40">{project.client_name}</p>
                  <div className="mb-2 flex items-center gap-2">
                    <div className="flex h-5 w-5 items-center justify-center rounded-full bg-ewa-orange/10 text-[9px] font-medium text-ewa-orange">
                      {project.editor_name[0]}
                    </div>
                    <span className="text-[11px] text-white/50">{project.editor_name}</span>
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-white/40">{project.progress}%</span>
                      <span className="text-white/60">{formatCurrency(project.budget)}</span>
                    </div>
                    <div className="h-1 w-full rounded-full bg-white/[0.08]">
                      <div className="h-full rounded-full bg-ewa-orange" style={{ width: `${project.progress}%` }} />
                    </div>
                  </div>
                </div>
              ))}
              {columnProjects.length === 0 && (
                <p className="py-4 text-center text-xs text-white/20">Aucun projet</p>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-white">Projets</h1>
          <p className="text-sm text-white/40">{projects.length} projets actifs · {counts.en_cours} en cours · {counts.termine} terminés</p>
        </div>
        <button className="flex items-center gap-2 rounded-xl bg-ewa-orange px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-ewa-orange/90">
          <Plus className="h-4 w-4" />
          Nouveau projet
        </button>
      </div>

      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative sm:max-w-xs">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/30" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Rechercher un projet..."
              className="w-full rounded-xl border border-white/[0.08] bg-[hsl(0_0%_13%)] py-2.5 pl-10 pr-4 text-sm text-white placeholder:text-white/30 focus:border-ewa-orange/50 focus:outline-none"
            />
          </div>

          <select
            value={formatFilter || ""}
            onChange={(e) => setFormatFilter(e.target.value || null)}
            className="rounded-xl border border-white/[0.08] bg-[hsl(0_0%_13%)] px-3 py-2.5 text-sm text-white outline-none focus:border-ewa-orange/50"
          >
            <option value="">Tous les formats</option>
            {uniqueFormats.map((f) => (
              <option key={f} value={f}>{f}</option>
            ))}
          </select>

          {activeFiltersCount > 0 && (
            <button
              onClick={() => {
                setStatusFilter(null)
                setFormatFilter(null)
                setSearch("")
              }}
              className="flex items-center gap-1.5 rounded-xl border border-white/[0.08] bg-white/[0.04] px-3 py-2.5 text-sm font-medium text-white/70 transition-colors hover:bg-white/[0.08] hover:text-white"
            >
              <X className="h-3.5 w-3.5" />
              Réinitialiser
            </button>
          )}
        </div>

        <div className="flex items-center gap-1 rounded-xl border border-white/[0.08] bg-[hsl(0_0%_13%)] p-1">
          {[
            { id: "grid", icon: LayoutGrid, label: "Grille" },
            { id: "list", icon: List, label: "Liste" },
            { id: "kanban", icon: Kanban, label: "Kanban" },
          ].map((v) => {
            const active = view === (v.id as typeof view)
            const Icon = v.icon
            return (
              <button
                key={v.id}
                onClick={() => setView(v.id as typeof view)}
                className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                  active ? "bg-ewa-orange text-white" : "text-white/50 hover:bg-white/[0.06] hover:text-white"
                }`}
              >
                <Icon className="h-4 w-4" />
                {v.label}
              </button>
            )
          })}
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {statusFilters.map((f) => {
          const active = statusFilter === f.id
          const count = f.id === null ? counts.TOUS : counts[f.id as keyof typeof counts]
          return (
            <button
              key={f.label}
              onClick={() => setStatusFilter(f.id)}
              className={`flex items-center gap-2 rounded-xl border px-3 py-2 text-sm font-medium transition-colors ${
                active
                  ? "border-ewa-orange bg-ewa-orange/10 text-ewa-orange"
                  : "border-white/[0.08] bg-[hsl(0_0%_13%)] text-white/60 hover:bg-white/[0.06] hover:text-white"
              }`}
            >
              {f.label}
              <span className={`rounded px-1.5 py-0.5 text-xs ${active ? "bg-ewa-orange/20 text-ewa-orange" : "bg-white/[0.08] text-white/40"}`}>
                {count}
              </span>
            </button>
          )
        })}
      </div>

      {filteredProjects.length === 0 ? (
        <div className="rounded-2xl border border-white/[0.08] bg-[hsl(0_0%_13%)] p-12 text-center">
          <FolderKanban className="mx-auto mb-3 h-10 w-10 text-white/20" />
          <p className="text-sm text-white/40">Aucun projet ne correspond aux filtres.</p>
        </div>
      ) : view === "grid" ? (
        renderGrid()
      ) : view === "list" ? (
        renderList()
      ) : (
        renderKanban()
      )}
    </div>
  )
}
