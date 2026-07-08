"use client"

import { useState, useMemo } from "react"
import {
  Plus,
  Search,
  LayoutGrid,
  List,
  MoreHorizontal,
  Star,
  Briefcase,
  TrendingUp,
  X,
  UsersRound,
  Award,
  AlertCircle,
  CheckCircle2,
  Mail,
  UserCircle,
} from "lucide-react"

interface Member {
  id: string
  name: string | null
  email: string | null
  role: string | null
  status: string | null
  type: "editor" | "profile"
  created_at: string
}

interface TeamViewProps {
  members: Member[]
}

const EDITOR_SKILLS_POOL = [
  "Reels",
  "Carrousels",
  "Motion design",
  "Long format",
  "Color grading",
  "Sound design",
  "After Effects",
  "Premiere Pro",
  "DaVinci Resolve",
  "Copywriting",
  "VFX",
  "3D",
]

const EDITOR_ROLES = ["Monteur", "Monteur senior", "Responsable créatif", "Motion designer", "Chef de projet"]

function hashString(str: string) {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = (hash << 5) - hash + char
    hash |= 0
  }
  return Math.abs(hash)
}

function generateMockStats(member: Member) {
  const h = hashString(member.id)

  if (member.type === "profile") {
    return {
      skills: member.role === "ADMIN" ? ["Management", "Stratégie", "Operations"] : ["Direction artistique", "Création", "Validation"],
      rating: 4.5 + ((h % 6) / 10),
      projectsDone: 50 + (h % 100),
      monthlyRevenue: 0,
      availability: "active" as const,
      weeklyHours: 35,
      satisfaction: 90 + (h % 10),
      onTimeRate: 90 + (h % 10),
    }
  }

  const skillCount = 2 + (h % 5)
  const skills = []
  for (let i = 0; i < skillCount; i++) {
    skills.push(EDITOR_SKILLS_POOL[(h + i * 7) % EDITOR_SKILLS_POOL.length])
  }

  return {
    skills: Array.from(new Set(skills)),
    rating: 3.5 + ((h % 17) / 10),
    projectsDone: 15 + (h % 120),
    monthlyRevenue: 2000 + (h % 9000),
    availability: h % 100 < 70 ? "available" : "busy",
    weeklyHours: 20 + (h % 25),
    satisfaction: 75 + (h % 24),
    onTimeRate: 70 + (h % 29),
  }
}

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(amount)
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("fr-FR", { month: "long", year: "numeric" })
}

const statusConfig: Record<string, { label: string; badge: string; icon: React.ElementType }> = {
  active: { label: "Actif", badge: "bg-emerald-400/10 text-emerald-400 border-emerald-400/20", icon: CheckCircle2 },
  inactive: { label: "Inactif", badge: "bg-white/10 text-white/60 border-white/20", icon: AlertCircle },
  pending: { label: "En attente", badge: "bg-amber-400/10 text-amber-400 border-amber-400/20", icon: AlertCircle },
}

const typeConfig: Record<"editor" | "profile", { label: string; badge: string }> = {
  editor: { label: "Monteur", badge: "bg-ewa-orange/10 text-ewa-orange border-ewa-orange/20" },
  profile: { label: "Staff", badge: "bg-blue-400/10 text-blue-400 border-blue-400/20" },
}

export default function TeamView({ members }: TeamViewProps) {
  const [view, setView] = useState<"grid" | "list">("grid")
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState<string | null>(null)
  const [typeFilter, setTypeFilter] = useState<"editor" | "profile" | null>(null)

  const enrichedMembers = useMemo(() => {
    return members.map((member) => ({
      ...member,
      ...generateMockStats(member),
    }))
  }, [members])

  const filteredMembers = useMemo(() => {
    return enrichedMembers.filter((m) => {
      const matchesStatus = !statusFilter || m.status === statusFilter
      const matchesType = !typeFilter || m.type === typeFilter
      const term = search.toLowerCase()
      const matchesSearch =
        !term ||
        (m.name?.toLowerCase().includes(term) ?? false) ||
        (m.email?.toLowerCase().includes(term) ?? false) ||
        (m.role?.toLowerCase().includes(term) ?? false) ||
        m.skills.some((s) => s.toLowerCase().includes(term))
      return matchesStatus && matchesType && matchesSearch
    })
  }, [enrichedMembers, statusFilter, typeFilter, search])

  const counts = useMemo(() => {
    return {
      TOUS: members.length,
      active: members.filter((m) => m.status === "active").length,
      inactive: members.filter((m) => m.status === "inactive").length,
      pending: members.filter((m) => m.status === "pending").length,
      editor: members.filter((m) => m.type === "editor").length,
      profile: members.filter((m) => m.type === "profile").length,
    }
  }, [members])

  const statusFilters = [
    { id: null, label: "Tous" },
    { id: "active", label: "Actifs" },
    { id: "inactive", label: "Inactifs" },
    { id: "pending", label: "En attente" },
  ]

  const activeFiltersCount = [statusFilter, typeFilter].filter(Boolean).length + (search ? 1 : 0)

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-3 w-3 ${star <= Math.round(rating) ? "fill-ewa-orange text-ewa-orange" : "text-white/20"}`}
          />
        ))}
        <span className="ml-1 text-xs text-white/60">{rating.toFixed(1)}</span>
      </div>
    )
  }

  const renderGrid = () => (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {filteredMembers.map((member) => {
        const status = statusConfig[member.status || "active"] || statusConfig.active
        const StatusIcon = status.icon
        const typeInfo = typeConfig[member.type]
        const initials = member.name?.slice(0, 2).toUpperCase() || "?"
        const colorIndex = hashString(member.id) % 5
        const avatarGradients = [
          "from-ewa-orange to-orange-600",
          "from-purple-500 to-indigo-600",
          "from-emerald-500 to-teal-600",
          "from-blue-500 to-cyan-600",
          "from-pink-500 to-rose-600",
        ]

        return (
          <div
            key={member.id}
            className="group relative flex flex-col rounded-2xl border border-white/[0.08] bg-[hsl(0_0%_13%)] p-5 transition-all duration-300 hover:-translate-y-0.5 hover:border-white/[0.15] hover:shadow-[0_8px_30px_rgba(255,107,26,0.06)]"
          >
            <div className="mb-4 flex items-start justify-between">
              <div className={`flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${avatarGradients[colorIndex]} text-sm font-bold text-white`}>
                {initials}
              </div>
              <div className="flex flex-col items-end gap-1">
                <span className={`inline-flex items-center gap-1 rounded border px-2 py-0.5 text-[11px] font-medium ${status.badge}`}>
                  <StatusIcon className="h-3 w-3" />
                  {status.label}
                </span>
                <span className={`rounded border px-2 py-0.5 text-[10px] font-medium ${typeInfo.badge}`}>{typeInfo.label}</span>
              </div>
            </div>

            <div className="mb-1">
              <p className="font-medium text-white truncate">{member.name || "—"}</p>
              <p className="text-xs text-white/40">{member.role || "—"}</p>
            </div>

            {member.email && (
              <div className="mb-3 flex items-center gap-1.5 text-xs text-white/40">
                <Mail className="h-3 w-3" />
                <span className="truncate">{member.email}</span>
              </div>
            )}

            <div className="mb-4">{renderStars(member.rating)}</div>

            <div className="mb-4 flex flex-wrap gap-1.5">
              {member.skills.slice(0, 4).map((skill) => (
                <span key={skill} className="rounded border border-white/[0.08] bg-white/[0.04] px-2 py-0.5 text-[11px] text-white/60">
                  {skill}
                </span>
              ))}
            </div>

            <div className="mt-auto grid grid-cols-2 gap-2 border-t border-white/[0.06] pt-4 text-xs">
              <div>
                <p className="text-white/40">Projets</p>
                <p className="font-medium text-white">{member.projectsDone}</p>
              </div>
              <div>
                <p className="text-white/40">{member.type === "editor" ? "CA mensuel" : "Satisfaction"}</p>
                <p className="font-medium text-white">
                  {member.type === "editor" ? formatCurrency(member.monthlyRevenue) : `${member.satisfaction}%`}
                </p>
              </div>
              <div>
                <p className="text-white/40">{member.type === "editor" ? "Heures/semaine" : "Projets/mois"}</p>
                <p className="font-medium text-white">
                  {member.type === "editor" ? `${member.weeklyHours}h` : `${Math.round(member.projectsDone / 12)}`}
                </p>
              </div>
              <div>
                <p className="text-white/40">Membre depuis</p>
                <p className="font-medium text-white">{formatDate(member.created_at)}</p>
              </div>
            </div>

            <div className="absolute right-3 top-3 opacity-0 transition-opacity group-hover:opacity-100">
              <button className="rounded-lg p-1.5 text-white/30 transition-colors hover:bg-white/[0.08] hover:text-white/60">
                <MoreHorizontal className="h-4 w-4" />
              </button>
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
              <th className="px-4 py-3 font-medium">Membre</th>
              <th className="px-4 py-3 font-medium">Rôle</th>
              <th className="px-4 py-3 font-medium">Type</th>
              <th className="px-4 py-3 font-medium">Statut</th>
              <th className="px-4 py-3 font-medium">Compétences</th>
              <th className="px-4 py-3 font-medium">Projets</th>
              <th className="px-4 py-3 font-medium">{filteredMembers.some((m) => m.type === "editor") ? "CA mensuel" : "Satisfaction"}</th>
              <th className="px-4 py-3 font-medium">Note</th>
              <th className="px-4 py-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredMembers.map((member) => {
              const status = statusConfig[member.status || "active"] || statusConfig.active
              const StatusIcon = status.icon
              const typeInfo = typeConfig[member.type]
              const initials = member.name?.slice(0, 2).toUpperCase() || "?"
              const colorIndex = hashString(member.id) % 5
              const avatarGradients = [
                "from-ewa-orange to-orange-600",
                "from-purple-500 to-indigo-600",
                "from-emerald-500 to-teal-600",
                "from-blue-500 to-cyan-600",
                "from-pink-500 to-rose-600",
              ]

              return (
                <tr key={member.id} className="border-b border-white/[0.04] transition-colors hover:bg-white/[0.02]">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className={`flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br ${avatarGradients[colorIndex]} text-xs font-bold text-white`}>
                        {initials}
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium text-white truncate">{member.name || "—"}</p>
                        {member.email && <p className="text-xs text-white/40 truncate">{member.email}</p>}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-white/60">{member.role || "—"}</td>
                  <td className="px-4 py-3">
                    <span className={`rounded border px-2 py-0.5 text-[10px] font-medium ${typeInfo.badge}`}>{typeInfo.label}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center gap-1 rounded border px-2 py-0.5 text-[11px] font-medium ${status.badge}`}>
                      <StatusIcon className="h-3 w-3" />
                      {status.label}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1">
                      {member.skills.slice(0, 3).map((skill) => (
                        <span key={skill} className="rounded border border-white/[0.08] bg-white/[0.04] px-1.5 py-0.5 text-[11px] text-white/60">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-white/60">{member.projectsDone}</td>
                  <td className="px-4 py-3 font-medium text-white">
                    {member.type === "editor" ? formatCurrency(member.monthlyRevenue) : `${member.satisfaction}%`}
                  </td>
                  <td className="px-4 py-3">{renderStars(member.rating)}</td>
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-white">Équipe</h1>
          <p className="text-sm text-white/40">
            {counts.TOUS} membres · {counts.active + counts.profile} actifs · {counts.editor} monteurs
          </p>
        </div>
        <button className="flex items-center gap-2 rounded-xl bg-ewa-orange px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-ewa-orange/90">
          <Plus className="h-4 w-4" />
          Inviter un membre
        </button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-white/[0.08] bg-[hsl(0_0%_13%)] p-4">
          <div className="mb-2 flex items-center gap-2 text-white/40">
            <UsersRound className="h-4 w-4" />
            <span className="text-xs font-medium">Membres</span>
          </div>
          <p className="text-2xl font-semibold text-white">{counts.TOUS}</p>
        </div>
        <div className="rounded-2xl border border-white/[0.08] bg-[hsl(0_0%_13%)] p-4">
          <div className="mb-2 flex items-center gap-2 text-white/40">
            <Briefcase className="h-4 w-4" />
            <span className="text-xs font-medium">Projets ce mois</span>
          </div>
          <p className="text-2xl font-semibold text-white">
            {enrichedMembers.reduce((acc, m) => acc + Math.round(m.projectsDone / 12), 0)}
          </p>
        </div>
        <div className="rounded-2xl border border-white/[0.08] bg-[hsl(0_0%_13%)] p-4">
          <div className="mb-2 flex items-center gap-2 text-white/40">
            <Award className="h-4 w-4" />
            <span className="text-xs font-medium">Note moyenne</span>
          </div>
          <p className="text-2xl font-semibold text-white">
            {(enrichedMembers.reduce((acc, m) => acc + m.rating, 0) / (enrichedMembers.length || 1)).toFixed(1)}
          </p>
        </div>
        <div className="rounded-2xl border border-white/[0.08] bg-[hsl(0_0%_13%)] p-4">
          <div className="mb-2 flex items-center gap-2 text-white/40">
            <TrendingUp className="h-4 w-4" />
            <span className="text-xs font-medium">CA mensuel total (monteurs)</span>
          </div>
          <p className="text-2xl font-semibold text-white">
            {formatCurrency(enrichedMembers.filter((m) => m.type === "editor").reduce((acc, m) => acc + m.monthlyRevenue, 0))}
          </p>
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
              placeholder="Rechercher un membre..."
              className="w-full rounded-xl border border-white/[0.08] bg-[hsl(0_0%_13%)] py-2.5 pl-10 pr-4 text-sm text-white placeholder:text-white/30 focus:border-ewa-orange/50 focus:outline-none"
            />
          </div>

          <select
            value={typeFilter || ""}
            onChange={(e) => setTypeFilter((e.target.value || null) as "editor" | "profile" | null)}
            className="rounded-xl border border-white/[0.08] bg-[hsl(0_0%_13%)] px-3 py-2.5 text-sm text-white outline-none focus:border-ewa-orange/50"
          >
            <option value="">Tous les types</option>
            <option value="editor">Monteurs ({counts.editor})</option>
            <option value="profile">Staff ({counts.profile})</option>
          </select>

          {activeFiltersCount > 0 && (
            <button
              onClick={() => {
                setStatusFilter(null)
                setTypeFilter(null)
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
                {count}</span>
            </button>
          )
        })}
      </div>

      {filteredMembers.length === 0 ? (
        <div className="rounded-2xl border border-white/[0.08] bg-[hsl(0_0%_13%)] p-12 text-center">
          <UsersRound className="mx-auto mb-3 h-10 w-10 text-white/20" />
          <p className="text-sm text-white/40">Aucun membre ne correspond aux filtres.</p>
        </div>
      ) : view === "grid" ? (
        renderGrid()
      ) : (
        renderList()
      )}
    </div>
  )
}
