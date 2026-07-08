"use client"

import { useState, useMemo } from "react"
import { Users, Plus, Search, Mail, Phone, Building2, MoreHorizontal, UserCheck, Link2 } from "lucide-react"

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
  portal_token: string | null
}

interface ClientsPageProps {
  clients: Client[]
}

const statusConfig: Record<string, { label: string; color: string }> = {
  PROSPECT: { label: "Prospect", color: "text-amber-400" },
  ACTIF: { label: "Actif", color: "text-emerald-400" },
  INACTIF: { label: "Inactif", color: "text-white/40" },
  PERDU: { label: "Perdu", color: "text-red-400" },
}

export default function ClientsPage({ clients }: ClientsPageProps) {
  const [filter, setFilter] = useState("TOUS")
  const [search, setSearch] = useState("")

  const filteredClients = useMemo(() => {
    return clients.filter((c) => {
      const matchesFilter =
        filter === "TOUS" ||
        (filter === "PROSPECT" && c.status === "PROSPECT") ||
        (filter === "ACTIF" && c.status === "ACTIF") ||
        (filter === "INACTIF" && c.status === "INACTIF") ||
        (filter === "PERDU" && c.status === "PERDU")

      const term = search.toLowerCase()
      const matchesSearch =
        !term ||
        (c.name?.toLowerCase().includes(term) ?? false) ||
        (c.company?.toLowerCase().includes(term) ?? false) ||
        (c.email?.toLowerCase().includes(term) ?? false) ||
        (c.whatsapp_phone?.toLowerCase().includes(term) ?? false)

      return matchesFilter && matchesSearch
    })
  }, [clients, filter, search])

  const counts = useMemo(() => {
    return {
      TOUS: clients.length,
      PROSPECT: clients.filter((c) => c.status === "PROSPECT").length,
      ACTIF: clients.filter((c) => c.status === "ACTIF").length,
      INACTIF: clients.filter((c) => c.status === "INACTIF").length,
      PERDU: clients.filter((c) => c.status === "PERDU").length,
    }
  }, [clients])

  const filters = [
    { id: "TOUS", label: "Tous" },
    { id: "PROSPECT", label: "Prospects" },
    { id: "ACTIF", label: "Actifs" },
    { id: "INACTIF", label: "Inactifs" },
    { id: "PERDU", label: "Perdus" },
  ]

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

      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/30" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Rechercher un client..."
          className="w-full rounded-xl border border-white/[0.08] bg-[hsl(0_0%_13%)] py-2.5 pl-10 pr-4 text-sm text-white placeholder:text-white/30 focus:border-ewa-orange/50 focus:outline-none"
        />
      </div>

      <div className="flex flex-wrap gap-2">
        {filters.map((f) => {
          const active = filter === f.id
          return (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
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

      <div className="space-y-3">
        {filteredClients.map((client) => {
          const status = client.status || "PROSPECT"
          const statusInfo = statusConfig[status] || { label: status, color: "text-white/40" }

          return (
            <div
              key={client.id}
              className="group flex items-center justify-between rounded-2xl border border-white/[0.08] bg-[hsl(0_0%_13%)] p-4 transition-all duration-300 hover:-translate-y-0.5 hover:border-white/[0.15] hover:shadow-[0_8px_30px_rgba(255,107,26,0.06)]"
            >
              <div className="flex items-center gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-ewa-orange/10">
                  <Building2 className="h-5 w-5 text-ewa-orange" />
                </div>
                <div>
                  <p className="text-sm font-medium text-white">{client.name || client.company || "—"}</p>
                  <p className="text-xs text-white/40">
                    {client.company ? client.company : client.source ? `Source : ${client.source}` : "Pas de société"}
                  </p>
                </div>
              </div>

              <div className="hidden items-center gap-6 md:flex">
                {client.email && (
                  <div className="flex items-center gap-2 text-xs text-white/40">
                    <Mail className="h-3.5 w-3.5" />
                    {client.email}
                  </div>
                )}
                {(client.phone || client.whatsapp_phone) && (
                  <div className="flex items-center gap-2 text-xs text-white/40">
                    <Phone className="h-3.5 w-3.5" />
                    {client.phone || client.whatsapp_phone}
                  </div>
                )}

                <div className="text-right">
                  <p className="text-sm font-medium text-white">0 projets</p>
                  <p className={`text-xs font-medium ${statusInfo.color}`}>{statusInfo.label}</p>
                </div>

                {client.portal_token && (
                  <a
                    href={`/onboarding/${client.portal_token}`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1.5 rounded-lg border border-white/[0.08] bg-white/[0.04] px-3 py-1.5 text-xs font-medium text-white/70 transition-colors hover:bg-white/[0.08] hover:text-white"
                    title="Ouvrir le lien onboarding"
                  >
                    <Link2 className="h-3.5 w-3.5" />
                    Onboarding
                  </a>
                )}

                {!client.portal_token && (
                  <button
                    className="flex items-center gap-1.5 rounded-lg border border-white/[0.08] bg-white/[0.04] px-3 py-1.5 text-xs font-medium text-white/40 transition-colors hover:bg-white/[0.08] hover:text-white"
                    title="Créer le lien onboarding"
                  >
                    <UserCheck className="h-3.5 w-3.5" />
                    Onboarding
                  </button>
                )}
              </div>

              <button className="rounded-lg p-2 text-white/30 transition-colors hover:bg-white/[0.08] hover:text-white/60">
                <MoreHorizontal className="h-4 w-4" />
              </button>
            </div>
          )
        })}

        {filteredClients.length === 0 && (
          <p className="py-12 text-center text-sm text-white/30">Aucun client trouvé.</p>
        )}
      </div>
    </div>
  )
}
