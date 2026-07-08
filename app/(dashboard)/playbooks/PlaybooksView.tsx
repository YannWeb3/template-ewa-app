"use client"

import { useState, useMemo } from "react"
import {
  BookOpen,
  Search,
  Plus,
  X,
  MoreHorizontal,
  Trash2,
  Eye,
  EyeOff,
  CheckCircle2,
  ExternalLink,
  Film,
  FileText,
  LayoutGrid,
  List,
  GripVertical,
} from "lucide-react"

interface Playbook {
  id: string
  title: string
  emoji: string | null
  description: string | null
  content: string | null
  checklist: { label: string; required: boolean }[] | null
  position: number | null
  is_published: boolean
  created_at: string
  updated_at: string
  loom_url: string | null
  examples: { url: string; label: string }[] | null
}

interface PlaybooksViewProps {
  playbooks: Playbook[]
}

const MOCK_PLAYBOOKS: Playbook[] = [
  {
    id: "mock-onboarding",
    title: "Onboarding nouveau monteur",
    emoji: "🎒",
    description: "Process d'intégration d'un nouveau membre de l'équipe EWA.",
    content:
      "1. Envoyer le lien d'accès aux outils\n2. Partager les playbooks essentiels\n3. Présenter les clients actifs\n4. Première mission tutorée\n5. Point d'étape à J+7",
    checklist: [
      { label: "Accès Frame.io", required: true },
      { label: "Accès Google Drive", required: true },
      { label: "Lecture des playbooks fondamentaux", required: true },
      { label: "Call de bienvenue", required: false },
    ],
    position: 2,
    is_published: true,
    created_at: "2026-06-01T10:00:00Z",
    updated_at: "2026-06-15T14:30:00Z",
    loom_url: null,
    examples: [],
  },
  {
    id: "mock-retours",
    title: "Gestion des retours clients",
    emoji: "🔄",
    description: "Comment traiter une vague de retours sans perdre la tête ni la qualité.",
    content:
      "- Lire l'intégralité des commentaires avant de modifier\n- Classer par priorité (technique / créatif / préférence)\n- Appliquer les modifications par lot\n- Vérifier la cohérence globale\n- Livrer avec un récap des changements",
    checklist: [
      { label: "Lecture complète", required: true },
      { label: "Tri par priorité", required: true },
      { label: "Modifications appliquées", required: true },
      { label: "Vérification finale", required: true },
    ],
    position: 3,
    is_published: true,
    created_at: "2026-06-05T09:00:00Z",
    updated_at: "2026-06-20T11:00:00Z",
    loom_url: "https://www.loom.com/share/example-retours",
    examples: [{ url: "https://example.com/retour-client", label: "Exemple type" }],
  },
  {
    id: "mock-livraison",
    title: "Checklist de livraison finale",
    emoji: "✅",
    description: "Avant d'envoyer un projet au client, valider chaque étape.",
    content:
      "Vérifier :\n- Format et ratio demandés\n- Poids du fichier\n- Sous-titres si demandés\n- Musique libre de droits\n- Nom de fichier clair",
    checklist: [
      { label: "Format / ratio", required: true },
      { label: "Poids optimisé", required: true },
      { label: "Sous-titres", required: false },
      { label: "Musique créditée", required: true },
      { label: "Nom de fichier", required: true },
    ],
    position: 4,
    is_published: true,
    created_at: "2026-06-10T08:00:00Z",
    updated_at: "2026-06-22T16:00:00Z",
    loom_url: null,
    examples: [{ url: "https://example.com/livraison", label: "Template livraison" }],
  },
  {
    id: "mock-reels",
    title: "Recette Reels / Shorts viraux",
    emoji: "📱",
    description: "Structure et rythme d'un Reels qui performe pour nos clients.",
    content:
      "Hook 0-3s → promesse → preuve/séquence → CTA\n- Dès les 3 premières secondes : accrocher\n- Garder le rythme sous 7 secondes par séquence\n- Ajouter du texte on-screen\n- Terminer par un call-to-action clair",
    checklist: [
      { label: "Hook fort", required: true },
      { label: "Sous-titres lisibles", required: true },
      { label: "CTA final", required: true },
      { label: "Musique tendance", required: false },
    ],
    position: 5,
    is_published: true,
    created_at: "2026-06-12T13:00:00Z",
    updated_at: "2026-06-25T10:00:00Z",
    loom_url: "https://www.loom.com/share/example-reels",
    examples: [
      { url: "https://example.com/reels-1", label: "Exemple 1" },
      { url: "https://example.com/reels-2", label: "Exemple 2" },
    ],
  },
]

export default function PlaybooksView({ playbooks: initialPlaybooks }: PlaybooksViewProps) {
  const [playbooks, setPlaybooks] = useState<Playbook[]>([...initialPlaybooks, ...MOCK_PLAYBOOKS])
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState<"all" | "published" | "draft">("all")
  const [view, setView] = useState<"grid" | "list">("grid")
  const [selectedPlaybook, setSelectedPlaybook] = useState<Playbook | null>(null)
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [newPlaybook, setNewPlaybook] = useState<Partial<Playbook>>({
    title: "",
    emoji: "📋",
    description: "",
    content: "",
    is_published: false,
    checklist: [],
    loom_url: "",
    examples: [],
  })

  const filteredPlaybooks = useMemo(() => {
    return playbooks.filter((p) => {
      const term = search.toLowerCase()
      const matchesSearch =
        !term ||
        p.title.toLowerCase().includes(term) ||
        (p.description?.toLowerCase().includes(term) ?? false) ||
        (p.content?.toLowerCase().includes(term) ?? false)
      const matchesStatus = statusFilter === "all" || (statusFilter === "published" ? p.is_published : !p.is_published)
      return matchesSearch && matchesStatus
    })
  }, [playbooks, search, statusFilter])

  const stats = useMemo(() => {
    return {
      total: playbooks.length,
      published: playbooks.filter((p) => p.is_published).length,
      draft: playbooks.filter((p) => !p.is_published).length,
      withVideo: playbooks.filter((p) => p.loom_url).length,
    }
  }, [playbooks])

  function togglePublish(id: string) {
    setPlaybooks((prev) => prev.map((p) => (p.id === id ? { ...p, is_published: !p.is_published } : p)))
  }

  function deletePlaybook(id: string) {
    if (confirm("Supprimer ce playbook ?")) {
      setPlaybooks((prev) => prev.filter((p) => p.id !== id))
      if (selectedPlaybook?.id === id) setSelectedPlaybook(null)
    }
  }

  function handleCreatePlaybook() {
    if (!newPlaybook.title || !newPlaybook.description) return
    const pb: Playbook = {
      id: `pb-${Date.now()}`,
      title: newPlaybook.title,
      emoji: newPlaybook.emoji || "📋",
      description: newPlaybook.description,
      content: newPlaybook.content || "",
      checklist: newPlaybook.checklist || [],
      position: playbooks.length,
      is_published: newPlaybook.is_published || false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      loom_url: newPlaybook.loom_url || null,
      examples: newPlaybook.examples || [],
    }
    setPlaybooks((prev) => [...prev, pb])
    setIsCreateOpen(false)
    setNewPlaybook({
      title: "",
      emoji: "📋",
      description: "",
      content: "",
      is_published: false,
      checklist: [],
      loom_url: "",
      examples: [],
    })
  }

  function toggleChecklistItem(playbookId: string, index: number) {
    setPlaybooks((prev) =>
      prev.map((p) => {
        if (p.id !== playbookId) return p
        const list = p.checklist ? [...p.checklist] : []
        list[index] = { ...list[index], required: !list[index]?.required }
        return { ...p, checklist: list }
      })
    )
  }

  const activeFiltersCount = (search ? 1 : 0) + (statusFilter !== "all" ? 1 : 0)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-white">Playbooks</h1>
          <p className="text-sm text-white/40">Process, fiches procédures et recettes internes EWA</p>
        </div>
        <button
          onClick={() => setIsCreateOpen(true)}
          className="flex items-center gap-2 rounded-xl bg-ewa-orange px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-ewa-orange/90"
        >
          <Plus className="h-4 w-4" />
          Nouveau playbook
        </button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-white/[0.08] bg-[hsl(0_0%_13%)] p-4">
          <div className="mb-2 flex items-center gap-2 text-white/40">
            <BookOpen className="h-4 w-4" />
            <span className="text-xs font-medium">Playbooks</span>
          </div>
          <p className="text-2xl font-semibold text-white">{stats.total}</p>
        </div>
        <div className="rounded-2xl border border-white/[0.08] bg-[hsl(0_0%_13%)] p-4">
          <div className="mb-2 flex items-center gap-2 text-white/40">
            <Eye className="h-4 w-4" />
            <span className="text-xs font-medium">Publiés</span>
          </div>
          <p className="text-2xl font-semibold text-white">{stats.published}</p>
        </div>
        <div className="rounded-2xl border border-white/[0.08] bg-[hsl(0_0%_13%)] p-4">
          <div className="mb-2 flex items-center gap-2 text-white/40">
            <EyeOff className="h-4 w-4" />
            <span className="text-xs font-medium">Brouillons</span>
          </div>
          <p className="text-2xl font-semibold text-white">{stats.draft}</p>
        </div>
        <div className="rounded-2xl border border-white/[0.08] bg-[hsl(0_0%_13%)] p-4">
          <div className="mb-2 flex items-center gap-2 text-white/40">
            <Film className="h-4 w-4" />
            <span className="text-xs font-medium">Avec Loom</span>
          </div>
          <p className="text-2xl font-semibold text-white">{stats.withVideo}</p>
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
              placeholder="Rechercher un playbook..."
              className="w-full rounded-xl border border-white/[0.08] bg-[hsl(0_0%_13%)] py-2.5 pl-10 pr-4 text-sm text-white placeholder:text-white/30 focus:border-ewa-orange/50 focus:outline-none"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)}
            className="rounded-xl border border-white/[0.08] bg-[hsl(0_0%_13%)] px-3 py-2.5 text-sm text-white outline-none focus:border-ewa-orange/50"
          >
            <option value="all">Tous les statuts</option>
            <option value="published">Publiés</option>
            <option value="draft">Brouillons</option>
          </select>

          {activeFiltersCount > 0 && (
            <button
              onClick={() => {
                setSearch("")
                setStatusFilter("all")
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

      {view === "grid" ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredPlaybooks.map((playbook) => (
            <div
              key={playbook.id}
              onClick={() => setSelectedPlaybook(playbook)}
              className="group relative cursor-pointer rounded-2xl border border-white/[0.08] bg-[hsl(0_0%_13%)] p-5 transition-all duration-300 hover:-translate-y-0.5 hover:border-white/[0.15] hover:shadow-[0_8px_30px_rgba(255,107,26,0.06)]"
            >
              <div className="mb-3 flex items-start justify-between">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/[0.04] text-2xl">
                  {playbook.emoji || "📋"}
                </div>
                <span
                  className={`rounded border px-2 py-0.5 text-[10px] font-medium ${
                    playbook.is_published
                      ? "bg-emerald-400/10 text-emerald-400 border-emerald-400/20"
                      : "bg-white/10 text-white/60 border-white/20"
                  }`}
                >
                  {playbook.is_published ? "Publié" : "Brouillon"}
                </span>
              </div>

              <p className="mb-1 font-medium text-white">{playbook.title}</p>
              <p className="mb-4 line-clamp-2 text-xs text-white/40">{playbook.description}</p>

              <div className="flex items-center gap-3 text-xs text-white/40">
                <span className="flex items-center gap-1">
                  <CheckCircle2 className="h-3 w-3" />
                  {playbook.checklist?.length || 0} items
                </span>
                {playbook.loom_url && (
                  <span className="flex items-center gap-1 text-ewa-orange">
                    <Film className="h-3 w-3" />
                    Loom
                  </span>
                )}
              </div>

              <div className="absolute right-3 top-3 opacity-0 transition-opacity group-hover:opacity-100"
              >
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    deletePlaybook(playbook.id)
                  }}
                  className="rounded-lg p-1.5 text-white/30 transition-colors hover:bg-red-400/10 hover:text-red-400"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-white/[0.08] bg-[hsl(0_0%_13%)]">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/[0.08] text-left text-white/40">
                  <th className="px-4 py-3 font-medium">Playbook</th>
                  <th className="px-4 py-3 font-medium">Description</th>
                  <th className="px-4 py-3 font-medium">Statut</th>
                  <th className="px-4 py-3 font-medium">Checklist</th>
                  <th className="px-4 py-3 font-medium">Loom</th>
                  <th className="px-4 py-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredPlaybooks.map((playbook) => (
                  <tr
                    key={playbook.id}
                    onClick={() => setSelectedPlaybook(playbook)}
                    className="cursor-pointer border-b border-white/[0.04] transition-colors hover:bg-white/[0.02]"
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <span className="text-xl">{playbook.emoji || "📋"}</span>
                        <span className="font-medium text-white">{playbook.title}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-white/60">{playbook.description}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`rounded border px-2 py-0.5 text-[10px] font-medium ${
                          playbook.is_published
                            ? "bg-emerald-400/10 text-emerald-400 border-emerald-400/20"
                            : "bg-white/10 text-white/60 border-white/20"
                        }`}
                      >
                        {playbook.is_published ? "Publié" : "Brouillon"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-white/60">{playbook.checklist?.length || 0} items</td>
                    <td className="px-4 py-3">
                      {playbook.loom_url ? (
                        <span className="flex items-center gap-1 text-xs text-ewa-orange">
                          <Film className="h-3 w-3" />
                          Oui
                        </span>
                      ) : (
                        <span className="text-xs text-white/30">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            togglePublish(playbook.id)
                          }}
                          className="rounded-lg p-1.5 text-white/40 transition-colors hover:bg-white/[0.08] hover:text-white"
                          title={playbook.is_published ? "Dépublier" : "Publier"}
                        >
                          {playbook.is_published ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            deletePlaybook(playbook.id)
                          }}
                          className="rounded-lg p-1.5 text-white/40 transition-colors hover:bg-red-400/10 hover:text-red-400"
                          title="Supprimer"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {filteredPlaybooks.length === 0 && (
        <div className="rounded-2xl border border-white/[0.08] bg-[hsl(0_0%_13%)] p-12 text-center">
          <BookOpen className="mx-auto mb-3 h-10 w-10 text-white/20" />
          <p className="text-sm text-white/40">Aucun playbook ne correspond aux filtres.</p>
        </div>
      )}

      {selectedPlaybook && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="flex h-[85vh] w-full max-w-3xl flex-col rounded-2xl border border-white/[0.08] bg-[hsl(0_0%_10%)] shadow-2xl">
            <div className="flex items-start justify-between border-b border-white/[0.08] p-6">
              <div className="flex items-center gap-4">
                <span className="text-4xl">{selectedPlaybook.emoji || "📋"}</span>
                <div>
                  <h2 className="text-lg font-semibold text-white">{selectedPlaybook.title}</h2>
                  <p className="text-sm text-white/40">{selectedPlaybook.description}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedPlaybook(null)}
                className="rounded-lg p-1.5 text-white/40 hover:bg-white/[0.08] hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              <div className="mb-6 flex items-center gap-3">
                <span
                  className={`rounded border px-2 py-0.5 text-[11px] font-medium ${
                    selectedPlaybook.is_published
                      ? "bg-emerald-400/10 text-emerald-400 border-emerald-400/20"
                      : "bg-white/10 text-white/60 border-white/20"
                  }`}
                >
                  {selectedPlaybook.is_published ? "Publié" : "Brouillon"}
                </span>
                {selectedPlaybook.loom_url && (
                  <a
                    href={selectedPlaybook.loom_url}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1 rounded border border-ewa-orange/20 bg-ewa-orange/10 px-2 py-0.5 text-[11px] font-medium text-ewa-orange transition-colors hover:bg-ewa-orange/20"
                  >
                    <Film className="h-3 w-3" />
                    Voir la vidéo Loom
                  </a>
                )}
              </div>

              <div className="mb-6">
                <h3 className="mb-2 text-sm font-semibold text-white">Contenu</h3>
                <div className="whitespace-pre-line rounded-xl border border-white/[0.08] bg-[hsl(0_0%_13%)] p-4 text-sm leading-relaxed text-white/70">
                  {selectedPlaybook.content || "Aucun contenu rédigé."}
                </div>
              </div>

              <div className="mb-6">
                <h3 className="mb-2 text-sm font-semibold text-white">Checklist</h3>
                <div className="space-y-2">
                  {selectedPlaybook.checklist?.map((item, index) => (
                    <button
                      key={index}
                      onClick={() => toggleChecklistItem(selectedPlaybook.id, index)}
                      className="flex w-full items-center gap-3 rounded-xl border border-white/[0.08] bg-[hsl(0_0%_13%)] p-3 text-left text-sm transition-colors hover:bg-white/[0.02]"
                    >
                      <div
                        className={`flex h-5 w-5 shrink-0 items-center justify-center rounded border ${
                          item.required
                            ? "border-emerald-400/30 bg-emerald-400/10 text-emerald-400"
                            : "border-white/20 bg-transparent text-transparent"
                        }`}
                      >
                        <CheckCircle2 className="h-3.5 w-3.5" />
                      </div>
                      <span className={`text-white/70 ${item.required ? "line-through text-white/40" : ""}`}>{item.label}</span>
                    </button>
                  )) || <p className="text-sm text-white/30">Aucune checklist.</p>}
                </div>
              </div>

              {selectedPlaybook.examples && selectedPlaybook.examples.length > 0 && (
                <div className="mb-6">
                  <h3 className="mb-2 text-sm font-semibold text-white">Exemples</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedPlaybook.examples.map((ex, i) => (
                      <a
                        key={i}
                        href={ex.url}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-1.5 rounded-xl border border-white/[0.08] bg-[hsl(0_0%_13%)] px-3 py-2 text-sm text-white/70 transition-colors hover:bg-white/[0.04] hover:text-white"
                      >
                        <ExternalLink className="h-3.5 w-3.5 text-ewa-orange" />
                        {ex.label}
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between border-t border-white/[0.08] p-4">
              <span className="text-xs text-white/40">
                Mis à jour {new Date(selectedPlaybook.updated_at).toLocaleDateString("fr-FR")}
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => togglePublish(selectedPlaybook.id)}
                  className="rounded-xl border border-white/[0.08] bg-transparent px-4 py-2 text-sm font-medium text-white/70 transition-colors hover:bg-white/[0.04]"
                >
                  {selectedPlaybook.is_published ? "Dépublier" : "Publier"}
                </button>
                <button
                  onClick={() => setSelectedPlaybook(null)}
                  className="rounded-xl bg-ewa-orange px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-ewa-orange/90"
                >
                  Fermer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {isCreateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl border border-white/[0.08] bg-[hsl(0_0%_10%)] p-6 shadow-2xl">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-white">Nouveau playbook</h2>
              <button onClick={() => setIsCreateOpen(false)} className="rounded-lg p-1.5 text-white/40 hover:bg-white/[0.08] hover:text-white">
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-5 gap-3">
                <div className="col-span-1">
                  <label className="mb-1 block text-xs font-medium text-white/60">Emoji</label>
                  <input
                    type="text"
                    value={newPlaybook.emoji || ""}
                    onChange={(e) => setNewPlaybook((prev) => ({ ...prev, emoji: e.target.value }))}
                    className="w-full rounded-xl border border-white/[0.08] bg-[hsl(0_0%_13%)] px-3 py-2 text-center text-lg text-white outline-none focus:border-ewa-orange/50"
                    maxLength={2}
                  />
                </div>
                <div className="col-span-4">
                  <label className="mb-1 block text-xs font-medium text-white/60">Titre</label>
                  <input
                    type="text"
                    value={newPlaybook.title || ""}
                    onChange={(e) => setNewPlaybook((prev) => ({ ...prev, title: e.target.value }))}
                    className="w-full rounded-xl border border-white/[0.08] bg-[hsl(0_0%_13%)] px-3 py-2 text-sm text-white outline-none focus:border-ewa-orange/50"
                    placeholder="Titre du playbook"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-white/60">Description</label>
                <input
                  type="text"
                  value={newPlaybook.description || ""}
                  onChange={(e) => setNewPlaybook((prev) => ({ ...prev, description: e.target.value }))}
                  className="w-full rounded-xl border border-white/[0.08] bg-[hsl(0_0%_13%)] px-3 py-2 text-sm text-white outline-none focus:border-ewa-orange/50"
                  placeholder="Description courte"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-white/60">Contenu / Procédure</label>
                <textarea
                  value={newPlaybook.content || ""}
                  onChange={(e) => setNewPlaybook((prev) => ({ ...prev, content: e.target.value }))}
                  className="w-full rounded-xl border border-white/[0.08] bg-[hsl(0_0%_13%)] px-3 py-2 text-sm text-white outline-none focus:border-ewa-orange/50"
                  rows={5}
                  placeholder="Étapes, instructions, notes..."
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-white/60">URL Loom (optionnel)</label>
                <input
                  type="text"
                  value={newPlaybook.loom_url || ""}
                  onChange={(e) => setNewPlaybook((prev) => ({ ...prev, loom_url: e.target.value }))}
                  className="w-full rounded-xl border border-white/[0.08] bg-[hsl(0_0%_13%)] px-3 py-2 text-sm text-white outline-none focus:border-ewa-orange/50"
                  placeholder="https://www.loom.com/share/..."
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  id="pb-published"
                  type="checkbox"
                  checked={newPlaybook.is_published || false}
                  onChange={(e) => setNewPlaybook((prev) => ({ ...prev, is_published: e.target.checked }))}
                  className="h-4 w-4 rounded border-white/[0.08] bg-[hsl(0_0%_13%)] text-ewa-orange focus:ring-ewa-orange"
                />
                <label htmlFor="pb-published" className="text-sm text-white/70">Publier immédiatement</label>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-2">
              <button
                onClick={() => setIsCreateOpen(false)}
                className="rounded-xl border border-white/[0.08] bg-transparent px-4 py-2 text-sm font-medium text-white/70 transition-colors hover:bg-white/[0.04]"
              >
                Annuler
              </button>
              <button
                onClick={handleCreatePlaybook}
                className="rounded-xl bg-ewa-orange px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-ewa-orange/90"
              >
                Créer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
