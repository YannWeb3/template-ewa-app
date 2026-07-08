"use client"

import { useState, useEffect, useMemo, useCallback } from "react"
import {
  Search,
  Camera,
  TrendingUp,
  Filter,
  Bookmark,
  ExternalLink,
  Users,
  Clock,
  Hash,
  RefreshCw,
  Trash2,
  Sparkles,
  Loader2,
  AlertCircle,
  BarChart3,
  CheckCircle2,
  X,
  Star,
  Target,
  Lightbulb,
  Shield,
  Layers,
  Plus,
  Globe,
} from "lucide-react"

type Category = "tous" | "concurrent" | "inspiration" | "prospect" | "client"

interface IgAudit {
  id: string
  status: string
  score_profile: number | null
  score_content: number | null
  score_engagement: number | null
  score_conversion: number | null
  score_overall: number | null
  swot: Record<string, unknown>
  recommendations: Record<string, unknown>
  best_practices: Record<string, unknown>
  benchmark: Record<string, unknown>
  raw_report: string | null
  model_used: string | null
  generated_at: string | null
}

interface IgAccount {
  id: string
  handle: string
  display_name: string | null
  category: string
  followers: number | null
  following: number | null
  posts_count: number | null
  bio: string | null
  external_url: string | null
  tags: string[]
  notes: string | null
  saved: boolean
  profile_pic_url: string | null
  created_at: string
  audits?: IgAudit[]
  posts?: Array<{
    id: string
    type: string | null
    caption: string | null
    likes_count: number | null
    comments_count: number | null
    views_count: number | null
    display_url: string | null
    timestamp: string | null
  }>
}

interface IgStats {
  total: number
  byCategory: Record<string, number>
  saved: number
  totalFollowers: number
  audited: number
}

const categoryConfig: Record<string, { label: string; badge: string }> = {
  concurrent: { label: "Concurrent", badge: "bg-red-400/10 text-red-400 border-red-400/20" },
  inspiration: { label: "Inspiration", badge: "bg-purple-400/10 text-purple-400 border-purple-400/20" },
  prospect: { label: "Prospect", badge: "bg-amber-400/10 text-amber-400 border-amber-400/20" },
  client: { label: "Client", badge: "bg-emerald-400/10 text-emerald-400 border-emerald-400/20" },
}

function formatNumber(n: number): string {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1).replace(/\.0$/, "") + "M"
  if (n >= 1_000) return (n / 1_000).toFixed(1).replace(/\.0$/, "") + "k"
  return n.toString()
}

function formatRelativeDate(dateStr: string | null) {
  if (!dateStr) return ""
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

function AuditDrawer({
  audit,
  account,
  onClose,
}: {
  audit: IgAudit
  account: IgAccount
  onClose: () => void
}) {
  const strengths = (audit.swot?.strengths as string[]) ?? []
  const weaknesses = (audit.swot?.weaknesses as string[]) ?? []
  const recs = audit.recommendations as Record<string, string[]>
  const allRecs = Object.values(recs).flat()

  const scoreColor = (score: number | null) => {
    if (!score) return "text-white/30"
    if (score >= 80) return "text-emerald-400"
    if (score >= 60) return "text-amber-400"
    return "text-red-400"
  }

  const scoreBg = (score: number | null) => {
    if (!score) return "bg-white/[0.04]"
    if (score >= 80) return "bg-emerald-400/10"
    if (score >= 60) return "bg-amber-400/10"
    return "bg-red-400/10"
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-end">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div className="relative h-full w-full max-w-lg overflow-y-auto border-l border-white/[0.08] bg-[hsl(0_0%_10%)] shadow-2xl">
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-white/[0.08] bg-[hsl(0_0%_10%)] px-6 py-4">
          <div>
            <h2 className="text-base font-semibold text-white">Audit @{account.handle}</h2>
            <p className="text-xs text-white/40">
              {audit.generated_at
                ? new Date(audit.generated_at).toLocaleDateString("fr-FR", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })
                : "Date inconnue"}
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-white/40 transition-colors hover:bg-white/[0.04] hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-6 p-6">
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: "Global", value: audit.score_overall, icon: Star },
              { label: "Profil", value: audit.score_profile, icon: Shield },
              { label: "Contenu", value: audit.score_content, icon: Layers },
              { label: "Engagement", value: audit.score_engagement, icon: TrendingUp },
              { label: "Conversion", value: audit.score_conversion, icon: Target },
            ].map((s) => (
              <div
                key={s.label}
                className={`rounded-xl ${scoreBg(s.value)} p-3 text-center`}
              >
                <s.icon className={`mx-auto mb-1 h-4 w-4 ${scoreColor(s.value)}`} />
                <p className={`text-lg font-bold ${scoreColor(s.value)}`}>
                  {s.value ?? "N/A"}
                </p>
                <p className="text-[10px] text-white/40">{s.label}</p>
              </div>
            ))}
          </div>

          {strengths.length > 0 && (
            <div>
              <h3 className="mb-3 flex items-center gap-2 text-sm font-medium text-emerald-400">
                <CheckCircle2 className="h-4 w-4" />
                Forces
              </h3>
              <ul className="space-y-2">
                {strengths.map((s, i) => (
                  <li
                    key={i}
                    className="rounded-xl border border-emerald-400/10 bg-emerald-400/[0.04] px-3 py-2 text-xs text-white/70"
                  >
                    {s}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {weaknesses.length > 0 && (
            <div>
              <h3 className="mb-3 flex items-center gap-2 text-sm font-medium text-red-400">
                <AlertCircle className="h-4 w-4" />
                Faiblesses
              </h3>
              <ul className="space-y-2">
                {weaknesses.map((w, i) => (
                  <li
                    key={i}
                    className="rounded-xl border border-red-400/10 bg-red-400/[0.04] px-3 py-2 text-xs text-white/70"
                  >
                    {w}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {allRecs.length > 0 && (
            <div>
              <h3 className="mb-3 flex items-center gap-2 text-sm font-medium text-amber-400">
                <Lightbulb className="h-4 w-4" />
                Recommandations
              </h3>
              <ul className="space-y-2">
                {allRecs.map((r, i) => (
                  <li
                    key={i}
                    className="rounded-xl border border-amber-400/10 bg-amber-400/[0.04] px-3 py-2 text-xs text-white/70"
                  >
                    {r}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {audit.raw_report && (
            <div>
              <h3 className="mb-2 text-sm font-medium text-white/60">Rapport brut</h3>
              <p className="rounded-xl bg-white/[0.03] px-3 py-2 text-xs text-white/40 leading-relaxed">
                {audit.raw_report}
              </p>
            </div>
          )}

          {audit.model_used && (
            <p className="text-[10px] text-white/20">
              Modèle : {audit.model_used}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}

export default function RechercheIGPage() {
  const [accounts, setAccounts] = useState<IgAccount[]>([])
  const [stats, setStats] = useState<IgStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState("")
  const [category, setCategory] = useState<Category>("tous")
  const [onlySaved, setOnlySaved] = useState(false)
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [auditingId, setAuditingId] = useState<string | null>(null)
  const [auditResult, setAuditResult] = useState<string | null>(null)
  const [selectedAudit, setSelectedAudit] = useState<{ audit: IgAudit; account: IgAccount } | null>(null)
  const [newHandle, setNewHandle] = useState("")
  const [pipelineLoading, setPipelineLoading] = useState(false)

  const fetchAccounts = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const params = new URLSearchParams()
      params.set("stats", "true")
      if (category !== "tous") params.set("category", category)
      if (search) params.set("search", search)
      if (onlySaved) params.set("saved", "true")
      if (selectedTags.length > 0) params.set("tags", selectedTags.join(","))

      const res = await fetch(`/api/instagram/accounts?${params.toString()}`)
      if (!res.ok) throw new Error("Erreur lors du chargement")
      const data = await res.json()
      setAccounts(data.accounts || [])
      if (data.stats) setStats(data.stats)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur inconnue")
    } finally {
      setLoading(false)
    }
  }, [search, category, onlySaved, selectedTags])

  useEffect(() => {
    fetchAccounts()
  }, [fetchAccounts])

  const allTags = useMemo(
    () => Array.from(new Set(accounts.flatMap((a) => a.tags || []))).sort(),
    [accounts]
  )

  async function toggleSaved(account: IgAccount) {
    const newSaved = !account.saved
    setAccounts((prev) => prev.map((a) => (a.id === account.id ? { ...a, saved: newSaved } : a)))
    try {
      await fetch(`/api/instagram/accounts/${account.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ saved: newSaved }),
      })
    } catch {
      setAccounts((prev) => prev.map((a) => (a.id === account.id ? { ...a, saved: !newSaved } : a)))
    }
  }

  async function deleteAccount(id: string) {
    if (!confirm("Supprimer ce compte de la veille ?")) return
    setAccounts((prev) => prev.filter((a) => a.id !== id))
    try {
      await fetch(`/api/instagram/accounts/${id}`, { method: "DELETE" })
    } catch {
      fetchAccounts()
    }
  }

  async function launchAudit(account: IgAccount) {
    setAuditingId(account.id)
    setAuditResult(null)
    try {
      const res = await fetch("/api/instagram/audit-pipeline", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ account_id: account.id }),
      })
      if (!res.ok) throw new Error("Erreur lors de l'audit")
      const data = await res.json()
      setAuditResult(`Audit terminé (score: ${data.audit.score_overall}/100)`)
      await fetchAccounts()
    } catch (err) {
      setAuditResult("Erreur lors de l'audit")
    } finally {
      setAuditingId(null)
      setTimeout(() => setAuditResult(null), 4000)
    }
  }

  async function launchPipeline() {
    const handle = newHandle.trim().toLowerCase()
    if (!handle) return
    setPipelineLoading(true)
    setAuditResult(null)
    try {
      const res = await fetch("/api/instagram/audit-pipeline", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ handle }),
      })
      if (!res.ok) throw new Error("Erreur lors du pipeline")
      const data = await res.json()
      setAuditResult(`@${handle} audité (score: ${data.audit.score_overall}/100)`)
      setNewHandle("")
      await fetchAccounts()
    } catch (err) {
      setAuditResult("Erreur : handle introuvable ou invalide")
    } finally {
      setPipelineLoading(false)
      setTimeout(() => setAuditResult(null), 4000)
    }
  }

  async function openAudit(account: IgAccount) {
    try {
      const res = await fetch(`/api/instagram/accounts/${account.id}`)
      if (!res.ok) return
      const data = await res.json()
      const fullAccount = data.account as IgAccount
      const latestAudit = fullAccount.audits?.[0]
      if (latestAudit) {
        setSelectedAudit({ audit: latestAudit, account: fullAccount })
      }
    } catch {
      // silencieux
    }
  }

  const activeFiltersCount =
    (search ? 1 : 0) + (category !== "tous" ? 1 : 0) + (onlySaved ? 1 : 0) + selectedTags.length

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-white">Recherche IG</h1>
          <p className="text-sm text-white/40">Veille concurrentielle et inspiration Instagram</p>
        </div>
        <div className="flex items-center gap-2">
          {auditResult && (
            <span className="flex items-center gap-1.5 rounded-xl bg-emerald-400/10 px-3 py-2 text-xs text-emerald-400">
              <CheckCircle2 className="h-3.5 w-3.5" />
              {auditResult}
            </span>
          )}
          <button
            onClick={fetchAccounts}
            className="flex items-center gap-2 rounded-xl border border-white/[0.08] bg-[hsl(0_0%_13%)] px-4 py-2 text-sm text-white/60 transition-colors hover:text-white"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            Actualiser
          </button>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-xl border border-red-400/20 bg-red-400/10 px-4 py-3 text-sm text-red-400">
          <AlertCircle className="h-4 w-4" />
          {error}
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-white/[0.08] bg-[hsl(0_0%_13%)] p-4">
          <div className="mb-2 flex items-center gap-2 text-white/40">
            <Camera className="h-4 w-4" />
            <span className="text-xs font-medium">Comptes suivis</span>
          </div>
          <p className="text-2xl font-semibold text-white">{stats?.total ?? "-"}</p>
        </div>
        <div className="rounded-2xl border border-white/[0.08] bg-[hsl(0_0%_13%)] p-4">
          <div className="mb-2 flex items-center gap-2 text-white/40">
            <Bookmark className="h-4 w-4" />
            <span className="text-xs font-medium">Sauvegardés</span>
          </div>
          <p className="text-2xl font-semibold text-white">{stats?.saved ?? "-"}</p>
        </div>
        <div className="rounded-2xl border border-white/[0.08] bg-[hsl(0_0%_13%)] p-4">
          <div className="mb-2 flex items-center gap-2 text-white/40">
            <BarChart3 className="h-4 w-4" />
            <span className="text-xs font-medium">Audités</span>
          </div>
          <p className="text-2xl font-semibold text-white">{stats?.audited ?? "-"}</p>
        </div>
        <div className="rounded-2xl border border-white/[0.08] bg-[hsl(0_0%_13%)] p-4">
          <div className="mb-2 flex items-center gap-2 text-white/40">
            <Users className="h-4 w-4" />
            <span className="text-xs font-medium">Audience totale</span>
          </div>
          <p className="text-2xl font-semibold text-white">
            {stats ? formatNumber(stats.totalFollowers) : "-"}
          </p>
        </div>
      </div>

      <div className="rounded-2xl border border-ewa-orange/10 bg-ewa-orange/[0.03] p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
          <div className="flex-1">
            <label className="mb-1.5 block text-xs font-medium text-white/50">
              Nouvel audit Instagram
            </label>
            <div className="relative">
              <Globe className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/30" />
              <input
                type="text"
                value={newHandle}
                onChange={(e) => setNewHandle(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && launchPipeline()}
                placeholder="Entrer un handle Instagram (ex: nike)"
                className="w-full rounded-xl border border-white/[0.08] bg-[hsl(0_0%_13%)] py-2.5 pl-10 pr-4 text-sm text-white placeholder:text-white/30 focus:border-ewa-orange/50 focus:outline-none"
              />
            </div>
          </div>
          <button
            onClick={launchPipeline}
            disabled={pipelineLoading || !newHandle.trim()}
            className="flex items-center gap-2 rounded-xl bg-ewa-orange px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-ewa-orange/90 disabled:opacity-50"
          >
            {pipelineLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Sparkles className="h-4 w-4" />
            )}
            {pipelineLoading ? "Audit en cours..." : "Lancer l'audit"}
          </button>
        </div>
        <p className="mt-2 text-[11px] text-white/30">
          Le pipeline simule Apify → OpenRouter. Remplace par n8n pour des audits réels.
        </p>
      </div>

      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative sm:max-w-xs">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/30" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Rechercher un compte, tag, bio..."
              className="w-full rounded-xl border border-white/[0.08] bg-[hsl(0_0%_13%)] py-2.5 pl-10 pr-4 text-sm text-white placeholder:text-white/30 focus:border-ewa-orange/50 focus:outline-none"
            />
          </div>

          <select
            value={category}
            onChange={(e) => setCategory(e.target.value as Category)}
            className="rounded-xl border border-white/[0.08] bg-[hsl(0_0%_13%)] px-3 py-2.5 text-sm text-white outline-none focus:border-ewa-orange/50"
          >
            <option value="tous">Toutes les catégories</option>
            <option value="concurrent">Concurrent</option>
            <option value="inspiration">Inspiration</option>
            <option value="prospect">Prospect</option>
            <option value="client">Client</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setOnlySaved((v) => !v)}
            className={`flex items-center gap-2 rounded-xl border px-3 py-2 text-sm transition-colors ${
              onlySaved
                ? "border-ewa-orange/50 bg-ewa-orange/10 text-ewa-orange"
                : "border-white/[0.08] bg-[hsl(0_0%_13%)] text-white/60 hover:text-white"
            }`}
          >
            <Bookmark className={`h-4 w-4 ${onlySaved ? "fill-ewa-orange" : ""}`} />
            Sauvegardés
          </button>

          <button
            onClick={() => {
              setSearch("")
              setCategory("tous")
              setOnlySaved(false)
              setSelectedTags([])
            }}
            className="flex items-center gap-2 rounded-xl border border-white/[0.08] bg-[hsl(0_0%_13%)] px-3 py-2 text-sm text-white/60 transition-colors hover:text-white"
          >
            <RefreshCw className="h-4 w-4" />
            Réinitialiser
          </button>
        </div>
      </div>

      {allTags.length > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          <Hash className="h-4 w-4 text-white/30" />
          {allTags.map((tag) => {
            const active = selectedTags.includes(tag)
            return (
              <button
                key={tag}
                onClick={() =>
                  setSelectedTags((prev) => (active ? prev.filter((t) => t !== tag) : [...prev, tag]))
                }
                className={`rounded-full border px-2.5 py-1 text-xs transition-colors ${
                  active
                    ? "border-ewa-orange/50 bg-ewa-orange/10 text-ewa-orange"
                    : "border-white/[0.08] bg-[hsl(0_0%_13%)] text-white/50 hover:text-white"
                }`}
              >
                {tag}
              </button>
            )
          })}
        </div>
      )}

      {activeFiltersCount > 0 && !loading && (
        <div className="flex items-center gap-2 text-xs text-white/50">
          <Filter className="h-3.5 w-3.5" />
          <span>
            {accounts.length} compte{accounts.length > 1 ? "s" : ""} sur {stats?.total ?? 0}
          </span>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center rounded-2xl border border-white/[0.08] bg-[hsl(0_0%_13%)] p-12">
          <Loader2 className="h-6 w-6 animate-spin text-white/30" />
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {accounts.map((account) => {
            const cat = categoryConfig[account.category] || categoryConfig.prospect
            const lastAudit = account.audits?.[0]
            return (
              <div
                key={account.id}
                className="group flex flex-col rounded-2xl border border-white/[0.08] bg-[hsl(0_0%_13%)] p-4 transition-all duration-300 hover:-translate-y-0.5 hover:border-white/[0.15] hover:shadow-[0_8px_30px_rgba(255,107,26,0.06)]"
              >
                <div className="mb-4 flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-ewa-orange/20 to-ewa-orange/5 text-sm font-semibold text-ewa-orange">
                      {(account.display_name || account.handle).slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white">@{account.handle}</p>
                      <p className="text-xs text-white/40">{account.display_name || account.handle}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => toggleSaved(account)}
                      className={`rounded-lg p-1.5 transition-colors ${
                        account.saved
                          ? "text-ewa-orange hover:bg-ewa-orange/10"
                          : "text-white/30 hover:bg-white/[0.04] hover:text-white/60"
                      }`}
                      title={account.saved ? "Retirer" : "Sauvegarder"}
                    >
                      <Bookmark className={`h-4 w-4 ${account.saved ? "fill-ewa-orange" : ""}`} />
                    </button>
                    <button
                      onClick={() => deleteAccount(account.id)}
                      className="rounded-lg p-1.5 text-white/30 transition-colors hover:bg-red-400/10 hover:text-red-400"
                      title="Supprimer"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <div className="mb-4 grid grid-cols-3 gap-2 text-center">
                  <div className="rounded-xl bg-[hsl(0_0%_6.5%)] p-2">
                    <p className="text-sm font-semibold text-white">
                      {account.followers ? formatNumber(account.followers) : "-"}
                    </p>
                    <p className="text-[10px] text-white/40">Abonnés</p>
                  </div>
                  <div className="rounded-xl bg-[hsl(0_0%_6.5%)] p-2">
                    <button
                      onClick={() => lastAudit && openAudit(account)}
                      disabled={!lastAudit}
                      className="w-full text-center"
                      title={lastAudit ? "Voir l'audit détaillé" : "Aucun audit"}
                    >
                      <p className="text-sm font-semibold text-white">
                        {lastAudit?.score_overall ? `${lastAudit.score_overall}/100` : "-"}
                      </p>
                      <p className="text-[10px] text-white/40">
                        {lastAudit ? "Score" : "Score"}
                      </p>
                    </button>
                  </div>
                  <div className="rounded-xl bg-[hsl(0_0%_6.5%)] p-2">
                    <p className="text-sm font-semibold text-white">
                      {account.posts_count ? formatNumber(account.posts_count) : "-"}
                    </p>
                    <p className="text-[10px] text-white/40">Posts</p>
                  </div>
                </div>

                {account.bio && (
                  <p className="mb-3 line-clamp-2 text-xs leading-relaxed text-white/50">{account.bio}</p>
                )}

                <div className="mb-4 flex flex-wrap gap-1.5">
                  {(account.tags || []).map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full border border-white/[0.08] bg-white/[0.04] px-2 py-0.5 text-[10px] text-white/50"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>

                <div className="mt-auto space-y-3 border-t border-white/[0.06] pt-3">
                  <div className="flex items-center justify-between">
                    <span
                      className={`inline-flex items-center gap-1 rounded border px-2 py-0.5 text-[11px] font-medium ${cat.badge}`}
                    >
                      {cat.label}
                    </span>
                    <span className="flex items-center gap-1 text-[11px] text-white/40">
                      <Clock className="h-3 w-3" />
                      {formatRelativeDate(account.created_at)}
                    </span>
                  </div>

                  {account.notes && (
                    <p className="rounded-lg bg-white/[0.03] px-2.5 py-2 text-[11px] italic text-white/40">
                      {account.notes}
                    </p>
                  )}

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => launchAudit(account)}
                        disabled={auditingId === account.id}
                        className="flex items-center gap-1.5 rounded-lg bg-ewa-orange/10 px-2.5 py-1.5 text-[11px] font-medium text-ewa-orange transition-colors hover:bg-ewa-orange/20 disabled:opacity-50"
                      >
                        {auditingId === account.id ? (
                          <Loader2 className="h-3 w-3 animate-spin" />
                        ) : (
                          <Sparkles className="h-3 w-3" />
                        )}
                        {auditingId === account.id ? "Audit..." : "Auditer"}
                      </button>
                      {lastAudit && lastAudit.status === "completed" && (
                        <button
                          onClick={() => openAudit(account)}
                          className="flex items-center gap-1 rounded-lg bg-white/[0.04] px-2 py-1.5 text-[11px] text-white/50 transition-colors hover:bg-white/[0.08] hover:text-white"
                        >
                          <BarChart3 className="h-3 w-3" />
                          Voir
                        </button>
                      )}
                    </div>
                    <a
                      href={account.external_url || `https://instagram.com/${account.handle}`}
                      target="_blank"
                      rel="noreferrer"
                      className="rounded-lg p-1.5 text-white/40 transition-colors hover:bg-white/[0.04] hover:text-white"
                      title="Ouvrir sur Instagram"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {!loading && accounts.length === 0 && (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-white/[0.08] bg-[hsl(0_0%_13%)] p-12 text-center">
          <Search className="mb-3 h-8 w-8 text-white/20" />
          <p className="text-sm font-medium text-white">Aucun compte trouvé</p>
          <p className="text-xs text-white/40">
            {stats?.total === 0
              ? "Ajoute des comptes via l'ingestion n8n ou la migration."
              : "Essaye un autre terme ou réinitialise les filtres."}
          </p>
        </div>
      )}

      {selectedAudit && (
        <AuditDrawer
          audit={selectedAudit.audit}
          account={selectedAudit.account}
          onClose={() => setSelectedAudit(null)}
        />
      )}
    </div>
  )
}
