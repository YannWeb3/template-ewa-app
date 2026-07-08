"use client"

import { useState } from "react"
import {
  Film,
  ExternalLink,
  FolderOpen,
  Users,
  Clock,
  CheckCircle2,
  AlertCircle,
  FileVideo,
  ChevronRight,
  ShieldCheck,
} from "lucide-react"

const FRAMEIO_AUTH_URL =
  "https://accounts.frame.io/welcome?auth_callback=https%3A%2F%2Fnext.frame.io%2Fauth%2Fcallback&redirect_path=%2F"

const RECENT_FILES = [
  {
    id: "f1",
    name: "Campagne Printemps 2026 — V1",
    project: "L'Oréal",
    updated: "Aujourd'hui, 14:30",
    editor: "Camille",
    status: "review",
  },
  {
    id: "f2",
    name: "Spot Publicitaire — Director's Cut",
    project: "Nike",
    updated: "Hier, 09:15",
    editor: "Matt",
    status: "approved",
  },
  {
    id: "f3",
    name: "Série Reels Q3 — Épisode 3",
    project: "Gymshark",
    updated: "Il y a 2j",
    editor: "Léo",
    status: "approved",
  },
  {
    id: "f4",
    name: "Motion Design Saison 2 — Intro",
    project: "Spotify",
    updated: "Aujourd'hui, 11:00",
    editor: "Ambre",
    status: "review",
  },
]

const EDITOR_ACTIVITY = [
  { name: "Camille", files: 4, lastActive: "Il y a 20 min", online: true },
  { name: "Matt", files: 3, lastActive: "Il y a 1h", online: true },
  { name: "Léo", files: 2, lastActive: "Il y a 3h", online: false },
  { name: "Ambre", files: 5, lastActive: "Aujourd'hui", online: true },
]

const statusConfig: Record<string, { label: string; badge: string; icon: React.ElementType }> = {
  review: { label: "En review", badge: "bg-amber-400/10 text-amber-400 border-amber-400/20", icon: AlertCircle },
  approved: { label: "Validé", badge: "bg-emerald-400/10 text-emerald-400 border-emerald-400/20", icon: CheckCircle2 },
}

export default function FrameioPage() {
  const [hoveredFile, setHoveredFile] = useState<string | null>(null)

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-lg font-semibold text-white">Frame.io</h1>
          <p className="text-sm text-white/40">Gestion des fichiers de production et suivi monteurs</p>
        </div>

        <a
          href={FRAMEIO_AUTH_URL}
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-2 rounded-xl bg-[#2B2B2B] px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#3B3B3B]"
        >
          <ShieldCheck className="h-4 w-4 text-emerald-400" />
          Connecté : EWA
          <ExternalLink className="ml-1 h-3.5 w-3.5 text-white/50" />
        </a>
      </div>

      <div className="rounded-2xl border border-white/[0.08] bg-[hsl(0_0%_13%)] p-6">
        <div className="mb-6 flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#2B2B2B]">
            <Film className="h-7 w-7 text-white" />
          </div>
          <div>
            <p className="text-base font-medium text-white">Frame.io est connecté à EWA</p>
            <p className="text-sm text-white/40">Accédez à vos projets, reviews et fichiers de production directement depuis Frame.io.</p>
          </div>
        </div>

        <a
          href={FRAMEIO_AUTH_URL}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-2 rounded-xl bg-ewa-orange px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-ewa-orange/90"
        >
          Ouvrir Frame.io
          <ExternalLink className="h-4 w-4" />
        </a>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 rounded-2xl border border-white/[0.08] bg-[hsl(0_0%_13%)]">
          <div className="flex items-center justify-between border-b border-white/[0.08] p-5">
            <div className="flex items-center gap-2">
              <FolderOpen className="h-4 w-4 text-white/40" />
              <h2 className="text-sm font-semibold text-white">Fichiers récents</h2>
            </div>
            <span className="text-xs text-white/40">{RECENT_FILES.length} fichiers</span>
          </div>

          <div className="divide-y divide-white/[0.04]">
            {RECENT_FILES.map((file) => {
              const status = statusConfig[file.status]
              const StatusIcon = status.icon
              const isHovered = hoveredFile === file.id

              return (
                <a
                  key={file.id}
                  href={FRAMEIO_AUTH_URL}
                  target="_blank"
                  rel="noreferrer"
                  onMouseEnter={() => setHoveredFile(file.id)}
                  onMouseLeave={() => setHoveredFile(null)}
                  className="flex items-center justify-between p-4 transition-colors hover:bg-white/[0.02]"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[hsl(0_0%_17%)]">
                      <FileVideo className="h-5 w-5 text-white/40" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white">{file.name}</p>
                      <p className="text-xs text-white/40">{file.project} · mis à jour {file.updated}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <span className={`hidden sm:inline-flex items-center gap-1 rounded border px-2 py-0.5 text-[11px] font-medium ${status.badge}`}>
                      <StatusIcon className="h-3 w-3" />
                      {status.label}
                    </span>
                    <ChevronRight className={`h-4 w-4 text-white/30 transition-transform ${isHovered ? "translate-x-0.5 text-white/60" : ""}`} />
                  </div>
                </a>
              )
            })}
          </div>
        </div>

        <div className="rounded-2xl border border-white/[0.08] bg-[hsl(0_0%_13%)]">
          <div className="flex items-center gap-2 border-b border-white/[0.08] p-5">
            <Users className="h-4 w-4 text-white/40" />
            <h2 className="text-sm font-semibold text-white">Activité monteurs</h2>
          </div>

          <div className="divide-y divide-white/[0.04]">
            {EDITOR_ACTIVITY.map((editor) => (
              <div key={editor.name} className="flex items-center justify-between p-4">
                <div className="flex items-center gap-3">
                  <div className="relative flex h-9 w-9 items-center justify-center rounded-full bg-ewa-orange/10 text-xs font-medium text-ewa-orange">
                    {editor.name.slice(0, 2).toUpperCase()}
                    {editor.online && (
                      <span className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full border-2 border-[hsl(0_0%_13%)] bg-emerald-400" />
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">{editor.name}</p>
                    <p className="text-xs text-white/40">{editor.lastActive}</p>
                  </div>
                </div>
                <span className="text-xs text-white/60">{editor.files} fichiers</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {[
          { label: "Projets actifs", value: "6", icon: FolderOpen },
          { label: "Fichiers en review", value: "12", icon: AlertCircle },
          { label: "Validations cette semaine", value: "8", icon: CheckCircle2 },
        ].map((stat) => {
          const Icon = stat.icon
          return (
            <div key={stat.label} className="rounded-2xl border border-white/[0.08] bg-[hsl(0_0%_13%)] p-4">
              <div className="mb-2 flex items-center gap-2 text-white/40">
                <Icon className="h-4 w-4" />
                <span className="text-xs font-medium">{stat.label}</span>
              </div>
              <p className="text-2xl font-semibold text-white">{stat.value}</p>
            </div>
          )
        })}
      </div>
    </div>
  )
}
