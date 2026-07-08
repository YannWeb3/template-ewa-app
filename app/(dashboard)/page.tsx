"use client"

import { useState } from "react"
import {
  Euro,
  Wallet,
  TrendingDown,
  Video,
  RotateCcw,
  ArrowDown,
  ArrowUp,
  TrendingUp,
  BarChart4,
  PieChart,
  AlertTriangle,
  Crown,
  Users,
  CalendarDays,
  Landmark,
  FileText,
  Receipt,
  PiggyBank,
} from "lucide-react"
import { Card } from "@/components/ui/card"
import { formatCurrency } from "@/lib/utils"

const currentMonthLabel = "Juillet 2026"

const kpiData = [
  {
    icon: Euro,
    label: "CA encaissé",
    value: 3195,
    change: -91,
    changeLabel: "vs mois dernier",
    changeColor: "text-red-400/80",
    sub: "0 projets actifs",
  },
  {
    icon: Wallet,
    label: "Dépenses",
    value: 10945,
    change: -28,
    changeLabel: "vs mois dernier",
    changeColor: "text-emerald-400/80",
    sub: "0 clients actifs",
  },
  {
    icon: TrendingDown,
    label: "Résultat net",
    value: -7750,
    change: -140,
    changeLabel: "vs mois dernier",
    changeColor: "text-red-400/80",
    sub: "Marge -242.6%",
  },
  {
    icon: Video,
    label: "Production",
    value: 0,
    sub: "0 en cours · Charge équipe 0%",
    isCount: true,
  },
  {
    icon: RotateCcw,
    label: "Taux de retouche",
    value: 0,
    sub: "0 projets concernés",
    isPercent: true,
  },
]

const evolutionData = [
  { month: "Juil 25", revenus: 8500, depenses: 6200 },
  { month: "Août 25", revenus: 10200, depenses: 7800 },
  { month: "Sept 25", revenus: 7600, depenses: 8100 },
  { month: "Oct 25", revenus: 12400, depenses: 9100 },
  { month: "Nov 25", revenus: 15100, depenses: 9800 },
  { month: "Déc 25", revenus: 18900, depenses: 10500 },
  { month: "Jan 26", revenus: 11200, depenses: 9200 },
  { month: "Fév 26", revenus: 9800, depenses: 8800 },
  { month: "Mar 26", revenus: 14300, depenses: 10100 },
  { month: "Avr 26", revenus: 17500, depenses: 11500 },
  { month: "Mai 26", revenus: 20100, depenses: 12200 },
  { month: "Juin 26", revenus: 16800, depenses: 10900 },
]
const maxEvolutionValue = Math.max(...evolutionData.flatMap((d) => [d.revenus, d.depenses]))

const formatRepartition = [
  { label: "Reels / Shorts", value: 42, color: "bg-ewa-orange", amount: 13420 },
  { label: "Long format", value: 28, color: "bg-blue-400", amount: 8940 },
  { label: "Motion design", value: 18, color: "bg-purple-400", amount: 5750 },
  { label: "Tournage", value: 8, color: "bg-emerald-400", amount: 2560 },
  { label: "Autres", value: 4, color: "bg-white/25", amount: 1280 },
]

const urgentProjects = [
  { name: "Campagne MediaProd", client: "MediaProd", deadline: "Aujourd'hui", status: "En attente validation" },
  { name: "Série TechCorp Q3", client: "TechCorp", deadline: "Demain", status: "Montage en cours" },
  { name: "Reels BrandStudio", client: "BrandStudio", deadline: "3 jours", status: "Retour client" },
  { name: "Teaser EventLive", client: "EventLive", deadline: "5 jours", status: "À planifier" },
]

const topClients = [
  { name: "TechCorp", ca: 42150, projects: 12 },
  { name: "MediaProd", ca: 28900, projects: 8 },
  { name: "BrandStudio", ca: 18400, projects: 5 },
  { name: "EventLive", ca: 12600, projects: 3 },
  { name: "CreativAgency", ca: 8400, projects: 2 },
]

const editorPerformance = [
  { name: "Alex", livrees: 18, retouche: 5, satisfaction: 96 },
  { name: "Sam", livrees: 14, retouche: 8, satisfaction: 92 },
  { name: "Jordan", livrees: 12, retouche: 2, satisfaction: 98 },
  { name: "Taylor", livrees: 9, retouche: 12, satisfaction: 87 },
]

const chargesRepartition = [
  { label: "Freelances", value: 5200, color: "bg-ewa-orange" },
  { label: "Abonnements", value: 1200, color: "bg-blue-400" },
  { label: "Loyer & charges", value: 2400, color: "bg-purple-400" },
  { label: "Matériel", value: 950, color: "bg-emerald-400" },
  { label: "Autres", value: 1195, color: "bg-white/25" },
]
const totalCharges = chargesRepartition.reduce((acc, c) => acc + c.value, 0)

const compteResultat = [
  { month: "Fév 26", revenus: 9800, depenses: 8800 },
  { month: "Mar 26", revenus: 14300, depenses: 10100 },
  { month: "Avr 26", revenus: 17500, depenses: 11500 },
  { month: "Mai 26", revenus: 20100, depenses: 12200 },
  { month: "Juin 26", revenus: 16800, depenses: 10900 },
  { month: "Juil 26", revenus: 3195, depenses: 10945 },
]
const maxCompteResultatValue = Math.max(...compteResultat.flatMap((d) => [d.revenus, d.depenses]))

const impotsPrevoir = [
  { label: "TVA à décaisser", amount: 2840, due: "31 juil. 2026" },
  { label: "CFE provision", amount: 1200, due: "15 déc. 2026" },
  { label: "Impôt société provision", amount: 0, due: "—" },
]

const tresorerie = {
  solde: 34280,
  previsionnel30j: 28900,
  previsionnel60j: 36100,
  encoursFactures: 18400,
}

function ChangeIndicator({ value }: { value: number }) {
  const positive = value >= 0
  return (
    <span className={`inline-flex items-center gap-0.5 text-[11px] font-medium ${positive ? "text-emerald-400/80" : "text-red-400/80"}`}>
      {positive ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />}
      {Math.abs(value)}% vs mois dernier
    </span>
  )
}

export default function DashboardPage() {
  const [selectedMonth, setSelectedMonth] = useState(currentMonthLabel)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-lg font-semibold text-white">Tableau de bord</h1>
          <p className="text-sm text-white/40">Vue d'ensemble de l'activité EWA</p>
        </div>
        <div className="flex items-center gap-2 rounded-xl border border-white/[0.08] bg-[hsl(0_0%_13%)] px-3 py-2">
          <CalendarDays className="h-4 w-4 text-white/40" />
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="bg-transparent text-sm font-medium text-white outline-none"
          >
            <option>{currentMonthLabel}</option>
            <option>Juin 2026</option>
            <option>Mai 2026</option>
          </select>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 items-stretch gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {kpiData.map((kpi, i) => (
          <div
            key={i}
            className="group flex h-full flex-col rounded-2xl border border-white/[0.08] bg-[hsl(0_0%_13%)] transition-all duration-300 hover:-translate-y-0.5 hover:border-white/[0.15] hover:shadow-[0_8px_30px_rgba(255,107,26,0.06)]"
          >
            <div className="flex items-center justify-between px-4 py-2">
              <div className="flex items-center gap-2">
                <kpi.icon className="h-3.5 w-3.5 text-white/35 transition-colors duration-300 group-hover:text-ewa-orange/60" />
                <span className="text-[12px] font-medium text-white/45">{kpi.label}</span>
              </div>
            </div>
            <div className="flex-1 px-1.5 pb-1.5">
              <div className="relative flex h-full min-h-[82px] flex-col rounded-xl border border-white/[0.10] bg-[hsl(0_0%_6.5%)] px-4 pb-4 pt-3.5 shadow-[0_0_0_1px_rgba(255,255,255,0.04),0_0_20px_rgba(255,255,255,0.03),inset_0_1px_0_rgba(255,255,255,0.06)]">
                <p className="text-2xl font-bold tracking-tight text-white">
                  {kpi.isCount ? `${kpi.value} livrées` : kpi.isPercent ? `${kpi.value}%` : formatCurrency(kpi.value)}
                </p>
                <div className="mt-2 space-y-0.5">
                  {kpi.change !== undefined && <ChangeIndicator value={kpi.change} />}
                  <p className="text-[11px] font-medium text-white/30">{kpi.sub}</p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Évolution du chiffre d'affaires */}
      <Card title="Évolution du chiffre d'affaires" icon={BarChart4} subtitle="Encaissements et dépenses réels (données Qonto, 12 derniers mois)">
        <div className="flex items-end justify-between gap-2 pt-2" style={{ height: 220 }}>
          {evolutionData.map((d) => (
            <div key={d.month} className="flex flex-1 flex-col items-center gap-1.5">
              <div className="flex w-full items-end justify-center gap-0.5" style={{ height: 170 }}>
                <div
                  className="w-2.5 rounded-t-sm bg-ewa-orange transition-all duration-500"
                  style={{ height: `${(d.revenus / maxEvolutionValue) * 100}%` }}
                  title={`Encaissements: ${formatCurrency(d.revenus)}`}
                />
                <div
                  className="w-2.5 rounded-t-sm bg-white/20 transition-all duration-500"
                  style={{ height: `${(d.depenses / maxEvolutionValue) * 100}%` }}
                  title={`Dépenses: ${formatCurrency(d.depenses)}`}
                />
              </div>
              <span className="text-[10px] text-white/30 rotate-0">{d.month}</span>
            </div>
          ))}
        </div>
        <div className="mt-4 flex items-center justify-center gap-6 text-xs text-white/40">
          <span className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-sm bg-ewa-orange" />
            Encaissements
          </span>
          <span className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-sm bg-white/20" />
            Dépenses
          </span>
        </div>
      </Card>

      {/* Deuxième rangée : formats + urgents */}
      <div className="grid gap-4 lg:grid-cols-3">
        <Card title="Répartition par format" icon={PieChart} className="lg:col-span-1">
          <div className="space-y-3">
            {formatRepartition.map((item) => (
              <div key={item.label} className="space-y-1.5">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-white/70">{item.label}</span>
                  <span className="font-medium text-white">{item.value}%</span>
                </div>
                <div className="h-2 w-full rounded-full bg-white/[0.08]">
                  <div className={`h-2 rounded-full ${item.color}`} style={{ width: `${item.value}%` }} />
                </div>
                <p className="text-[11px] text-white/30">{formatCurrency(item.amount)} encaissés</p>
              </div>
            ))}
          </div>
        </Card>

        <Card title="Projets urgents" icon={AlertTriangle} className="lg:col-span-2">
          <div className="space-y-1">
            {urgentProjects.map((p) => (
              <div key={p.name} className="flex items-center justify-between rounded-lg px-3 py-2.5 transition-colors hover:bg-white/[0.04]">
                <div className="flex items-center gap-3">
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-red-400/10">
                    <AlertTriangle className="h-3.5 w-3.5 text-red-400" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">{p.name}</p>
                    <p className="text-xs text-white/40">{p.client} · {p.status}</p>
                  </div>
                </div>
                <span className="rounded bg-ewa-orange/10 px-2 py-1 text-[11px] font-medium text-ewa-orange">{p.deadline}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Troisième rangée : top clients + performance monteurs */}
      <div className="grid gap-4 lg:grid-cols-2">
        <Card title="Top 5 clients" icon={Crown} subtitle="Par chiffre d'affaires encaissé (Qonto)">
          <div className="space-y-1">
            {topClients.map((c, i) => (
              <div key={c.name} className="flex items-center justify-between rounded-lg px-3 py-2.5 transition-colors hover:bg-white/[0.04]">
                <div className="flex items-center gap-3">
                  <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-white/[0.08] text-[11px] font-semibold text-white/60">
                    {i + 1}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">{c.name}</p>
                    <p className="text-xs text-white/40">{c.projects} projets</p>
                  </div>
                </div>
                <span className="text-sm font-semibold text-white">{formatCurrency(c.ca)}</span>
              </div>
            ))}
          </div>
        </Card>

        <Card title="Performance monteurs" icon={Users}>
          <div className="space-y-1">
            {editorPerformance.map((e) => (
              <div key={e.name} className="flex items-center justify-between rounded-lg px-3 py-2.5 transition-colors hover:bg-white/[0.04]">
                <div className="flex items-center gap-3">
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-ewa-orange/10">
                    <span className="text-xs font-semibold text-ewa-orange">{e.name[0]}</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">{e.name}</p>
                    <p className="text-xs text-white/40">{e.livrees} livrées · {e.retouche}% retouche</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-white">{e.satisfaction}%</p>
                  <p className="text-[10px] text-white/30">satisfaction</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Finances & Charges */}
      <div>
        <div className="mb-4 flex items-center gap-2">
          <Landmark className="h-4 w-4 text-ewa-orange" />
          <div>
            <h2 className="text-sm font-semibold text-white">Finances & Charges</h2>
            <p className="text-xs text-white/40">Dépenses, P&L mensuel, impôts et trésorerie — données Qonto temps réel</p>
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <Card title="Répartition des charges" icon={Receipt} subtitle="Juil">
            <div className="space-y-3">
              {chargesRepartition.map((c) => (
                <div key={c.label} className="space-y-1.5">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-white/70">{c.label}</span>
                    <span className="font-medium text-white">{formatCurrency(c.value)}</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-white/[0.08]">
                    <div className={`h-2 rounded-full ${c.color}`} style={{ width: `${(c.value / totalCharges) * 100}%` }} />
                  </div>
                </div>
              ))}
              <div className="mt-3 flex items-center justify-between border-t border-white/[0.08] pt-3 text-sm">
                <span className="text-white/50">Total charges</span>
                <span className="font-semibold text-white">{formatCurrency(totalCharges)}</span>
              </div>
            </div>
          </Card>

          <Card title="Compte de résultat" icon={FileText} subtitle="Revenus vs dépenses par mois (6 derniers mois)">
            <div className="flex items-end justify-between gap-2 pt-2" style={{ height: 180 }}>
              {compteResultat.map((d) => (
                <div key={d.month} className="flex flex-1 flex-col items-center gap-1.5">
                  <div className="flex w-full items-end justify-center gap-0.5" style={{ height: 130 }}>
                    <div
                      className="w-3 rounded-t-sm bg-ewa-orange transition-all duration-500"
                      style={{ height: `${(d.revenus / maxCompteResultatValue) * 100}%` }}
                      title={`Revenus: ${formatCurrency(d.revenus)}`}
                    />
                    <div
                      className="w-3 rounded-t-sm bg-white/20 transition-all duration-500"
                      style={{ height: `${(d.depenses / maxCompteResultatValue) * 100}%` }}
                      title={`Dépenses: ${formatCurrency(d.depenses)}`}
                    />
                  </div>
                  <span className="text-[10px] text-white/30">{d.month}</span>
                </div>
              ))}
            </div>
            <div className="mt-3 flex items-center justify-center gap-6 text-xs text-white/40">
              <span className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-sm bg-ewa-orange" />
                Revenus
              </span>
              <span className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-sm bg-white/20" />
                Dépenses
              </span>
            </div>
          </Card>

          <Card title="Impôts & Taxes à prévoir" icon={FileText}>
            <div className="space-y-1">
              {impotsPrevoir.map((imp) => (
                <div key={imp.label} className="flex items-center justify-between rounded-lg px-3 py-2.5 transition-colors hover:bg-white/[0.04]">
                  <div>
                    <p className="text-sm font-medium text-white">{imp.label}</p>
                    <p className="text-xs text-white/40">Échéance : {imp.due}</p>
                  </div>
                  <span className={`text-sm font-semibold ${imp.amount === 0 ? "text-white/30" : "text-white"}`}>
                    {imp.amount === 0 ? "—" : formatCurrency(imp.amount)}
                  </span>
                </div>
              ))}
            </div>
          </Card>

          <Card title="Trésorerie & Prévisionnel" icon={PiggyBank}>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-xl border border-white/[0.08] bg-white/[0.04] p-4">
                <p className="text-[11px] font-medium text-white/40">Solde actuel</p>
                <p className="mt-1 text-xl font-bold text-white">{formatCurrency(tresorerie.solde)}</p>
              </div>
              <div className="rounded-xl border border-white/[0.08] bg-white/[0.04] p-4">
                <p className="text-[11px] font-medium text-white/40">Encours factures</p>
                <p className="mt-1 text-xl font-bold text-white">{formatCurrency(tresorerie.encoursFactures)}</p>
              </div>
              <div className="rounded-xl border border-white/[0.08] bg-white/[0.04] p-4">
                <p className="text-[11px] font-medium text-white/40">Prévisionnel 30j</p>
                <p className="mt-1 text-xl font-bold text-emerald-400">{formatCurrency(tresorerie.previsionnel30j)}</p>
              </div>
              <div className="rounded-xl border border-white/[0.08] bg-white/[0.04] p-4">
                <p className="text-[11px] font-medium text-white/40">Prévisionnel 60j</p>
                <p className="mt-1 text-xl font-bold text-emerald-400">{formatCurrency(tresorerie.previsionnel60j)}</p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
