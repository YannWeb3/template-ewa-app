"use client"

import { useState, useEffect, useMemo, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import {
  Brain,
  Search,
  MessageSquare,
  BookOpen,
  Video,
  FileText,
  Wrench,
  Target,
  Megaphone,
  Camera,
  Palette,
  Lightbulb,
  Zap,
  TrendingUp,
  ArrowRight,
  X,
  RefreshCw,
  Sparkles,
  Layout,
  GraduationCap,
  Briefcase,
  MoreHorizontal,
  PlayCircle,
  Send,
  Bot,
  User,
  Loader2,
  Plus,
} from "lucide-react"
import { Card } from "@/components/ui/card"

type Subcategory =
  | "all"
  | "retour-client"
  | "montage"
  | "scripting"
  | "ads"
  | "audit-profil"
  | "contenu"
  | "tournage"
  | "process"
  | "formation"
  | "proposition"
  | "stories"
  | "outil"
  | "design"
  | "strategie"
  | "client"
  | "conversion"
  | "viralite"
  | "autre"

type Source = "all" | "loom" | "formation" | "script" | "manual" | "whatsapp" | "instagram_audit"

interface KnowledgeEntry {
  id: string
  title: string
  content: string
  category: string
  subcategory: string
  source: Source | string
  sources: Record<string, number>
  metadata: Record<string, unknown>
  original_id?: string | null
  original_table?: string | null
  created_at: string
  updated_at: string
}

interface Stats {
  total: number
  bySubcategory: Record<string, number>
  bySource: Record<string, number>
}

interface SubcategoryConfig {
  id: Subcategory
  label: string
  description: string
  icon: React.ElementType
  color: string
  gradient: string
}

const SUBCATEGORIES: SubcategoryConfig[] = [
  { id: "retour-client", label: "Retour client", description: "Reviews, corrections qualité", icon: MessageSquare, color: "text-blue-400", gradient: "from-blue-500/20 to-blue-600/20" },
  { id: "montage", label: "Montage", description: "CapCut, styles, colorimétrie", icon: Video, color: "text-purple-400", gradient: "from-purple-500/20 to-purple-600/20" },
  { id: "scripting", label: "Scripting", description: "Structures, hooks, templates", icon: FileText, color: "text-orange-400", gradient: "from-orange-500/20 to-orange-600/20" },
  { id: "ads", label: "Ads / Pub", description: "Scripts publicitaires, conversion", icon: Megaphone, color: "text-red-400", gradient: "from-red-500/20 to-red-600/20" },
  { id: "audit-profil", label: "Audit profil", description: "Instagram, bios, optimisation", icon: Target, color: "text-cyan-400", gradient: "from-cyan-500/20 to-cyan-600/20" },
  { id: "contenu", label: "Contenu / Idées", description: "Formats, calendrier éditorial", icon: Lightbulb, color: "text-yellow-400", gradient: "from-yellow-500/20 to-yellow-600/20" },
  { id: "tournage", label: "Tournage", description: "Cadrage, lumière, setup", icon: Camera, color: "text-green-400", gradient: "from-green-500/20 to-green-600/20" },
  { id: "process", label: "Process", description: "Workflow, outils, organisation", icon: Layout, color: "text-slate-400", gradient: "from-slate-500/20 to-slate-600/20" },
  { id: "formation", label: "Formation", description: "Onboarding, montée en compétence", icon: GraduationCap, color: "text-indigo-400", gradient: "from-indigo-500/20 to-indigo-600/20" },
  { id: "proposition", label: "Proposition", description: "Offres, pitch, closing", icon: Briefcase, color: "text-pink-400", gradient: "from-pink-500/20 to-pink-600/20" },
  { id: "stories", label: "Stories", description: "Formats éphémères, engagement", icon: Sparkles, color: "text-fuchsia-400", gradient: "from-fuchsia-500/20 to-fuchsia-600/20" },
  { id: "outil", label: "Outils / Tutos", description: "Frame.io, Notion, logiciels", icon: Wrench, color: "text-amber-400", gradient: "from-amber-500/20 to-amber-600/20" },
  { id: "design", label: "Design / Style", description: "DA, charte, styles visuels", icon: Palette, color: "text-teal-400", gradient: "from-teal-500/20 to-teal-600/20" },
  { id: "strategie", label: "Stratégie", description: "Positionnement, branding", icon: Brain, color: "text-emerald-400", gradient: "from-emerald-500/20 to-emerald-600/20" },
  { id: "client", label: "Client", description: "Relation, suivi, communication", icon: MessageSquare, color: "text-sky-400", gradient: "from-sky-500/20 to-sky-600/20" },
  { id: "conversion", label: "Conversion", description: "Vente, CTA, tunnels", icon: Zap, color: "text-rose-400", gradient: "from-rose-500/20 to-rose-600/20" },
  { id: "viralite", label: "Viralité", description: "Algorithme, tendances, reach", icon: TrendingUp, color: "text-orange-500", gradient: "from-orange-600/20 to-red-600/20" },
  { id: "autre", label: "Autre", description: "Divers, non classé", icon: MoreHorizontal, color: "text-gray-400", gradient: "from-gray-500/20 to-gray-600/20" },
]

const SOURCES: { id: Source; label: string }[] = [
  { id: "all", label: "Toutes sources" },
  { id: "loom", label: "Loom" },
  { id: "formation", label: "Formation" },
  { id: "script", label: "Script" },
  { id: "manual", label: "Manuel / Playbook" },
  { id: "whatsapp", label: "WhatsApp" },
  { id: "instagram_audit", label: "Audit Instagram" },
]

function CerveauEWAContent() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [entries, setEntries] = useState<KnowledgeEntry[]>([])
  const [stats, setStats] = useState<Stats>({ total: 0, bySubcategory: {}, bySource: {} })
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState(searchParams.get("q") || "")
  const [subcategory, setSubcategory] = useState<Subcategory>((searchParams.get("cat") as Subcategory) || "all")
  const [source, setSource] = useState<Source>((searchParams.get("src") as Source) || "all")
  const [selected, setSelected] = useState<KnowledgeEntry | null>(null)
  const [chatOpen, setChatOpen] = useState(false)
  const [chatMessages, setChatMessages] = useState<Array<{ role: "user" | "assistant"; content: string; sources?: Array<{ id: string; title: string; subcategory: string; source: string }>; canAdd?: boolean }>>([])
  const [chatInput, setChatInput] = useState("")
  const [chatLoading, setChatLoading] = useState(false)
  const [addingEntry, setAddingEntry] = useState<{ question: string; answer: string } | null>(null)
  const [newEntry, setNewEntry] = useState({ title: "", content: "", subcategory: "contenu" })
  const [entrySaving, setEntrySaving] = useState(false)

  useEffect(() => {
    fetch("/api/knowledge/search")
      .then((r) => r.json())
      .then((data) => {
        setEntries(data.entries || [])
        setStats(data.stats || { total: 0, bySubcategory: {}, bySource: {} })
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const updateParams = (params: { q?: string; cat?: string; src?: string }) => {
    const url = new URL(window.location.href)
    if (params.q !== undefined) {
      if (params.q) url.searchParams.set("q", params.q)
      else url.searchParams.delete("q")
    }
    if (params.cat !== undefined) {
      if (params.cat && params.cat !== "all") url.searchParams.set("cat", params.cat)
      else url.searchParams.delete("cat")
    }
    if (params.src !== undefined) {
      if (params.src && params.src !== "all") url.searchParams.set("src", params.src)
      else url.searchParams.delete("src")
    }
    window.history.replaceState({}, "", url.toString())
  }

  useEffect(() => {
    const handler = setTimeout(() => updateParams({ q: search }), 300)
    return () => clearTimeout(handler)
  }, [search])

  useEffect(() => {
    updateParams({ cat: subcategory, src: source })
  }, [subcategory, source])

  const filtered = useMemo(() => {
    return entries.filter((entry) => {
      const matchesSearch =
        !search.trim() ||
        entry.title.toLowerCase().includes(search.toLowerCase()) ||
        entry.content.toLowerCase().includes(search.toLowerCase())
      const matchesSubcategory = subcategory === "all" || entry.subcategory === subcategory
      const matchesSource = source === "all" || entry.source === source
      return matchesSearch && matchesSubcategory && matchesSource
    })
  }, [entries, search, subcategory, source])

  async function sendChatMessage() {
    const question = chatInput.trim()
    if (!question || chatLoading) return
    setChatInput("")
    setChatMessages((prev) => [...prev, { role: "user", content: question }])
    setChatLoading(true)
    try {
      const res = await fetch("/api/knowledge/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question }),
      })
      if (!res.ok) throw new Error("Erreur")
      const data = await res.json()
      setChatMessages((prev) => [...prev, { role: "assistant", content: data.answer, sources: data.sources, canAdd: data.canAdd }])
    } catch {
      setChatMessages((prev) => [...prev, { role: "assistant", content: "Désolé, une erreur est survenue. Réessaie." }])
    } finally {
      setChatLoading(false)
    }
  }

  const formatDate = (date: string) =>
    new Date(date).toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric" })

  const loomCount = stats.bySource.loom || 0
  const formationScriptCount = (stats.bySource.formation || 0) + (stats.bySource.script || 0)
  const subcategoryCount = Object.keys(stats.bySubcategory).length

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-white">Cerveau EWA</h1>
          <p className="mt-1 text-sm text-white/50">
            Base de connaissances interne — {stats.total} entrées
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setChatOpen(true)}
            className="flex items-center gap-2 rounded-lg border border-ewa-orange/20 bg-ewa-orange/10 px-3 py-2 text-xs font-medium text-ewa-orange transition hover:bg-ewa-orange/20"
          >
            <Bot className="h-3.5 w-3.5" />
            Chat IA
          </button>
          <button
            onClick={() => window.location.reload()}
            className="flex items-center gap-2 rounded-lg border border-white/[0.08] bg-[hsl(0_0%_13%)] px-3 py-2 text-xs font-medium text-white/70 transition hover:border-white/[0.15] hover:text-white"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Actualiser
          </button>
        </div>
      </div>

      {/* Top stats */}
      <div className="grid grid-cols-3 gap-3">
        <Card innerClassName="flex flex-col justify-center">
          <div className="flex items-center gap-2 mb-2">
            <PlayCircle className="h-4 w-4 text-purple-400" />
            <span className="text-xs text-white/40">Vidéos Loom</span>
          </div>
          <span className="text-2xl font-bold text-white">{loomCount}</span>
        </Card>
        <Card innerClassName="flex flex-col justify-center">
          <div className="flex items-center gap-2 mb-2">
            <BookOpen className="h-4 w-4 text-blue-400" />
            <span className="text-xs text-white/40">Formations & Scripts</span>
          </div>
          <span className="text-2xl font-bold text-white">{formationScriptCount}</span>
        </Card>
        <Card innerClassName="flex flex-col justify-center">
          <div className="flex items-center gap-2 mb-2">
            <Brain className="h-4 w-4 text-orange-400" />
            <span className="text-xs text-white/40">Sous-catégories</span>
          </div>
          <span className="text-2xl font-bold text-white">{subcategoryCount}</span>
        </Card>
      </div>

      {/* Subcategories grid */}
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
        {SUBCATEGORIES.map((cat) => (
          <a
            key={cat.id}
            href={`/cerveau-ewa/${cat.id}`}
            onClick={(e) => {
              e.preventDefault()
              router.push(`/cerveau-ewa/${cat.id}`)
            }}
            className={`group relative flex flex-col items-start gap-1.5 overflow-hidden rounded-xl border p-3 text-left transition ${
              subcategory === cat.id
                ? "border-white/20 bg-gradient-to-br " + cat.gradient
                : "border-white/[0.08] bg-[hsl(0_0%_13%)] hover:border-white/[0.15]"
            }`}
          >
            {subcategory !== cat.id && (
              <div
                className={`absolute inset-0 bg-gradient-to-br ${cat.gradient} opacity-0 transition-opacity duration-300 group-hover:opacity-30`}
              />
            )}
            <cat.icon
              className={`relative z-10 h-3.5 w-3.5 ${
                subcategory === cat.id ? cat.color : `text-white/40 group-hover:${cat.color}`
              }`}
            />
            <div className="relative z-10">
              <div className={`text-xs font-semibold ${subcategory === cat.id ? "text-white" : "text-white/80"}`}>
                {cat.label}
              </div>
              <div className="text-[10px] text-white/40">{stats.bySubcategory[cat.id] || 0}</div>
            </div>
          </a>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
          <input
            type="text"
            placeholder="Rechercher dans toutes les transcriptions..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-white/[0.08] bg-[hsl(0_0%_9%)] py-2.5 pl-10 pr-4 text-sm text-white placeholder:text-white/30 focus:border-[#FF6B1A]/50 focus:outline-none focus:ring-1 focus:ring-[#FF6B1A]/30"
          />
        </div>
        <div className="flex items-center gap-2">
          <select
            value={source}
            onChange={(e) => setSource(e.target.value as Source)}
            className="rounded-xl border border-white/[0.08] bg-[hsl(0_0%_9%)] px-3 py-2.5 text-sm text-white focus:border-[#FF6B1A]/50 focus:outline-none"
          >
            {SOURCES.map((s) => (
              <option key={s.id} value={s.id}>
                {s.label}
              </option>
            ))}
          </select>
          {(search || subcategory !== "all" || source !== "all") && (
            <button
              onClick={() => {
                setSearch("")
                setSubcategory("all")
                setSource("all")
              }}
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/[0.08] text-white/50 hover:text-white"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {/* Results count */}
      <div className="text-xs text-white/40">
        {loading ? "Chargement..." : `${filtered.length} résultat${filtered.length > 1 ? "s" : ""}`}
      </div>

      {/* Results grid */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((entry) => (
          <button
            key={entry.id}
            onClick={() => setSelected(entry)}
            className="group rounded-2xl border border-white/[0.08] bg-[hsl(0_0%_13%)] p-4 text-left transition hover:border-white/[0.15]"
          >
            <div className="flex items-center justify-between gap-2">
              <span className="rounded-full bg-[#FF6B1A]/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-[#FF6B1A]">
                {entry.subcategory}
              </span>
              <span className="text-[10px] text-white/30">{entry.source}</span>
            </div>
            <h3 className="mt-2 line-clamp-2 text-sm font-semibold text-white group-hover:text-[#FF6B1A]">
              {entry.title}
            </h3>
            <p className="mt-1 line-clamp-3 text-xs text-white/50">
              {entry.content.slice(0, 160)}
              {entry.content.length > 160 ? "..." : ""}
            </p>
            <div className="mt-3 flex items-center justify-between text-[10px] text-white/30">
              <span>{formatDate(entry.updated_at)}</span>
              <ArrowRight className="h-3.5 w-3.5 opacity-0 transition group-hover:translate-x-0.5 group-hover:opacity-100" />
            </div>
          </button>
        ))}
      </div>

      {filtered.length === 0 && !loading && (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-white/[0.08] bg-[hsl(0_0%_13%)] py-16 text-center">
          <Brain className="h-10 w-10 text-white/20" />
          <p className="mt-4 text-sm text-white/60">Aucune connaissance trouvée.</p>
          <p className="text-xs text-white/40">Essaye un autre terme ou réinitialise les filtres.</p>
        </div>
      )}

      {/* Modal */}
      {selected && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
          onClick={() => setSelected(null)}
        >
          <div
            className="max-h-[85vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-white/[0.08] bg-[hsl(0_0%_7%)] p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="rounded-full bg-[#FF6B1A]/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-[#FF6B1A]">
                    {selected.subcategory}
                  </span>
                  <span className="text-[10px] text-white/30">{selected.source}</span>
                </div>
                <h2 className="mt-2 text-lg font-semibold text-white">{selected.title}</h2>
              </div>
              <button
                onClick={() => setSelected(null)}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-white/50 hover:bg-white/[0.08] hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-4 whitespace-pre-wrap rounded-xl border border-white/[0.08] bg-[hsl(0_0%_10%)] p-4 text-sm leading-relaxed text-white/80">
              {selected.content}
            </div>

            {selected.metadata && Object.keys(selected.metadata).length > 0 && (
              <div className="mt-4">
                <h4 className="text-xs font-semibold uppercase tracking-wide text-white/40">Métadonnées</h4>
                <pre className="mt-2 max-h-48 overflow-auto rounded-xl border border-white/[0.08] bg-[hsl(0_0%_10%)] p-3 text-[10px] text-white/50">
                  {JSON.stringify(selected.metadata, null, 2)}
                </pre>
              </div>
            )}

            <div className="mt-6 flex items-center justify-between border-t border-white/[0.08] pt-4 text-xs text-white/40">
              <span>ID : {selected.id}</span>
              <span>Mis à jour {formatDate(selected.updated_at)}</span>
            </div>
          </div>
        </div>
      )}

      {/* Chat drawer */}
      {chatOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-end">
          <div className="absolute inset-0 bg-black/60" onClick={() => setChatOpen(false)} />
          <div className="relative flex h-full w-full max-w-lg flex-col border-l border-white/[0.08] bg-[hsl(0_0%_10%)] shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/[0.08] px-5 py-4">
              <div className="flex items-center gap-2">
                <Bot className="h-5 w-5 text-ewa-orange" />
                <h2 className="text-sm font-semibold text-white">Chat Cerveau EWA</h2>
              </div>
              <button
                onClick={() => setChatOpen(false)}
                className="rounded-lg p-1.5 text-white/40 transition-colors hover:bg-white/[0.04] hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-4 p-5">
              {chatMessages.length === 0 && (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <Brain className="mb-3 h-8 w-8 text-white/20" />
                  <p className="text-sm text-white/50">Pose une question sur le Cerveau EWA</p>
                  <p className="mt-1 text-xs text-white/30">
                    Ex: "Comment faire un bon hook ?" ou "Quels sont les formats Reels qui marchent ?"
                  </p>
                </div>
              )}
              {chatMessages.map((msg, i) => (
                <div key={i} className={`flex gap-3 ${msg.role === "user" ? "justify-end" : ""}`}>
                  {msg.role === "assistant" && (
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-ewa-orange/20">
                      <Bot className="h-4 w-4 text-ewa-orange" />
                    </div>
                  )}
                  <div className={`max-w-[80%] ${msg.role === "user" ? "order-first" : ""}`}>
                    <div
                      className={`rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                        msg.role === "user"
                          ? "bg-ewa-orange/20 text-white"
                          : "border border-white/[0.08] bg-[hsl(0_0%_13%)] text-white/80"
                      }`}
                    >
                      {msg.content}
                    </div>
                    {msg.sources && msg.sources.length > 0 && (
                      <div className="mt-2 space-y-1">
                        <p className="text-[10px] text-white/30">Sources :</p>
                        {msg.sources.map((s) => (
                          <a
                            key={s.id}
                            href={`/cerveau-ewa/${s.subcategory}`}
                            className="block rounded-lg border border-white/[0.06] bg-white/[0.03] px-3 py-1.5 text-[11px] text-white/50 transition hover:border-white/[0.12] hover:text-white"
                          >
                            {s.title} <span className="text-white/20">({s.subcategory})</span>
                          </a>
                        ))}
                      </div>
                    )}
                    {msg.role === "assistant" && msg.canAdd && (
                      <button
                        onClick={() => {
                          const userMsg = chatMessages[chatMessages.indexOf(msg) - 1]
                          setAddingEntry({
                            question: userMsg?.content || "",
                            answer: msg.content,
                          })
                          setNewEntry({
                            title: userMsg?.content?.slice(0, 80) || "Nouvelle connaissance",
                            content: msg.content,
                            subcategory: "contenu",
                          })
                        }}
                        className="mt-2 flex items-center gap-1.5 rounded-lg border border-dashed border-ewa-orange/30 px-3 py-1.5 text-[11px] text-ewa-orange/70 transition-colors hover:border-ewa-orange/60 hover:text-ewa-orange"
                      >
                        <Plus className="h-3 w-3" />
                        Ajouter au Cerveau EWA
                      </button>
                    )}
                  </div>
                  {msg.role === "user" && (
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/[0.08]">
                      <User className="h-4 w-4 text-white/50" />
                    </div>
                  )}
                </div>
              ))}
              {chatLoading && (
                <div className="flex gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-ewa-orange/20">
                    <Bot className="h-4 w-4 text-ewa-orange" />
                  </div>
                  <div className="flex items-center gap-2 rounded-2xl border border-white/[0.08] bg-[hsl(0_0%_13%)] px-4 py-3">
                    <Loader2 className="h-4 w-4 animate-spin text-ewa-orange" />
                    <span className="text-sm text-white/50">Réflexion...</span>
                  </div>
                </div>
              )}
            </div>

            <div className="border-t border-white/[0.08] p-4">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && sendChatMessage()}
                  placeholder="Pose une question..."
                  className="flex-1 rounded-xl border border-white/[0.08] bg-[hsl(0_0%_13%)] px-4 py-2.5 text-sm text-white placeholder:text-white/30 focus:border-ewa-orange/50 focus:outline-none"
                />
                <button
                  onClick={sendChatMessage}
                  disabled={chatLoading || !chatInput.trim()}
                  className="flex items-center gap-2 rounded-xl bg-ewa-orange px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-ewa-orange/90 disabled:opacity-50"
                >
                  <Send className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add entry modal */}
      {addingEntry && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl border border-white/[0.08] bg-[hsl(0_0%_7%)] p-6 shadow-2xl">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-white">Ajouter au Cerveau EWA</h3>
              <button
                onClick={() => setAddingEntry(null)}
                className="rounded-lg p-1 text-white/40 hover:bg-white/[0.04] hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="mb-1 block text-xs font-medium text-white/60">Titre</label>
                <input
                  type="text"
                  value={newEntry.title}
                  onChange={(e) => setNewEntry((prev) => ({ ...prev, title: e.target.value }))}
                  className="w-full rounded-xl border border-white/[0.08] bg-[hsl(0_0%_13%)] px-3 py-2 text-sm text-white outline-none focus:border-ewa-orange/50"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-white/60">Contenu</label>
                <textarea
                  value={newEntry.content}
                  onChange={(e) => setNewEntry((prev) => ({ ...prev, content: e.target.value }))}
                  rows={6}
                  className="w-full resize-none rounded-xl border border-white/[0.08] bg-[hsl(0_0%_13%)] px-3 py-2 text-sm text-white outline-none focus:border-ewa-orange/50"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-white/60">Catégorie</label>
                <select
                  value={newEntry.subcategory}
                  onChange={(e) => setNewEntry((prev) => ({ ...prev, subcategory: e.target.value }))}
                  className="w-full rounded-xl border border-white/[0.08] bg-[hsl(0_0%_13%)] px-3 py-2 text-sm text-white outline-none focus:border-ewa-orange/50"
                >
                  {SUBCATEGORIES.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-2">
              <button
                onClick={() => setAddingEntry(null)}
                className="rounded-xl border border-white/[0.08] bg-transparent px-4 py-2 text-sm font-medium text-white/70 transition-colors hover:bg-white/[0.04]"
              >
                Annuler
              </button>
              <button
                onClick={async () => {
                  if (!newEntry.title || !newEntry.content) return
                  setEntrySaving(true)
                  try {
                    const res = await fetch("/api/knowledge/ingest", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({
                        title: newEntry.title,
                        content: newEntry.content,
                        category: newEntry.subcategory,
                        subcategory: newEntry.subcategory,
                        source: "manual",
                      }),
                    })
                    if (!res.ok) throw new Error()
                    setAddingEntry(null)
                    fetch("/api/knowledge/search")
                      .then((r) => r.json())
                      .then((data) => {
                        setEntries(data.entries || [])
                        setStats(data.stats || { total: 0, bySubcategory: {}, bySource: {} })
                      })
                  } catch {
                    alert("Erreur lors de l'ajout")
                  } finally {
                    setEntrySaving(false)
                  }
                }}
                disabled={entrySaving || !newEntry.title || !newEntry.content}
                className="flex items-center gap-2 rounded-xl bg-ewa-orange px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-ewa-orange/90 disabled:opacity-50"
              >
                {entrySaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                Ajouter
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default function CerveauEWAPage() {
  return (
    <Suspense
      fallback={<div className="p-8 text-center text-white/50">Chargement du Cerveau EWA...</div>}
    >
      <CerveauEWAContent />
    </Suspense>
  )
}
