"use client"

import { useState, useMemo } from "react"
import {
  BarChart4,
  TrendingUp,
  Users,
  Briefcase,
  RefreshCw,
  Package,
  Rocket,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  Film,
  Upload,
  HardDrive,
} from "lucide-react"

interface Editor {
  id: string
  name: string | null
}

interface Client {
  id: string
  name: string | null
  company: string | null
  source: string | null
}

interface AnalyticsViewProps {
  editors: Editor[]
  clients: Client[]
}

const MONTHLY_DATA = [
  { month: "Oct 25", revenue: 12500, margin: 3200 },
  { month: "Nov 25", revenue: 18200, margin: 5100 },
  { month: "Déc 25", revenue: 24800, margin: 7400 },
  { month: "Jan 26", revenue: 22100, margin: 6100 },
  { month: "Fév 26", revenue: 28900, margin: 8900 },
  { month: "Mar 26", revenue: 33400, margin: 10200 },
  { month: "Avr 26", revenue: 29800, margin: 8400 },
  { month: "Mai 26", revenue: 36100, margin: 11200 },
  { month: "Jun 26", revenue: 41200, margin: 13500 },
  { month: "Juil 26", revenue: 20900, margin: 5200 },
]

const UPLOAD_TREND = [
  { month: "Aoû", uploads: 120 },
  { month: "Sep", uploads: 180 },
  { month: "Oct", uploads: 240 },
  { month: "Nov", uploads: 310 },
  { month: "Déc", uploads: 380 },
  { month: "Jan", uploads: 290 },
  { month: "Fév", uploads: 420 },
  { month: "Mar", uploads: 510 },
  { month: "Avr", uploads: 460 },
  { month: "Mai", uploads: 620 },
  { month: "Jun", uploads: 780 },
  { month: "Juil", uploads: 430 },
]

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(amount)
}

function formatCompactCurrency(amount: number) {
  return new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR", notation: "compact", maximumFractionDigits: 1 }).format(amount)
}

function hashString(str: string) {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = (hash << 5) - hash + char
    hash |= 0
  }
  return Math.abs(hash)
}

function generateEditorStats(editors: Editor[]) {
  const sorted = [...editors].sort((a, b) => (a.name || "").localeCompare(b.name || ""))
  return sorted.slice(0, 5).map((editor, index) => {
    const h = hashString(editor.id)
    const count = 20 + (h % 110)
    const trend = index === 0 ? `+${19 + (h % 15)}` : undefined
    return { name: editor.name || "Monteur", count, trend }
  })
}

function generateClientVolume(clients: Client[]) {
  return clients
    .slice(0, 8)
    .map((client) => {
      const h = hashString(client.id)
      return {
        name: client.name || client.company || "Client",
        volume: h % 800,
      }
    })
    .sort((a, b) => b.volume - a.volume)
}

function generateSources(clients: Client[]) {
  const counts: Record<string, number> = {}
  for (const client of clients) {
    const source = client.source || "Autre"
    counts[source] = (counts[source] || 0) + 1
  }
  const entries = Object.entries(counts).sort((a, b) => b[1] - a[1])
  return entries.slice(0, 4).map(([source, count]) => ({ source, count }))
}

export default function AnalyticsView({ editors, clients }: AnalyticsViewProps) {
  const [period, setPeriod] = useState<"12m" | "6m" | "3m" | "1m">("12m")

  const caTotal = useMemo(() => MONTHLY_DATA.reduce((acc, m) => acc + m.revenue, 0), [])
  const margeTotal = useMemo(() => MONTHLY_DATA.reduce((acc, m) => acc + m.margin, 0), [])
  const depensesTotal = caTotal - margeTotal
  const margePct = Math.round((margeTotal / caTotal) * 100)
  const editorPayments = Math.round(caTotal * 0.49)

  const editorStats = useMemo(() => generateEditorStats(editors), [editors])
  const clientVolume = useMemo(() => generateClientVolume(clients), [clients])
  const sources = useMemo(() => generateSources(clients), [clients])

  const maxRevenue = Math.max(...MONTHLY_DATA.map((m) => Math.max(m.revenue, m.margin)))
  const maxUpload = Math.max(...UPLOAD_TREND.map((m) => m.uploads))
  const maxClientVolume = Math.max(...clientVolume.map((c) => c.volume), 1)

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-lg font-semibold text-white">Analytics</h1>
          <p className="text-sm text-white/40">Vue d'ensemble des performances de l'agence</p>
        </div>

        <div className="flex items-center gap-1 rounded-xl border border-white/[0.08] bg-[hsl(0_0%_13%)] p-1">
          {[
            { id: "1m", label: "1M" },
            { id: "3m", label: "3M" },
            { id: "6m", label: "6M" },
            { id: "12m", label: "12M" },
          ].map((p) => (
            <button
              key={p.id}
              onClick={() => setPeriod(p.id as typeof period)}
              className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                period === p.id ? "bg-ewa-orange text-white" : "text-white/50 hover:bg-white/[0.06] hover:text-white"
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <div className="rounded-2xl border border-white/[0.08] bg-[hsl(0_0%_13%)] p-4">
          <div className="mb-2 flex items-center gap-2 text-white/40">
            <TrendingUp className="h-4 w-4" />
            <span className="text-xs font-medium">CA encaissé</span>
          </div>
          <p className="text-2xl font-semibold text-white">{formatCompactCurrency(caTotal)}</p>
          <p className="mt-1 text-xs text-white/30">total Qonto</p>
        </div>

        <div className="rounded-2xl border border-white/[0.08] bg-[hsl(0_0%_13%)] p-4">
          <div className="mb-2 flex items-center gap-2 text-white/40">
            <ArrowDownRight className="h-4 w-4" />
            <span className="text-xs font-medium">Dépenses totales</span>
          </div>
          <p className="text-2xl font-semibold text-white">{formatCompactCurrency(depensesTotal)}</p>
          <p className="mt-1 text-xs text-white/30">total Qonto</p>
        </div>

        <div className="rounded-2xl border border-white/[0.08] bg-[hsl(0_0%_13%)] p-4">
          <div className="mb-2 flex items-center gap-2 text-white/40">
            <TrendingUp className="h-4 w-4" />
            <span className="text-xs font-medium">Marge nette</span>
          </div>
          <p className="text-2xl font-semibold text-white">{formatCompactCurrency(margeTotal)}</p>
          <p className="mt-1 text-xs text-white/30">{margePct}% du CA</p>
        </div>

        <div className="rounded-2xl border border-white/[0.08] bg-[hsl(0_0%_13%)] p-4">
          <div className="mb-2 flex items-center gap-2 text-white/40">
            <Users className="h-4 w-4" />
            <span className="text-xs font-medium">Monteurs</span>
          </div>
          <p className="text-2xl font-semibold text-white">{formatCompactCurrency(editorPayments)}</p>
          <p className="mt-1 text-xs text-white/30">paiements éditeurs</p>
        </div>

        <div className="rounded-2xl border border-white/[0.08] bg-[hsl(0_0%_13%)] p-4">
          <div className="mb-2 flex items-center gap-2 text-white/40">
            <Briefcase className="h-4 w-4" />
            <span className="text-xs font-medium">Projets</span>
          </div>
          <p className="text-2xl font-semibold text-white">0</p>
          <p className="mt-1 text-xs text-white/30">0 livrés · 0 actifs</p>
        </div>

        <div className="rounded-2xl border border-white/[0.08] bg-[hsl(0_0%_13%)] p-4">
          <div className="mb-2 flex items-center gap-2 text-white/40">
            <RefreshCw className="h-4 w-4" />
            <span className="text-xs font-medium">Retouches</span>
          </div>
          <p className="text-2xl font-semibold text-white">0%</p>
          <p className="mt-1 text-xs text-white/30">0 projets</p>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2 rounded-2xl border border-white/[0.08] bg-[hsl(0_0%_13%)] p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-white">Évolution CA & Marge</h2>
            <div className="flex items-center gap-4 text-xs">
              <span className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-emerald-400" />
                CA
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-ewa-orange" />
                Marge
              </span>
            </div>
          </div>

          <div className="flex h-56 items-end justify-between gap-2">
            {MONTHLY_DATA.map((month) => (
              <div key={month.month} className="flex flex-1 flex-col items-center gap-2">
                <div className="relative flex w-full items-end justify-center gap-1">
                  <div
                    className="w-3 rounded-t bg-emerald-400/80"
                    style={{ height: `${(month.revenue / maxRevenue) * 100}%` }}
                  />
                  <div
                    className="w-3 rounded-t bg-ewa-orange/80"
                    style={{ height: `${(month.margin / maxRevenue) * 100}%` }}
                  />
                </div>
                <span className="text-[11px] text-white/40">{month.month}</span>
              </div>
            ))}
          </div>

          <div className="mt-4 flex justify-between text-xs text-white/30">
            <span>-15k</span>
            <span>0k</span>
            <span>15k</span>
            <span>30k</span>
            <span>45k</span>
          </div>
        </div>

        <div className="rounded-2xl border border-white/[0.08] bg-[hsl(0_0%_13%)] p-5">
          <div className="mb-4 flex items-center gap-2">
            <Users className="h-4 w-4 text-ewa-orange" />
            <h2 className="text-sm font-semibold text-white">Sources d'acquisition</h2>
          </div>

          <div className="space-y-4">
            {sources.map((source) => (
              <div key={source.source}>
                <div className="mb-1 flex items-center justify-between text-sm">
                  <span className="text-white/70">{source.source}</span>
                  <span className="font-medium text-white">{source.count} clients</span>
                </div>
                <p className="text-xs text-white/30">0€</p>
              </div>
            ))}
            {sources.length === 0 && (
              <p className="text-sm text-white/30">Aucune source disponible.</p>
            )}
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-white/[0.08] bg-[hsl(0_0%_13%)] p-5">
        <div className="mb-4 flex items-center gap-2">
          <Film className="h-4 w-4 text-ewa-orange" />
          <h2 className="text-sm font-semibold text-white">Production Frame.io</h2>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-xl border border-white/[0.08] bg-[hsl(0_0%_10%)] p-4">
            <div className="mb-2 flex items-center gap-2 text-white/40">
              <Film className="h-4 w-4" />
              <span className="text-xs font-medium">Fichiers total</span>
            </div>
            <p className="text-2xl font-semibold text-white">3 567</p>
          </div>
          <div className="rounded-xl border border-white/[0.08] bg-[hsl(0_0%_10%)] p-4">
            <div className="mb-2 flex items-center gap-2 text-white/40">
              <Upload className="h-4 w-4" />
              <span className="text-xs font-medium">Uploads ce mois</span>
            </div>
            <p className="text-2xl font-semibold text-white">45</p>
          </div>
          <div className="rounded-xl border border-white/[0.08] bg-[hsl(0_0%_10%)] p-4">
            <div className="mb-2 flex items-center gap-2 text-white/40">
              <HardDrive className="h-4 w-4" />
              <span className="text-xs font-medium">Volume total</span>
            </div>
            <p className="text-2xl font-semibold text-white">795.7 Go</p>
          </div>
          <div className="rounded-xl border border-white/[0.08] bg-[hsl(0_0%_10%)] p-4">
            <div className="mb-2 flex items-center gap-2 text-white/40">
              <Users className="h-4 w-4" />
              <span className="text-xs font-medium">Monteurs actifs</span>
            </div>
            <p className="text-2xl font-semibold text-white">{editors.length}</p>
          </div>
        </div>

        <div className="mt-5">
          <p className="mb-3 text-sm font-medium text-white">Tendance uploads — 12 mois</p>
          <div className="flex h-40 items-end justify-between gap-2">
            {UPLOAD_TREND.map((month) => (
              <div key={month.month} className="flex flex-1 flex-col items-center gap-2">
                <div
                  className="w-full rounded-t bg-ewa-orange/80"
                  style={{ height: `${(month.uploads / maxUpload) * 100}%` }}
                />
                <span className="text-[11px] text-white/40">{month.month}</span>
              </div>
            ))}
          </div>
          <div className="mt-2 flex justify-between text-xs text-white/30">
            <span>0</span>
            <span>250</span>
            <span>500</span>
            <span>750</span>
            <span>1000</span>
          </div>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border border-white/[0.08] bg-[hsl(0_0%_13%)] p-5">
          <div className="mb-4 flex items-center gap-2">
            <Users className="h-4 w-4 text-blue-400" />
            <h2 className="text-sm font-semibold text-white">Productivité monteurs</h2>
          </div>

          <div className="space-y-3">
            {editorStats.map((editor, index) => (
              <div key={editor.name} className="flex items-center justify-between rounded-xl border border-white/[0.06] bg-[hsl(0_0%_10%)] p-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-ewa-orange/10 text-xs font-medium text-ewa-orange">
                    {index + 1}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">{editor.name}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-white">{editor.count}</span>
                  {editor.trend && (
                    <span className="text-xs font-medium text-emerald-400">{editor.trend}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-white/[0.08] bg-[hsl(0_0%_13%)] p-5">
          <div className="mb-4 flex items-center gap-2">
            <BarChart4 className="h-4 w-4 text-purple-400" />
            <h2 className="text-sm font-semibold text-white">Volume production par client</h2>
          </div>

          <div className="space-y-4">
            {clientVolume.map((client) => (
              <div key={client.name}>
                <div className="mb-1 flex items-center justify-between text-sm">
                  <span className="text-white/70">{client.name}</span>
                </div>
                <div className="h-2 w-full rounded-full bg-white/[0.08]">
                  <div
                    className="h-full rounded-full bg-ewa-orange"
                    style={{ width: `${(client.volume / maxClientVolume) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-white/[0.08] bg-[hsl(0_0%_13%)] p-4">
          <div className="mb-2 text-2xl">🚀</div>
          <p className="text-xs text-white/40">Délai moyen livraison</p>
          <p className="text-xl font-semibold text-white">0j</p>
        </div>
        <div className="rounded-2xl border border-white/[0.08] bg-[hsl(0_0%_13%)] p-4">
          <div className="mb-2 text-2xl">📦</div>
          <p className="text-xs text-white/40">Projets livrés</p>
          <p className="text-xl font-semibold text-white">0</p>
        </div>
        <div className="rounded-2xl border border-white/[0.08] bg-[hsl(0_0%_13%)] p-4">
          <div className="mb-2 text-2xl">🔄</div>
          <p className="text-xs text-white/40">En retouches</p>
          <p className="text-xl font-semibold text-white">0</p>
        </div>
        <div className="rounded-2xl border border-white/[0.08] bg-[hsl(0_0%_13%)] p-4">
          <div className="mb-2 text-2xl">👥</div>
          <p className="text-xs text-white/40">Clients total</p>
          <p className="text-xl font-semibold text-white">{clients.length}</p>
        </div>
      </div>
    </div>
  )
}
