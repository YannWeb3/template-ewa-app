"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import ReactMarkdown from "react-markdown"
import {
  Brain,
  ArrowLeft,
  Edit3,
  Trash2,
  ExternalLink,
  PlayCircle,
  Save,
  X,
  MessageSquare,
  Video,
  FileText,
  Megaphone,
  Target,
  Lightbulb,
  Camera,
  Layout,
  GraduationCap,
  Briefcase,
  Sparkles,
  Wrench,
  Palette,
  Zap,
  TrendingUp,
  MoreHorizontal,
  BookOpen,
} from "lucide-react"
import { Card } from "@/components/ui/card"

type SubcategoryId =
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

interface KnowledgeEntry {
  id: string
  title: string
  content: string
  category: string
  subcategory: string
  source: string
  sources: Record<string, number>
  metadata: Record<string, unknown>
  created_at: string
  updated_at: string
}

interface SubcategoryConfig {
  id: SubcategoryId
  label: string
  description: string
  icon: React.ElementType
  color: string
  gradient: string
  longDescription: string
}

const SUBCATEGORIES: SubcategoryConfig[] = [
  {
    id: "retour-client",
    label: "Retour client",
    description: "Reviews montages, retours qualité, corrections",
    icon: MessageSquare,
    color: "text-blue-400",
    gradient: "from-blue-500/20 to-blue-600/20",
    longDescription:
      "Cette fiche centralise les retours clients sur les montages, les corrections demandées et les validations. Utilise ces retours pour affiner le style EWA et réduire le nombre de retouche.",
  },
  {
    id: "montage",
    label: "Montage",
    description: "CapCut, styles, sous-titrage, colorimétrie",
    icon: Video,
    color: "text-purple-400",
    gradient: "from-purple-500/20 to-purple-600/20",
    longDescription:
      "Toutes les techniques et best practices de montage : rythme, transitions, sound design, colorimétrie, sous-titrage et exports optimisés pour chaque plateforme.",
  },
  {
    id: "scripting",
    label: "Scripting",
    description: "Structures de scripts, hooks, templates, IA",
    icon: FileText,
    color: "text-orange-400",
    gradient: "from-orange-500/20 to-orange-600/20",
    longDescription:
      "Structures de scripts éprouvées, templates de hooks, prompts IA et méthodes pour écrire des scripts qui retiennent l'attention jusqu'au CTA.",
  },
  {
    id: "ads",
    label: "Ads / Pub",
    description: "Scripts publicitaires, hooks ads, conversion",
    icon: Megaphone,
    color: "text-red-400",
    gradient: "from-red-500/20 to-red-600/20",
    longDescription:
      "Spécifique aux créatives publicitaires : angles, claims, preuves sociales, optimisation pour Meta Ads et TikTok Ads, tests A/B et scaling.",
  },
  {
    id: "audit-profil",
    label: "Audit profil",
    description: "Instagram, bios, optimisation profil",
    icon: Target,
    color: "text-cyan-400",
    gradient: "from-cyan-500/20 to-cyan-600/20",
    longDescription:
      "Méthodologie d'audit Instagram : bio, photo de profil, feed, reels, stories, liens et CTA. Utilise cette fiche pour auditer les clients et proposer des quick wins.",
  },
  {
    id: "contenu",
    label: "Contenu / Idées",
    description: "Idées de contenu, formats, calendrier éditorial",
    icon: Lightbulb,
    color: "text-yellow-400",
    gradient: "from-yellow-500/20 to-yellow-600/20",
    longDescription:
      "Banque d'idées de contenu, formats par plateforme, planification éditoriale et techniques pour ne jamais manquer d'inspiration.",
  },
  {
    id: "tournage",
    label: "Tournage",
    description: "Cadrage, lumière, b-rolls, setup face caméra",
    icon: Camera,
    color: "text-green-400",
    gradient: "from-green-500/20 to-green-600/20",
    longDescription:
      "Tout le setup de tournage : éclairage, cadrage, angles, plans B-roll, téléprompteur et checklist matériel pour un rendu pro en solo.",
  },
  {
    id: "process",
    label: "Process",
    description: "Workflow interne, outils, organisation",
    icon: Layout,
    color: "text-slate-400",
    gradient: "from-slate-500/20 to-slate-600/20",
    longDescription:
      "Workflows internes : réception de brief, attribution monteur, review, livraison, archivage. Objectif : moins de friction, plus de qualité.",
  },
  {
    id: "formation",
    label: "Formation",
    description: "Onboarding, montée en compétence",
    icon: GraduationCap,
    color: "text-indigo-400",
    gradient: "from-indigo-500/20 to-indigo-600/20",
    longDescription:
      "Formations internes : onboarding des nouveaux monteurs, montée en compétence, certifications et parcours de formation continue.",
  },
  {
    id: "proposition",
    label: "Proposition",
    description: "Offres, pitch, closing",
    icon: Briefcase,
    color: "text-pink-400",
    gradient: "from-pink-500/20 to-pink-600/20",
    longDescription:
      "Modèles de propositions commerciales, techniques de pitch, objection handling et méthodes de closing adaptées aux créateurs de contenu.",
  },
  {
    id: "stories",
    label: "Stories",
    description: "Formats éphémères, engagement",
    icon: Sparkles,
    color: "text-fuchsia-400",
    gradient: "from-fuchsia-500/20 to-fuchsia-600/20",
    longDescription:
      "Best practices pour les stories Instagram : formats, interactions, séquences, vente par DM et maintien de l'engagement au quotidien.",
  },
  {
    id: "outil",
    label: "Outils / Tutos",
    description: "Frame.io, Notion, logiciels",
    icon: Wrench,
    color: "text-amber-400",
    gradient: "from-amber-500/20 to-amber-600/20",
    longDescription:
      "Tutoriels sur les outils internes : Frame.io, Notion, CapCut, Adobe, automations et tous les logiciels qui font tourner EWA.",
  },
  {
    id: "design",
    label: "Design / Style",
    description: "DA, charte, styles visuels",
    icon: Palette,
    color: "text-teal-400",
    gradient: "from-teal-500/20 to-teal-600/20",
    longDescription:
      "Direction artistique EWA : charte graphique, typographies, palettes, templates de motion et guidelines visuelles.",
  },
  {
    id: "strategie",
    label: "Stratégie",
    description: "Positionnement, branding",
    icon: Brain,
    color: "text-emerald-400",
    gradient: "from-emerald-500/20 to-emerald-600/20",
    longDescription:
      "Stratégie de contenu : positionnement, branding, personas, funnel, calendrier stratégique et planification long terme.",
  },
  {
    id: "client",
    label: "Client",
    description: "Relation, suivi, communication",
    icon: MessageSquare,
    color: "text-sky-400",
    gradient: "from-sky-500/20 to-sky-600/20",
    longDescription:
      "Relation client : onboarding, suivi, communication, gestion des attentes et méthodes pour fidéliser sur le long terme.",
  },
  {
    id: "conversion",
    label: "Conversion",
    description: "Vente, CTA, tunnels",
    icon: Zap,
    color: "text-rose-400",
    gradient: "from-rose-500/20 to-rose-600/20",
    longDescription:
      "Optimisation de la conversion : CTA, tunnels de vente, pages de capture, séquences de relance et analytics.",
  },
  {
    id: "viralite",
    label: "Viralité",
    description: "Algorithme, tendances, reach",
    icon: TrendingUp,
    color: "text-orange-500",
    gradient: "from-orange-600/20 to-red-600/20",
    longDescription:
      "Mécanismes de viralité : algorithmes, tendances, rétention, partages, reach et analyse des posts qui performent.",
  },
  {
    id: "autre",
    label: "Autre",
    description: "Divers, non classé",
    icon: MoreHorizontal,
    color: "text-gray-400",
    gradient: "from-gray-500/20 to-gray-600/20",
    longDescription: "Connaissances transverses ou en attente de classification.",
  },
]

export default function SubcategoryPage() {
  const params = useParams()
  const router = useRouter()
  const subcategoryId = (params.subcategory as SubcategoryId) || "autre"
  const subcategory = SUBCATEGORIES.find((s) => s.id === subcategoryId) || SUBCATEGORIES[SUBCATEGORIES.length - 1]

  const [entries, setEntries] = useState<KnowledgeEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editForm, setEditForm] = useState<Partial<KnowledgeEntry>>({})

  useEffect(() => {
    fetch(`/api/knowledge/search?subcategory=${subcategoryId}`)
      .then((r) => r.json())
      .then((data) => {
        setEntries(data.entries || [])
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [subcategoryId])

  const handleDelete = async (id: string) => {
    if (!confirm("Supprimer cette entrée ?")) return
    const res = await fetch(`/api/knowledge/${id}`, { method: "DELETE" })
    if (res.ok) {
      setEntries((prev) => prev.filter((e) => e.id !== id))
    } else {
      alert("Erreur lors de la suppression")
    }
  }

  const startEdit = (entry: KnowledgeEntry) => {
    setEditingId(entry.id)
    setEditForm({ title: entry.title, content: entry.content })
  }

  const cancelEdit = () => {
    setEditingId(null)
    setEditForm({})
  }

  const saveEdit = async (id: string) => {
    const res = await fetch(`/api/knowledge/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: editForm.title, content: editForm.content }),
    })
    if (res.ok) {
      const { entry } = await res.json()
      setEntries((prev) => prev.map((e) => (e.id === id ? entry : e)))
      setEditingId(null)
    } else {
      alert("Erreur lors de la modification")
    }
  }

  const loomEntries = entries.filter((e) => e.source === "loom")
  const otherEntries = entries.filter((e) => e.source !== "loom")

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4">
        <button
          onClick={() => router.push("/cerveau-ewa")}
          className="flex w-fit items-center gap-2 rounded-lg border border-white/[0.08] bg-[hsl(0_0%_13%)] px-3 py-2 text-xs font-medium text-white/70 transition hover:border-white/[0.15] hover:text-white"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Retour au Cerveau EWA
        </button>

        <div className="flex items-start gap-4">
          <div className={`flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br ${subcategory.gradient} border border-white/10`}>
            <subcategory.icon className={`h-7 w-7 ${subcategory.color}`} />
          </div>
          <div>
            <h1 className="text-2xl font-semibold text-white">Fiche Cerveau EWA — {subcategory.label}</h1>
            <p className="mt-1 text-sm text-white/50">{subcategory.description} · {entries.length} entrée{entries.length > 1 ? "s" : ""}</p>
          </div>
        </div>
      </div>

      {/* Description */}
      <Card title="À propos" icon={BookOpen}>
        <p className="text-sm leading-relaxed text-white/70">{subcategory.longDescription}</p>
      </Card>

      {/* Loom videos */}
      {loomEntries.length > 0 && (
        <Card title={`Vidéos Loom — ${subcategory.label}`} icon={PlayCircle}>
          <div className="grid gap-3 sm:grid-cols-2">
            {loomEntries.map((entry) => (
              <div
                key={entry.id}
                className="group flex flex-col gap-3 rounded-xl border border-white/[0.08] bg-[hsl(0_0%_10%)] p-3 transition hover:border-white/[0.15]"
              >
                <div className="flex items-start justify-between gap-2">
                  <span className="text-sm font-medium text-white">{entry.title}</span>
                  <a
                    href={(entry.metadata?.loom_url as string) || "#"}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex shrink-0 items-center gap-1 text-[10px] text-purple-400 hover:text-purple-300"
                  >
                    <ExternalLink className="h-3 w-3" />
                    Loom
                  </a>
                </div>
                <p className="line-clamp-2 text-xs text-white/50">{entry.content.slice(0, 120)}...</p>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* All entries */}
      <Card title="Toutes les connaissances" icon={Brain}>
        {loading ? (
          <p className="text-sm text-white/50">Chargement...</p>
        ) : entries.length === 0 ? (
          <p className="py-8 text-center text-sm text-white/50">Aucune connaissance dans cette catégorie.</p>
        ) : (
          <div className="space-y-3">
            {entries.map((entry) => (
              <div
                key={entry.id}
                className="rounded-xl border border-white/[0.08] bg-[hsl(0_0%_10%)] p-4"
              >
                {editingId === entry.id ? (
                  <div className="space-y-3">
                    <input
                      type="text"
                      value={editForm.title || ""}
                      onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                      className="w-full rounded-lg border border-white/[0.08] bg-[hsl(0_0%_9%)] px-3 py-2 text-sm text-white focus:border-[#FF6B1A]/50 focus:outline-none"
                    />
                    <textarea
                      value={editForm.content || ""}
                      onChange={(e) => setEditForm({ ...editForm, content: e.target.value })}
                      rows={5}
                      className="w-full rounded-lg border border-white/[0.08] bg-[hsl(0_0%_9%)] px-3 py-2 text-sm text-white focus:border-[#FF6B1A]/50 focus:outline-none"
                    />
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => saveEdit(entry.id)}
                        className="flex items-center gap-1.5 rounded-lg bg-[#FF6B1A] px-3 py-1.5 text-xs font-medium text-white transition hover:bg-[#FF6B1A]/90"
                      >
                        <Save className="h-3.5 w-3.5" />
                        Enregistrer
                      </button>
                      <button
                        onClick={cancelEdit}
                        className="flex items-center gap-1.5 rounded-lg border border-white/[0.08] px-3 py-1.5 text-xs font-medium text-white/70 transition hover:text-white"
                      >
                        <X className="h-3.5 w-3.5" />
                        Annuler
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <span className="rounded-full bg-[#FF6B1A]/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-[#FF6B1A]">
                          {entry.source}
                        </span>
                        <h3 className="text-sm font-semibold text-white">{entry.title}</h3>
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => startEdit(entry)}
                          className="flex h-7 w-7 items-center justify-center rounded-lg text-white/40 hover:bg-white/[0.08] hover:text-white"
                        >
                          <Edit3 className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(entry.id)}
                          className="flex h-7 w-7 items-center justify-center rounded-lg text-white/40 hover:bg-red-500/10 hover:text-red-400"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>

                    <div className="prose prose-invert prose-sm max-w-none text-white/70">
                      <ReactMarkdown>{entry.content}</ReactMarkdown>
                    </div>

                    {entry.source === "loom" && typeof entry.metadata?.loom_url === "string" && (
                      <a
                        href={entry.metadata.loom_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-xs text-purple-400 hover:text-purple-300"
                      >
                        <ExternalLink className="h-3.5 w-3.5" />
                        Voir la vidéo Loom
                      </a>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  )
}
