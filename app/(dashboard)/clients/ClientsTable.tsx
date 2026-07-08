"use client"

import { useState, useMemo } from "react"
import { Plus, Search, Link2, UserCheck, MoreHorizontal, Building2, SlidersHorizontal, X } from "lucide-react"

interface Client {
  id: string
  name: string | null
  company: string | null
  email: string | null
  phone: string | null
  status: string | null
  source: string | null
  created_at: string
  whatsapp_phone: string | null
  whatsapp_phone_canonical: string | null
  phone_canonical: string | null
  portal_token: string | null
  onboarding_done: boolean
  onboarding_step: number | null
  onboarding_completed_at: string | null
  drive_url: string | null
  da_url: string | null
  instagram_url: string | null
  frameio_url: string | null
  notes: string | null
  address: string | null
  tva_number: string | null
  country: string | null
}

interface ClientsTableProps {
  clients: Client[]
  lastMessages: Record<string, string>
}

const statusConfig: Record<string, { label: string; badge: string }> = {
  PROSPECT: { label: "Prospect", badge: "bg-amber-400/10 text-amber-400 border-amber-400/20" },
  ACTIF: { label: "Actif", badge: "bg-emerald-400/10 text-emerald-400 border-emerald-400/20" },
  INACTIF: { label: "Inactif", badge: "bg-white/10 text-white/60 border-white/20" },
  PERDU: { label: "Perdu", badge: "bg-red-400/10 text-red-400 border-red-400/20" },
}

const sourceConfig: Record<string, string> = {
  WhatsApp: "text-green-400",
  Instagram: "text-pink-400",
  Formulaire: "text-blue-400",
  Appel: "text-purple-400",
  Email: "text-yellow-400",
  Referral: "text-ewa-orange",
}

function formatRelativeDate(dateStr?: string | null) {
  if (!dateStr) return "—"
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

function computeCompleteness(client: Client) {
  const fields = [
    client.name,
    client.company,
    client.email,
    client.phone || client.whatsapp_phone,
    client.drive_url,
    client.da_url,
    client.instagram_url,
    client.frameio_url,
    client.address,
    client.tva_number,
    client.notes,
  ]
  const filled = fields.filter(Boolean).length
  return Math.round((filled / fields.length) * 100)
}

function computeRevenueMock(client: Client) {
  const hash = client.id.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0)
  if (client.status === "ACTIF") return 12000 + (hash % 8000)
  if (client.status === "PROSPECT") return 0
  return hash % 3000
}

function getCompletenessBucket(completeness: number) {
  if (completeness >= 80) return "Complete"
  if (completeness >= 50) return "Moyenne"
  return "Faible"
}

export default function ClientsTable({ clients, lastMessages }: ClientsTableProps) {
  const [statusFilter, setStatusFilter] = useState("TOUS")
  const [search, setSearch] = useState("")
  const [sourceFilter, setSourceFilter] = useState<string | null>(null)
  const [completenessFilter, setCompletenessFilter] = useState<string | null>(null)
  const [countryFilter, setCountryFilter] = useState<string | null>(null)

  const uniqueSources = useMemo(() => {
    const sources = new Set<string>()
    for (const c of clients) sources.add(c.source || "Autre")
    return Array.from(sources).sort()
  }, [clients])

  const uniqueCountries = useMemo(() => {
    const countries = new Set<string>()
    for (const c of clients) countries.add(c.country || "Inconnu")
    return Array.from(countries).sort()
  }, [clients])

  const filteredClients = useMemo(() => {
    return clients.filter((c) => {
      const matchesStatus =
        statusFilter === "TOUS" ||
        (statusFilter === "PROSPECT" && c.status === "PROSPECT") ||
        (statusFilter === "ACTIF" && c.status === "ACTIF") ||
        (statusFilter === "INACTIF" && c.status === "INACTIF") ||
        (statusFilter === "PERDU" && c.status === "PERDU")

      const matchesSource = !sourceFilter || (c.source || "Autre") === sourceFilter

      const completeness = computeCompleteness(c)
      const bucket = getCompletenessBucket(completeness)
      const matchesCompleteness = !completenessFilter || bucket === completenessFilter

      const matchesCountry = !countryFilter || (c.country || "Inconnu") === countryFilter

      const term = search.toLowerCase()
      const matchesSearch =
        !term ||
        (c.name?.toLowerCase().includes(term) ?? false) ||
        (c.company?.toLowerCase().includes(term) ?? false) ||
        (c.email?.toLowerCase().includes(term) ?? false) ||
        (c.whatsapp_phone?.toLowerCase().includes(term) ?? false) ||
        (c.phone?.toLowerCase().includes(term) ?? false)

      return matchesStatus && matchesSource && matchesCompleteness && matchesCountry && matchesSearch
    })
  }, [clients, statusFilter, sourceFilter, completenessFilter, countryFilter, search])

  const counts = useMemo(() => {
    return {
      TOUS: clients.length,
      PROSPECT: clients.filter((c) => c.status === "PROSPECT").length,
      ACTIF: clients.filter((c) => c.status === "ACTIF").length,
      INACTIF: clients.filter((c) => c.status === "INACTIF").length,
      PERDU: clients.filter((c) => c.status === "PERDU").length,
    }
  }, [clients])

  const statusFilters = [
    { id: "TOUS", label: "Tous" },
    { id: "PROSPECT", label: "Prospects" },
    { id: "ACTIF", label: "Actifs" },
    { id: "INACTIF", label: "Inactifs" },
    { id: "PERDU", label: "Perdus" },
  ]

  const activeFiltersCount = [sourceFilter, completenessFilter, countryFilter].filter(Boolean).length

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-white">Clients</h1>
          <p className="text-sm text-white/40">{counts.TOUS} contacts · {counts.ACTIF} actifs · {counts.PROSPECT} prospects</p>
        </div>
        <button className="flex items-center gap-2 rounded-xl bg-ewa-orange px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-ewa-orange/90">
          <Plus className="h-4 w-4" />
          Nouveau client
        </button>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1 sm:max-w-xs">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/30" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher un client..."
            className="w-full rounded-xl border border-white/[0.08] bg-[hsl(0_0%_13%)] py-2.5 pl-10 pr-4 text-sm text-white placeholder:text-white/30 focus:border-ewa-orange/50 focus:outline-none"
          />
        </div>

        <div className="flex flex-1 flex-wrap items-center gap-2">
          <select
            value={sourceFilter || ""}
            onChange={(e) => setSourceFilter(e.target.value || null)}
            className="rounded-xl border border-white/[0.08] bg-[hsl(0_0%_13%)] px-3 py-2.5 text-sm text-white outline-none focus:border-ewa-orange/50"
          >
            <option value="">Toutes les sources</option>
            {uniqueSources.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>

          <select
            value={completenessFilter || ""}
            onChange={(e) => setCompletenessFilter(e.target.value || null)}
            className="rounded-xl border border-white/[0.08] bg-[hsl(0_0%_13%)] px-3 py-2.5 text-sm text-white outline-none focus:border-ewa-orange/50"
          >
            <option value="">Toutes les complétudes</option>
            <option value="Complete">Complète (≥80%)</option>
            <option value="Moyenne">Moyenne (50-79%)</option>
            <option value="Faible">Faible (&lt;50%)</option>
          </select>

          <select
            value={countryFilter || ""}
            onChange={(e) => setCountryFilter(e.target.value || null)}
            className="rounded-xl border border-white/[0.08] bg-[hsl(0_0%_13%)] px-3 py-2.5 text-sm text-white outline-none focus:border-ewa-orange/50"
          >
            <option value="">Tous les pays</option>
            {uniqueCountries.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>

          {activeFiltersCount > 0 && (
            <button
              onClick={() => {
                setSourceFilter(null)
                setCompletenessFilter(null)
                setCountryFilter(null)
                setSearch("")
              }}
              className="flex items-center gap-1.5 rounded-xl border border-white/[0.08] bg-white/[0.04] px-3 py-2.5 text-sm font-medium text-white/70 transition-colors hover:bg-white/[0.08] hover:text-white"
            >
              <X className="h-3.5 w-3.5" />
              Réinitialiser
            </button>
          )}
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {statusFilters.map((f) => {
          const active = statusFilter === f.id
          return (
            <button
              key={f.id}
              onClick={() => setStatusFilter(f.id)}
              className={`flex items-center gap-2 rounded-xl border px-3 py-2 text-sm font-medium transition-colors ${
                active
                  ? "border-ewa-orange bg-ewa-orange/10 text-ewa-orange"
                  : "border-white/[0.08] bg-[hsl(0_0%_13%)] text-white/60 hover:bg-white/[0.06] hover:text-white"
              }`}
            >
              {f.label}
              <span className={`rounded px-1.5 py-0.5 text-xs ${active ? "bg-ewa-orange/20 text-ewa-orange" : "bg-white/[0.08] text-white/40"}`}>
                {counts[f.id as keyof typeof counts]}
              </span>
            </button>
          )
        })}
      </div>

      <div className="overflow-hidden rounded-2xl border border-white/[0.08] bg-[hsl(0_0%_13%)]">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/[0.08] text-left text-white/40">
                <th className="px-4 py-3 font-medium">Client</th>
                <th className="px-4 py-3 font-medium">Statut</th>
                <th className="px-4 py-3 font-medium">Source</th>
                <th className="px-4 py-3 font-medium">Projets</th>
                <th className="px-4 py-3 font-medium">Complétude</th>
                <th className="px-4 py-3 font-medium">Dernier contact</th>
                <th className="px-4 py-3 font-medium">CA généré</th>
                <th className="px-4 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredClients.map((client) => {
                const status = client.status || "PROSPECT"
                const statusInfo = statusConfig[status] || { label: status, badge: "bg-white/10 text-white/60 border-white/20" }
                const completeness = computeCompleteness(client)
                const canonical = client.whatsapp_phone_canonical || client.phone_canonical || client.whatsapp_phone || client.phone || ""
                const lastContact = formatRelativeDate(lastMessages[canonical] || null)
                const revenue = computeRevenueMock(client)

                return (
                  <tr key={client.id} className="border-b border-white/[0.04] transition-colors hover:bg-white/[0.02]">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-ewa-orange/10">
                          <Building2 className="h-4 w-4 text-ewa-orange" />
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium text-white truncate">{client.name || client.company || "—"}</p>
                          <p className="text-xs text-white/40 truncate">{client.company || client.email || client.phone || "—"}</p>
                        </div>
                      </div>
                    </td>

                    <td className="px-4 py-3">
                      <span className={`inline-flex rounded border px-2 py-0.5 text-[11px] font-medium ${statusInfo.badge}`}>
                        {statusInfo.label}
                      </span>
                    </td>

                    <td className="px-4 py-3">
                      <span className={`text-xs font-medium ${sourceConfig[client.source || "Autre"] || "text-white/50"}`}>
                        {client.source || "Autre"}
                      </span>
                    </td>

                    <td className="px-4 py-3">
                      <span className="text-white">0</span>
                    </td>

                    <td className="px-4 py-3">
                      <div className="w-24">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-white/60">{completeness}%</span>
                        </div>
                        <div className="mt-1 h-1.5 w-full rounded-full bg-white/[0.08]">
                          <div
                            className={`h-1.5 rounded-full ${completeness >= 80 ? "bg-emerald-400" : completeness >= 50 ? "bg-ewa-orange" : "bg-red-400"}`}
                            style={{ width: `${completeness}%` }}
                          />
                        </div>
                      </div>
                    </td>

                    <td className="px-4 py-3">
                      <span className="text-xs text-white/60">{lastContact}</span>
                    </td>

                    <td className="px-4 py-3">
                      <span className="font-medium text-white">{revenue.toLocaleString("fr-FR")} €</span>
                    </td>

                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        {client.portal_token ? (
                          <a
                            href={`/onboarding/${client.portal_token}`}
                            target="_blank"
                            rel="noreferrer"
                            className="flex items-center gap-1 rounded-lg border border-white/[0.08] bg-white/[0.04] px-2.5 py-1 text-[11px] font-medium text-white/70 transition-colors hover:bg-white/[0.08] hover:text-white"
                            title="Ouvrir le lien onboarding"
                          >
                            <Link2 className="h-3 w-3" />
                            Onboarding
                          </a>
                        ) : (
                          <button
                            className="flex items-center gap-1 rounded-lg border border-white/[0.08] bg-white/[0.04] px-2.5 py-1 text-[11px] font-medium text-white/40 transition-colors hover:bg-white/[0.08] hover:text-white"
                            title="Créer le lien onboarding"
                          >
                            <UserCheck className="h-3 w-3" />
                            Onboarding
                          </button>
                        )}
                        <button className="rounded-lg p-1.5 text-white/30 transition-colors hover:bg-white/[0.08] hover:text-white/60">
                          <MoreHorizontal className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}

              {filteredClients.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-4 py-12 text-center text-sm text-white/30">
                    Aucun client trouvé.
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
