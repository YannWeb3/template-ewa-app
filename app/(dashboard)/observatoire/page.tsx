"use client"

import { useEffect, useMemo, useState, useCallback } from "react"
import {
  MessageCircle,
  Mic,
  Phone,
  ArrowLeftRight,
  Search,
  Filter,
  RefreshCw,
  Ban,
  Volume2,
  Calendar,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Clock,
  AlertCircle,
  XCircle,
  User,
  ExternalLink,
  MoreHorizontal,
  StickyNote,
  Flag,
} from "lucide-react"
import { Card } from "@/components/ui/card"

interface ObservatoireMessage {
  id: string
  message_id?: string | null
  created_at: string
  phone: string
  push_name: string
  sender?: string
  direction: "INBOUND" | "OUTBOUND"
  body: string
  content?: string
  media_type: string
  media_url: string
  transcript: string | null
  client_id: string | null
  group_id: string
  group_name?: string
  is_group: boolean
  raw_payload: unknown
  source: string
  status: "pending" | "validated" | "red" | "resolved" | "in_progress"
  priority: "low" | "normal" | "high" | "critical"
  notes: string
}

interface ClientInfo {
  id: string
  name: string
}

const PAGE_SIZE = 50

const STATUS_LABELS: Record<
  string,
  { label: string; color: string; icon: React.ElementType }
> = {
  pending: {
    label: "En attente",
    color: "bg-amber-500/15 text-amber-300",
    icon: Clock,
  },
  validated: {
    label: "Validé",
    color: "bg-emerald-500/15 text-emerald-300",
    icon: CheckCircle2,
  },
  red: {
    label: "À traiter",
    color: "bg-red-500/15 text-red-300",
    icon: AlertCircle,
  },
  in_progress: {
    label: "En cours",
    color: "bg-blue-500/15 text-blue-300",
    icon: Clock,
  },
  resolved: {
    label: "Résolu",
    color: "bg-slate-500/15 text-slate-300",
    icon: CheckCircle2,
  },
}

const PRIORITY_LABELS: Record<
  string,
  { label: string; color: string; icon: React.ElementType }
> = {
  low: {
    label: "Basse",
    color: "bg-slate-500/15 text-slate-300",
    icon: Flag,
  },
  normal: {
    label: "Normal",
    color: "bg-blue-500/15 text-blue-300",
    icon: Flag,
  },
  high: {
    label: "Haute",
    color: "bg-orange-500/15 text-orange-300",
    icon: Flag,
  },
  critical: {
    label: "Critique",
    color: "bg-red-500/15 text-red-300",
    icon: Flag,
  },
}

export default function ObservatoirePage() {
  const [messages, setMessages] = useState<ObservatoireMessage[]>([])
  const [loading, setLoading] = useState(true)
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(0)
  const [search, setSearch] = useState("")
  const [direction, setDirection] = useState("")
  const [statusFilter, setStatusFilter] = useState("")
  const [priorityFilter, setPriorityFilter] = useState("")
  const [onlyTranscripts, setOnlyTranscripts] = useState(false)
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [expanded, setExpanded] = useState<Set<string>>(new Set())
  const [selectedMessage, setSelectedMessage] = useState<ObservatoireMessage | null>(null)
  const [clientMap, setClientMap] = useState<Record<string, ClientInfo>>({})
  const [updating, setUpdating] = useState<Record<string, boolean>>({})

  const queryParams = useMemo(() => {
    const params = new URLSearchParams()
    params.set("limit", String(PAGE_SIZE))
    params.set("offset", String(page * PAGE_SIZE))
    if (search) params.set("search", search)
    if (direction) params.set("direction", direction)
    if (statusFilter) params.set("status", statusFilter)
    if (priorityFilter) params.set("priority", priorityFilter)
    if (onlyTranscripts) params.set("onlyTranscripts", "true")
    if (startDate) params.set("startDate", startDate)
    if (endDate) params.set("endDate", endDate)
    return params.toString()
  }, [page, search, direction, statusFilter, priorityFilter, onlyTranscripts, startDate, endDate])

  const fetchMessages = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/observatoire/messages?${queryParams}`)
      const data = await res.json()
      setMessages(data.messages || [])
      setTotal(data.total || 0)
    } catch (err) {
      console.error(err)
      setMessages([])
      setTotal(0)
    } finally {
      setLoading(false)
    }
  }, [queryParams])

  useEffect(() => {
    fetchMessages()
  }, [fetchMessages])

  useEffect(() => {
    const phones = Array.from(new Set(messages.map((m) => m.phone))).filter(Boolean)
    if (phones.length === 0) return
    fetch(`/api/clients/lookup?phones=${encodeURIComponent(phones.join(","))}`)
      .then((r) => r.json())
      .then((data) => setClientMap(data.clients || {}))
      .catch(console.error)
  }, [messages])

  const stats = useMemo(() => {
    return {
      total,
      pending: messages.filter((m) => m.status === "pending").length,
      red: messages.filter((m) => m.status === "red").length,
      validated: messages.filter((m) => m.status === "validated").length,
      transcripts: messages.filter((m) => m.transcript).length,
    }
  }, [messages, total])

  const handleUpdateStatus = async (
    id: string,
    status: ObservatoireMessage["status"],
    notes?: string
  ) => {
    setUpdating((prev) => ({ ...prev, [id]: true }))
    try {
      const res = await fetch(`/api/observatoire/messages/${id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, notes }),
      })
      if (res.ok) {
        const updated = await res.json()
        setMessages((prev) =>
          prev.map((m) =>
            m.id === id
              ? {
                  ...m,
                  status,
                  notes: notes ?? m.notes,
                }
              : m
          )
        )
        if (selectedMessage?.id === id) {
          setSelectedMessage((prev) =>
            prev ? { ...prev, status, notes: notes ?? prev.notes } : null
          )
        }
      }
    } catch (err) {
      console.error(err)
    } finally {
      setUpdating((prev) => ({ ...prev, [id]: false }))
    }
  }

  const resetFilters = () => {
    setSearch("")
    setDirection("")
    setStatusFilter("")
    setPriorityFilter("")
    setOnlyTranscripts(false)
    setStartDate("")
    setEndDate("")
    setPage(0)
  }

  const totalPages = Math.ceil(total / PAGE_SIZE)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-white">
          Observatoire WhatsApp
        </h1>
        <p className="text-sm text-white/40">
          Messages WhatsApp classés automatiquement depuis n8n.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
        <Card innerClassName="flex flex-col justify-center">
          <div className="mb-2 flex items-center gap-2">
            <MessageCircle className="h-4 w-4 text-blue-400" />
            <span className="text-xs text-white/40">Total</span>
          </div>
          <span className="text-2xl font-bold text-white">
            {total.toLocaleString("fr-FR")}
          </span>
        </Card>
        <Card innerClassName="flex flex-col justify-center">
          <div className="mb-2 flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-red-400" />
            <span className="text-xs text-white/40">À traiter</span>
          </div>
          <span className="text-2xl font-bold text-white">
            {stats.red.toLocaleString("fr-FR")}
          </span>
        </Card>
        <Card innerClassName="flex flex-col justify-center">
          <div className="mb-2 flex items-center gap-2">
            <Clock className="h-4 w-4 text-amber-400" />
            <span className="text-xs text-white/40">En attente</span>
          </div>
          <span className="text-2xl font-bold text-white">
            {stats.pending.toLocaleString("fr-FR")}
          </span>
        </Card>
        <Card innerClassName="flex flex-col justify-center">
          <div className="mb-2 flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
            <span className="text-xs text-white/40">Validés</span>
          </div>
          <span className="text-2xl font-bold text-white">
            {stats.validated.toLocaleString("fr-FR")}
          </span>
        </Card>
        <Card innerClassName="flex flex-col justify-center">
          <div className="mb-2 flex items-center gap-2">
            <Mic className="h-4 w-4 text-purple-400" />
            <span className="text-xs text-white/40">Transcripts</span>
          </div>
          <span className="text-2xl font-bold text-white">
            {stats.transcripts.toLocaleString("fr-FR")}
          </span>
        </Card>
      </div>

      {/* Filters */}
      <Card innerClassName="space-y-3">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
            <input
              type="text"
              placeholder="Rechercher téléphone, nom, message, transcript..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value)
                setPage(0)
              }}
              className="w-full rounded-xl border border-white/[0.08] bg-[hsl(0_0%_9%)] py-2.5 pl-10 pr-4 text-sm text-white placeholder:text-white/30 focus:border-[#FF6B1A]/50 focus:outline-none"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value)
              setPage(0)
            }}
            className="rounded-xl border border-white/[0.08] bg-[hsl(0_0%_9%)] px-3 py-2.5 text-sm text-white focus:border-[#FF6B1A]/50 focus:outline-none"
          >
            <option value="">Tous statuts</option>
            <option value="red">À traiter</option>
            <option value="pending">En attente</option>
            <option value="validated">Validé</option>
            <option value="in_progress">En cours</option>
            <option value="resolved">Résolu</option>
          </select>
          <select
            value={priorityFilter}
            onChange={(e) => {
              setPriorityFilter(e.target.value)
              setPage(0)
            }}
            className="rounded-xl border border-white/[0.08] bg-[hsl(0_0%_9%)] px-3 py-2.5 text-sm text-white focus:border-[#FF6B1A]/50 focus:outline-none"
          >
            <option value="">Toutes priorités</option>
            <option value="critical">Critique</option>
            <option value="high">Haute</option>
            <option value="normal">Normal</option>
            <option value="low">Basse</option>
          </select>
          <select
            value={direction}
            onChange={(e) => {
              setDirection(e.target.value)
              setPage(0)
            }}
            className="rounded-xl border border-white/[0.08] bg-[hsl(0_0%_9%)] px-3 py-2.5 text-sm text-white focus:border-[#FF6B1A]/50 focus:outline-none"
          >
            <option value="">Toutes directions</option>
            <option value="INBOUND">Entrant</option>
            <option value="OUTBOUND">Sortant</option>
          </select>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-white/40" />
            <input
              type="date"
              value={startDate}
              onChange={(e) => {
                setStartDate(e.target.value)
                setPage(0)
              }}
              className="rounded-xl border border-white/[0.08] bg-[hsl(0_0%_9%)] px-3 py-2 text-sm text-white [color-scheme:dark]"
            />
            <span className="text-white/40">→</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => {
                setEndDate(e.target.value)
                setPage(0)
              }}
              className="rounded-xl border border-white/[0.08] bg-[hsl(0_0%_9%)] px-3 py-2 text-sm text-white [color-scheme:dark]"
            />
          </div>
          <label className="flex items-center gap-2 text-sm text-white/60">
            <input
              type="checkbox"
              checked={onlyTranscripts}
              onChange={(e) => {
                setOnlyTranscripts(e.target.checked)
                setPage(0)
              }}
              className="rounded border-white/[0.08] bg-[hsl(0_0%_13%)] text-[#FF6B1A]"
            />
            Transcripts uniquement
          </label>
          <div className="ml-auto flex items-center gap-2">
            <button
              onClick={resetFilters}
              className="flex items-center gap-2 rounded-lg border border-white/[0.08] px-3 py-2 text-xs font-medium text-white/70 transition hover:text-white"
            >
              <Filter className="h-3.5 w-3.5" />
              Réinitialiser
            </button>
            <button
              onClick={() => window.location.reload()}
              className="flex items-center gap-2 rounded-lg border border-white/[0.08] px-3 py-2 text-xs font-medium text-white/70 transition hover:text-white"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              Actualiser
            </button>
          </div>
        </div>
      </Card>

      {/* Results count */}
      <div className="text-xs text-white/40">
        {loading
          ? "Chargement..."
          : `${total} message${total > 1 ? "s" : ""} · page ${
              page + 1
            }/${totalPages || 1}`}
      </div>

      {/* Table */}
      <Card innerClassName="overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/[0.08] text-left text-white/40">
                <th className="p-3 font-medium">Date</th>
                <th className="p-3 font-medium">Contact</th>
                <th className="p-3 font-medium">Client</th>
                <th className="p-3 font-medium">Direction</th>
                <th className="p-3 font-medium">Contenu</th>
                <th className="p-3 font-medium">Type</th>
                <th className="p-3 font-medium">Priorité</th>
                <th className="p-3 font-medium">Statut</th>
                <th className="p-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {messages.map((msg) => (
                <tr
                  key={msg.id}
                  className="border-b border-white/[0.04] transition hover:bg-white/[0.02]"
                >
                  <td className="whitespace-nowrap p-3 text-xs text-white/30">
                    {new Date(msg.created_at).toLocaleString("fr-FR", {
                      day: "2-digit",
                      month: "short",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </td>
                  <td className="p-3">
                    <div className="font-mono text-xs text-white/80">
                      {msg.phone || "—"}
                    </div>
                    {(msg.push_name || msg.sender) && (
                      <div className="text-xs text-white/50">
                        {msg.push_name || msg.sender}
                      </div>
                    )}
                  </td>
                  <td className="p-3">
                    {clientMap[msg.phone] ? (
                      <a
                        href={`/clients/${clientMap[msg.phone].id}`}
                        className="inline-flex items-center gap-1 rounded bg-emerald-500/10 px-2 py-0.5 text-[11px] font-medium text-emerald-400 hover:bg-emerald-500/20"
                      >
                        <User className="h-3 w-3" />
                        {clientMap[msg.phone].name}
                      </a>
                    ) : msg.client_id ? (
                      <span className="inline-flex items-center gap-1 rounded bg-emerald-500/10 px-2 py-0.5 text-[11px] font-medium text-emerald-400">
                        <User className="h-3 w-3" />
                        Client lié
                      </span>
                    ) : (
                      <span className="text-[10px] text-white/30">—</span>
                    )}
                  </td>
                  <td className="p-3">
                    <span
                      className={`rounded px-2 py-0.5 text-[11px] font-medium ${
                        msg.direction === "INBOUND"
                          ? "bg-blue-500/15 text-blue-300"
                          : "bg-green-500/15 text-green-300"
                      }`}
                    >
                      {msg.direction === "INBOUND" ? "Reçu" : "Envoyé"}
                    </span>
                  </td>
                  <td className="p-3">
                    <div className="max-w-md">
                      {msg.transcript ? (
                        <div className="space-y-1">
                          <div className="flex items-center gap-1.5 text-purple-400">
                            <Volume2 className="h-3.5 w-3.5" />
                            <span className="text-[11px] font-medium">
                              Transcript vocal
                            </span>
                          </div>
                          <p
                            className={`text-xs text-white/70 ${
                              expanded.has(msg.id) ? "" : "line-clamp-2"
                            }`}
                          >
                            {msg.transcript}
                          </p>
                          {msg.transcript.length > 100 && (
                            <button
                              onClick={() => {
                                const next = new Set(expanded)
                                if (next.has(msg.id)) next.delete(msg.id)
                                else next.add(msg.id)
                                setExpanded(next)
                              }}
                              className="text-[10px] text-white/40 hover:text-white"
                            >
                              {expanded.has(msg.id) ? "Réduire" : "Voir plus"}
                            </button>
                          )}
                        </div>
                      ) : msg.body || msg.content ? (
                        <p className="text-xs text-white/70">
                          {msg.body || msg.content}
                        </p>
                      ) : (
                        <span className="text-xs text-white/30">—</span>
                      )}
                    </div>
                  </td>
                  <td className="whitespace-nowrap p-3 text-xs text-white/30">
                    {msg.transcript && (
                      <Volume2 className="mb-0.5 mr-1 inline h-3 w-3 text-purple-400" />
                    )}
                    {msg.media_type || "texte"}
                    {msg.is_group && (
                      <span className="ml-1 text-[10px] text-white/40">
                        (groupe)
                      </span>
                    )}
                  </td>
                  <td className="p-3">
                    {(() => {
                      const config =
                        PRIORITY_LABELS[msg.priority] ?? PRIORITY_LABELS.normal
                      const Icon = config.icon
                      return (
                        <span
                          className={`inline-flex items-center gap-1 rounded px-2 py-0.5 text-[11px] font-medium ${config.color}`}
                        >
                          <Icon className="h-3 w-3" />
                          {config.label}
                        </span>
                      )
                    })()}
                  </td>
                  <td className="p-3">
                    {(() => {
                      const config =
                        STATUS_LABELS[msg.status] ?? STATUS_LABELS.pending
                      const Icon = config.icon
                      return (
                        <span
                          className={`inline-flex items-center gap-1 rounded px-2 py-0.5 text-[11px] font-medium ${config.color}`}
                        >
                          <Icon className="h-3 w-3" />
                          {config.label}
                        </span>
                      )
                    })()}
                  </td>
                  <td className="p-3">
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => setSelectedMessage(msg)}
                        className="rounded-lg p-1.5 text-white/40 transition-colors hover:bg-white/[0.08] hover:text-white"
                        title="Voir le détail"
                      >
                        <MoreHorizontal className="h-4 w-4" />
                      </button>
                      {msg.status !== "in_progress" && (
                        <button
                          onClick={() =>
                            handleUpdateStatus(msg.id, "in_progress")
                          }
                          disabled={updating[msg.id]}
                          className="rounded-lg p-1.5 text-white/40 transition-colors hover:bg-amber-500/10 hover:text-amber-400 disabled:opacity-30"
                          title="Marquer en cours"
                        >
                          <Clock className="h-4 w-4" />
                        </button>
                      )}
                      {msg.status !== "resolved" && (
                        <button
                          onClick={() => handleUpdateStatus(msg.id, "resolved")}
                          disabled={updating[msg.id]}
                          className="rounded-lg p-1.5 text-white/40 transition-colors hover:bg-emerald-500/10 hover:text-emerald-400 disabled:opacity-30"
                          title="Marquer comme résolu"
                        >
                          <CheckCircle2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {loading && (
            <p className="py-12 text-center text-sm text-white/30">
              Chargement...
            </p>
          )}
          {!loading && messages.length === 0 && (
            <p className="py-12 text-center text-sm text-white/30">
              Aucun message trouvé.
            </p>
          )}
        </div>
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <button
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            disabled={page === 0}
            className="flex items-center gap-2 rounded-lg border border-white/[0.08] px-3 py-2 text-xs font-medium text-white/70 transition hover:text-white disabled:opacity-30"
          >
            <ChevronLeft className="h-3.5 w-3.5" />
            Précédent
          </button>
          <span className="text-xs text-white/40">
            Page {page + 1} / {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
            disabled={page >= totalPages - 1}
            className="flex items-center gap-2 rounded-lg border border-white/[0.08] px-3 py-2 text-xs font-medium text-white/70 transition hover:text-white disabled:opacity-30"
          >
            Suivant
            <ChevronRight className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      {selectedMessage && (
        <MessageDetailDrawer
          message={selectedMessage}
          client={clientMap[selectedMessage.phone]}
          onClose={() => setSelectedMessage(null)}
          onUpdateStatus={handleUpdateStatus}
          updating={updating[selectedMessage.id]}
        />
      )}
    </div>
  )
}

function MessageDetailDrawer({
  message,
  client,
  onClose,
  onUpdateStatus,
  updating,
}: {
  message: ObservatoireMessage
  client?: ClientInfo
  onClose: () => void
  onUpdateStatus: (
    id: string,
    status: ObservatoireMessage["status"],
    notes?: string
  ) => void
  updating: boolean
}) {
  const [notes, setNotes] = useState(message.notes)

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div className="relative z-10 flex h-full w-full max-w-lg flex-col border-l border-white/[0.08] bg-[hsl(0_0%_10%)] p-6 shadow-2xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-white">
            Détail du message
          </h2>
          <button
            onClick={onClose}
            className="rounded p-1 text-white/40 hover:bg-white/[0.08] hover:text-white"
          >
            <XCircle className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-4 overflow-y-auto pr-2">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-white/40">Contact</p>
              <p className="font-mono text-sm text-white">
                {message.phone || "—"}
              </p>
              {(message.push_name || message.sender) && (
                <p className="text-sm text-white/60">
                  {message.push_name || message.sender}
                </p>
              )}
            </div>
            <span
              className={`rounded px-2 py-0.5 text-[11px] font-medium ${
                message.direction === "INBOUND"
                  ? "bg-blue-500/15 text-blue-300"
                  : "bg-green-500/15 text-green-300"
              }`}
            >
              {message.direction === "INBOUND" ? "Reçu" : "Envoyé"}
            </span>
          </div>

          {client && (
            <div>
              <p className="text-sm text-white/40">Client lié</p>
              <a
                href={`/clients/${client.id}`}
                className="inline-flex items-center gap-1 text-sm font-medium text-emerald-400 hover:underline"
              >
                <User className="h-3.5 w-3.5" />
                {client.name}
              </a>
            </div>
          )}

          <div>
            <p className="text-sm text-white/40">Date</p>
            <p className="text-sm text-white">
              {new Date(message.created_at).toLocaleString("fr-FR", {
                day: "2-digit",
                month: "long",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
          </div>

          {message.is_group && (
            <div>
              <p className="text-sm text-white/40">Groupe</p>
              <p className="text-sm text-white">
                {message.group_name || message.group_id || "Groupe WhatsApp"}
              </p>
            </div>
          )}

          <div className="flex gap-4">
            <div>
              <p className="text-sm text-white/40">Statut</p>
              <div className="mt-1 flex items-center gap-2">
                {(() => {
                  const config =
                    STATUS_LABELS[message.status] ?? STATUS_LABELS.pending
                  const Icon = config.icon
                  return (
                    <span
                      className={`inline-flex items-center gap-1 rounded px-2 py-0.5 text-[11px] font-medium ${config.color}`}
                    >
                      <Icon className="h-3 w-3" />
                      {config.label}
                    </span>
                  )
                })()}
              </div>
            </div>
            <div>
              <p className="text-sm text-white/40">Priorité</p>
              <div className="mt-1 flex items-center gap-2">
                {(() => {
                  const config =
                    PRIORITY_LABELS[message.priority] ?? PRIORITY_LABELS.normal
                  const Icon = config.icon
                  return (
                    <span
                      className={`inline-flex items-center gap-1 rounded px-2 py-0.5 text-[11px] font-medium ${config.color}`}
                    >
                      <Icon className="h-3 w-3" />
                      {config.label}
                    </span>
                  )
                })()}
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {message.status !== "pending" && (
              <button
                onClick={() => onUpdateStatus(message.id, "pending")}
                disabled={updating}
                className="rounded-lg border border-white/[0.08] px-3 py-1.5 text-xs font-medium text-amber-400 transition hover:bg-amber-500/10 disabled:opacity-30"
              >
                En attente
              </button>
            )}
            {message.status !== "in_progress" && (
              <button
                onClick={() => onUpdateStatus(message.id, "in_progress")}
                disabled={updating}
                className="rounded-lg border border-white/[0.08] px-3 py-1.5 text-xs font-medium text-blue-400 transition hover:bg-blue-500/10 disabled:opacity-30"
              >
                En cours
              </button>
            )}
            {message.status !== "resolved" && (
              <button
                onClick={() => onUpdateStatus(message.id, "resolved")}
                disabled={updating}
                className="rounded-lg border border-white/[0.08] px-3 py-1.5 text-xs font-medium text-emerald-400 transition hover:bg-emerald-500/10 disabled:opacity-30"
              >
                Résolu
              </button>
            )}
            {message.status !== "validated" && (
              <button
                onClick={() => onUpdateStatus(message.id, "validated")}
                disabled={updating}
                className="rounded-lg border border-white/[0.08] px-3 py-1.5 text-xs font-medium text-white/70 transition hover:bg-white/[0.04] disabled:opacity-30"
              >
                Validé
              </button>
            )}
            {message.status !== "red" && (
              <button
                onClick={() => onUpdateStatus(message.id, "red")}
                disabled={updating}
                className="rounded-lg border border-white/[0.08] px-3 py-1.5 text-xs font-medium text-red-400 transition hover:bg-red-500/10 disabled:opacity-30"
              >
                À traiter
              </button>
            )}
          </div>

          <div>
            <p className="mb-1 flex items-center gap-1 text-sm text-white/40">
              <StickyNote className="h-3.5 w-3.5" />
              Notes
            </p>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="min-h-[80px] w-full rounded-xl border border-white/[0.08] bg-[hsl(0_0%_9%)] px-3 py-2 text-sm text-white placeholder:text-white/30 focus:border-[#FF6B1A]/50 focus:outline-none"
              placeholder="Ajouter une note..."
            />
            <button
              onClick={() =>
                onUpdateStatus(message.id, message.status, notes)
              }
              disabled={updating}
              className="mt-2 rounded-lg bg-[#FF6B1A] px-3 py-1.5 text-xs font-medium text-white transition hover:bg-[#FF6B1A]/90 disabled:opacity-30"
            >
              Enregistrer la note
            </button>
          </div>

          <div className="rounded-xl border border-white/[0.08] bg-[hsl(0_0%_9%)] p-4">
            <p className="mb-2 text-sm text-white/40">Contenu</p>
            {message.transcript ? (
              <div className="space-y-2">
                <div className="flex items-center gap-1.5 text-purple-400">
                  <Volume2 className="h-4 w-4" />
                  <span className="text-xs font-medium">Transcript vocal</span>
                </div>
                <p className="text-sm leading-relaxed text-white/80">
                  {message.transcript}
                </p>
              </div>
            ) : message.body || message.content ? (
              <p className="text-sm leading-relaxed text-white/80">
                {message.body || message.content}
              </p>
            ) : (
              <span className="text-sm text-white/30">—</span>
            )}
          </div>

          {message.media_url && (
            <div>
              <p className="text-sm text-white/40">
                Média ({message.media_type || "fichier"})
              </p>
              <a
                href={message.media_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-sm text-[#FF6B1A] hover:underline"
              >
                <ExternalLink className="h-3.5 w-3.5" />
                Ouvrir le média
              </a>
            </div>
          )}

          {message.raw_payload ? (
            <details className="rounded-xl border border-white/[0.08] bg-[hsl(0_0%_9%)] p-3">
              <summary className="cursor-pointer text-xs font-medium text-white/60">
                Payload brut
              </summary>
              <pre className="mt-2 max-h-[300px] overflow-auto text-xs text-white/40">
                {JSON.stringify(message.raw_payload, null, 2)}
              </pre>
            </details>
          ) : null}
        </div>
      </div>
    </div>
  )
}
