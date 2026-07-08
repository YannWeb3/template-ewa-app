"use client"

import { useState, useMemo } from "react"
import {
  Landmark,
  ArrowUpRight,
  ArrowDownLeft,
  Search,
  X,
  CreditCard,
  Wallet,
  TrendingUp,
  TrendingDown,
  MoreHorizontal,
  Download,
  Plus,
  Building2,
  CalendarDays,
  Filter,
} from "lucide-react"

interface Transaction {
  id: string
  date: string
  description: string
  category: string
  amount: number
  type: "income" | "expense"
  account: string
  status: "completed" | "pending"
}

interface Account {
  id: string
  name: string
  bank: string
  iban: string
  balance: number
  currency: string
  type: "business" | "personal" | "savings"
}

const ACCOUNTS: Account[] = [
  {
    id: "acc-001",
    name: "Compte courant EWA",
    bank: "Qonto",
    iban: "FR76 1234 5678 9012 3456 7890 123",
    balance: 42850.75,
    currency: "EUR",
    type: "business",
  },
  {
    id: "acc-002",
    name: "Livret EWA",
    bank: "Qonto",
    iban: "FR76 9876 5432 1098 7654 3210 987",
    balance: 12500.0,
    currency: "EUR",
    type: "savings",
  },
  {
    id: "acc-003",
    name: "Compte Perso",
    bank: "Wise",
    iban: "GB29 NWBK 6016 1331 9268 19",
    balance: 3200.5,
    currency: "EUR",
    type: "personal",
  },
]

const TRANSACTIONS: Transaction[] = [
  { id: "tx-001", date: "2026-07-01", description: "Paiement client — L'Oréal", category: "CA", amount: 12500, type: "income", account: "Compte courant EWA", status: "completed" },
  { id: "tx-002", date: "2026-07-01", description: "Paiement client — Nike", category: "CA", amount: 8400, type: "income", account: "Compte courant EWA", status: "completed" },
  { id: "tx-003", date: "2026-06-30", description: "Salaire monteurs", category: "Charges", amount: 6800, type: "expense", account: "Compte courant EWA", status: "completed" },
  { id: "tx-004", date: "2026-06-28", description: "Abonnement Frame.io", category: "Outils", amount: 149, type: "expense", account: "Compte courant EWA", status: "completed" },
  { id: "tx-005", date: "2026-06-25", description: "Paiement client — Gymshark", category: "CA", amount: 5200, type: "income", account: "Compte courant EWA", status: "completed" },
  { id: "tx-006", date: "2026-06-22", description: "Facture DaVinci Resolve", category: "Logiciel", amount: 295, type: "expense", account: "Compte courant EWA", status: "completed" },
  { id: "tx-007", date: "2026-06-20", description: "Virement vers livret", category: "Épargne", amount: 3000, type: "expense", account: "Compte courant EWA", status: "completed" },
  { id: "tx-008", date: "2026-06-18", description: "Paiement client — Spotify", category: "CA", amount: 7800, type: "income", account: "Compte courant EWA", status: "pending" },
  { id: "tx-009", date: "2026-06-15", description: "Abonnement Slack", category: "Outils", amount: 75, type: "expense", account: "Compte courant EWA", status: "completed" },
  { id: "tx-010", date: "2026-06-10", description: "Paiement client — Ledger", category: "CA", amount: 9600, type: "income", account: "Compte courant EWA", status: "completed" },
]

const MONTHLY_DATA = [
  { month: "Jan", income: 28000, expense: 19500 },
  { month: "Fév", income: 32000, expense: 21000 },
  { month: "Mar", income: 29500, expense: 18800 },
  { month: "Avr", income: 35000, expense: 23000 },
  { month: "Mai", income: 38000, expense: 24500 },
  { month: "Juin", income: 41000, expense: 26000 },
  { month: "Juil", income: 20900, expense: 6944 },
]

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" }).format(amount)
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("fr-FR", { day: "numeric", month: "short" })
}

const categories = ["Toutes", ...Array.from(new Set(TRANSACTIONS.map((t) => t.category)))]
const types = ["Tous", "Entrées", "Sorties"]

export default function BanquePage() {
  const [search, setSearch] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("Toutes")
  const [typeFilter, setTypeFilter] = useState("Tous")
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null)
  const [isTransferOpen, setIsTransferOpen] = useState(false)
  const [transfer, setTransfer] = useState({ from: "", to: "", amount: "" })

  const totalBalance = useMemo(() => ACCOUNTS.reduce((acc, a) => acc + a.balance, 0), [])
  const monthlyIncome = useMemo(() => MONTHLY_DATA[MONTHLY_DATA.length - 1].income, [])
  const monthlyExpense = useMemo(() => MONTHLY_DATA[MONTHLY_DATA.length - 1].expense, [])

  const filteredTransactions = useMemo(() => {
    return TRANSACTIONS.filter((t) => {
      const term = search.toLowerCase()
      const matchesSearch =
        !term ||
        t.description.toLowerCase().includes(term) ||
        t.category.toLowerCase().includes(term) ||
        t.account.toLowerCase().includes(term)
      const matchesCategory = categoryFilter === "Toutes" || t.category === categoryFilter
      const matchesType =
        typeFilter === "Tous" ||
        (typeFilter === "Entrées" && t.type === "income") ||
        (typeFilter === "Sorties" && t.type === "expense")
      return matchesSearch && matchesCategory && matchesType
    })
  }, [search, categoryFilter, typeFilter])

  const activeFiltersCount =
    (search ? 1 : 0) + (categoryFilter !== "Toutes" ? 1 : 0) + (typeFilter !== "Tous" ? 1 : 0)

  const maxMonthly = Math.max(...MONTHLY_DATA.map((d) => Math.max(d.income, d.expense)))

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-white">Banque</h1>
          <p className="text-sm text-white/40">Suivi des comptes, transactions et trésorerie EWA</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setIsTransferOpen(true)}
            className="flex items-center gap-2 rounded-xl bg-ewa-orange px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-ewa-orange/90"
          >
            <Plus className="h-4 w-4" />
            Virement
          </button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-white/[0.08] bg-[hsl(0_0%_13%)] p-4">
          <div className="mb-2 flex items-center gap-2 text-white/40">
            <Wallet className="h-4 w-4" />
            <span className="text-xs font-medium">Trésorerie totale</span>
          </div>
          <p className="text-2xl font-semibold text-white">{formatCurrency(totalBalance)}</p>
        </div>
        <div className="rounded-2xl border border-white/[0.08] bg-[hsl(0_0%_13%)] p-4">
          <div className="mb-2 flex items-center gap-2 text-white/40">
            <TrendingUp className="h-4 w-4 text-emerald-400" />
            <span className="text-xs font-medium">Entrées Juillet</span>
          </div>
          <p className="text-2xl font-semibold text-emerald-400">{formatCurrency(monthlyIncome)}</p>
        </div>
        <div className="rounded-2xl border border-white/[0.08] bg-[hsl(0_0%_13%)] p-4">
          <div className="mb-2 flex items-center gap-2 text-white/40">
            <TrendingDown className="h-4 w-4 text-red-400" />
            <span className="text-xs font-medium">Sorties Juillet</span>
          </div>
          <p className="text-2xl font-semibold text-red-400">{formatCurrency(monthlyExpense)}</p>
        </div>
        <div className="rounded-2xl border border-white/[0.08] bg-[hsl(0_0%_13%)] p-4">
          <div className="mb-2 flex items-center gap-2 text-white/40">
            <Landmark className="h-4 w-4" />
            <span className="text-xs font-medium">Comptes connectés</span>
          </div>
          <p className="text-2xl font-semibold text-white">{ACCOUNTS.length}</p>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2 rounded-2xl border border-white/[0.08] bg-[hsl(0_0%_13%)] p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-white">Flux mensuels (k€)</h2>
            <div className="flex items-center gap-4 text-xs">
              <span className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-emerald-400" />
                Entrées
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-red-400" />
                Sorties
              </span>
            </div>
          </div>

          <div className="flex h-48 items-end justify-between gap-3">
            {MONTHLY_DATA.map((month) => (
              <div key={month.month} className="flex flex-1 flex-col items-center gap-2">
                <div className="flex w-full items-end gap-1">
                  <div
                    className="w-full rounded-t bg-emerald-400/80"
                    style={{ height: `${(month.income / maxMonthly) * 100}%` }}
                  />
                  <div
                    className="w-full rounded-t bg-red-400/80"
                    style={{ height: `${(month.expense / maxMonthly) * 100}%` }}
                  />
                </div>
                <span className="text-[11px] text-white/40">{month.month}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-white/[0.08] bg-[hsl(0_0%_13%)] p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-white">Comptes</h2>
            <Building2 className="h-4 w-4 text-white/40" />
          </div>
          <div className="space-y-3">
            {ACCOUNTS.map((account) => (
              <button
                key={account.id}
                onClick={() => setSelectedAccount(account)}
                className="w-full rounded-xl border border-white/[0.08] bg-[hsl(0_0%_10%)] p-4 text-left transition-colors hover:border-white/[0.15]"
              >
                <div className="mb-1 flex items-center justify-between">
                  <span className="text-sm font-medium text-white">{account.name}</span>
                  <span className="text-xs text-white/40">{account.bank}</span>
                </div>
                <p className="text-lg font-semibold text-white">{formatCurrency(account.balance)}</p>
                <p className="mt-1 text-[11px] text-white/30">{account.iban}</p>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-white/[0.08] bg-[hsl(0_0%_13%)] p-5">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-white">Transactions récentes</h2>
          <button className="flex items-center gap-1.5 text-xs font-medium text-white/40 transition-colors hover:text-white">
            <Download className="h-3.5 w-3.5" />
            Exporter
          </button>
        </div>

        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative sm:max-w-xs">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/30" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Rechercher une transaction..."
              className="w-full rounded-xl border border-white/[0.08] bg-[hsl(0_0%_10%)] py-2.5 pl-10 pr-4 text-sm text-white placeholder:text-white/30 focus:border-ewa-orange/50 focus:outline-none"
            />
          </div>

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="rounded-xl border border-white/[0.08] bg-[hsl(0_0%_10%)] px-3 py-2.5 text-sm text-white outline-none focus:border-ewa-orange/50"
          >
            {categories.map((c) => (
              <option key={c} value={c}>{c === "Toutes" ? "Toutes les catégories" : c}</option>
            ))}
          </select>

          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="rounded-xl border border-white/[0.08] bg-[hsl(0_0%_10%)] px-3 py-2.5 text-sm text-white outline-none focus:border-ewa-orange/50"
          >
            {types.map((t) => (
              <option key={t} value={t}>{t === "Tous" ? "Tous les types" : t}</option>
            ))}
          </select>

          {activeFiltersCount > 0 && (
            <button
              onClick={() => {
                setSearch("")
                setCategoryFilter("Toutes")
                setTypeFilter("Tous")
              }}
              className="flex items-center gap-1.5 rounded-xl border border-white/[0.08] bg-white/[0.04] px-3 py-2.5 text-sm font-medium text-white/70 transition-colors hover:bg-white/[0.08] hover:text-white"
            >
              <X className="h-3.5 w-3.5" />
              Réinitialiser
            </button>
          )}
        </div>

        <div className="overflow-hidden rounded-xl border border-white/[0.08]">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/[0.08] text-left text-white/40">
                  <th className="px-4 py-3 font-medium">Date</th>
                  <th className="px-4 py-3 font-medium">Description</th>
                  <th className="px-4 py-3 font-medium">Catégorie</th>
                  <th className="px-4 py-3 font-medium">Compte</th>
                  <th className="px-4 py-3 font-medium">Montant</th>
                  <th className="px-4 py-3 font-medium">Statut</th>
                </tr>
              </thead>
              <tbody>
                {filteredTransactions.map((tx) => (
                  <tr key={tx.id} className="border-b border-white/[0.04] transition-colors hover:bg-white/[0.02]">
                    <td className="px-4 py-3 text-white/60">{formatDate(tx.date)}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div
                          className={`flex h-7 w-7 items-center justify-center rounded-lg ${
                            tx.type === "income" ? "bg-emerald-400/10" : "bg-red-400/10"
                          }`}
                        >
                          {tx.type === "income" ? (
                            <ArrowDownLeft className="h-3.5 w-3.5 text-emerald-400" />
                          ) : (
                            <ArrowUpRight className="h-3.5 w-3.5 text-red-400" />
                          )}
                        </div>
                        <span className="text-white">{tx.description}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-white/60">{tx.category}</td>
                    <td className="px-4 py-3 text-white/60">{tx.account}</td>
                    <td className={`px-4 py-3 font-medium ${tx.type === "income" ? "text-emerald-400" : "text-white"}`}>
                      {tx.type === "income" ? "+" : "-"}
                      {formatCurrency(tx.amount)}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`rounded border px-2 py-0.5 text-[10px] font-medium ${
                          tx.status === "completed"
                            ? "bg-emerald-400/10 text-emerald-400 border-emerald-400/20"
                            : "bg-amber-400/10 text-amber-400 border-amber-400/20"
                        }`}
                      >
                        {tx.status === "completed" ? "Réalisé" : "En attente"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {selectedAccount && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-white/[0.08] bg-[hsl(0_0%_10%)] p-6 shadow-2xl">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-white">{selectedAccount.name}</h2>
              <button
                onClick={() => setSelectedAccount(null)}
                className="rounded-lg p-1.5 text-white/40 hover:bg-white/[0.08] hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="rounded-xl border border-white/[0.08] bg-[hsl(0_0%_13%)] p-4">
                <p className="text-xs text-white/40">Solde actuel</p>
                <p className="text-2xl font-semibold text-white">{formatCurrency(selectedAccount.balance)}</p>
              </div>

              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-xs text-white/40">Banque</p>
                  <p className="text-white">{selectedAccount.bank}</p>
                </div>
                <div>
                  <p className="text-xs text-white/40">Type</p>
                  <p className="capitalize text-white">{selectedAccount.type === "business" ? "Professionnel" : selectedAccount.type === "savings" ? "Épargne" : "Personnel"}</p>
                </div>
              </div>

              <div>
                <p className="mb-1 text-xs text-white/40">IBAN</p>
                <p className="rounded-xl border border-white/[0.08] bg-[hsl(0_0%_13%)] p-3 font-mono text-sm text-white/70">{selectedAccount.iban}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {isTransferOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-white/[0.08] bg-[hsl(0_0%_10%)] p-6 shadow-2xl">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-white">Nouveau virement</h2>
              <button
                onClick={() => setIsTransferOpen(false)}
                className="rounded-lg p-1.5 text-white/40 hover:bg-white/[0.08] hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="mb-1 block text-xs font-medium text-white/60">Depuis</label>
                <select
                  value={transfer.from}
                  onChange={(e) => setTransfer((prev) => ({ ...prev, from: e.target.value }))}
                  className="w-full rounded-xl border border-white/[0.08] bg-[hsl(0_0%_13%)] px-3 py-2 text-sm text-white outline-none focus:border-ewa-orange/50"
                >
                  <option value="">Sélectionner un compte</option>
                  {ACCOUNTS.map((a) => (
                    <option key={a.id} value={a.id}>{a.name} — {formatCurrency(a.balance)}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-white/60">Vers</label>
                <select
                  value={transfer.to}
                  onChange={(e) => setTransfer((prev) => ({ ...prev, to: e.target.value }))}
                  className="w-full rounded-xl border border-white/[0.08] bg-[hsl(0_0%_13%)] px-3 py-2 text-sm text-white outline-none focus:border-ewa-orange/50"
                >
                  <option value="">Sélectionner un compte</option>
                  {ACCOUNTS.map((a) => (
                    <option key={a.id} value={a.id}>{a.name} — {formatCurrency(a.balance)}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-white/60">Montant</label>
                <input
                  type="number"
                  value={transfer.amount}
                  onChange={(e) => setTransfer((prev) => ({ ...prev, amount: e.target.value }))}
                  className="w-full rounded-xl border border-white/[0.08] bg-[hsl(0_0%_13%)] px-3 py-2 text-sm text-white outline-none focus:border-ewa-orange/50"
                  placeholder="0.00"
                />
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-2">
              <button
                onClick={() => setIsTransferOpen(false)}
                className="rounded-xl border border-white/[0.08] bg-transparent px-4 py-2 text-sm font-medium text-white/70 transition-colors hover:bg-white/[0.04]"
              >
                Annuler
              </button>
              <button
                onClick={() => {
                  setIsTransferOpen(false)
                  setTransfer({ from: "", to: "", amount: "" })
                }}
                className="rounded-xl bg-ewa-orange px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-ewa-orange/90"
              >
                Simuler
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
