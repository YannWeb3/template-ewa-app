"use client"

import { useState, useEffect } from "react"
import {
  Settings,
  User,
  Bell,
  Shield,
  Palette,
  CreditCard,
  ChevronRight,
  MessageCircle,
  Landmark,
  CheckCircle2,
  AlertCircle,
  Plus,
  Trash2,
  RefreshCw,
  Bot,
  Save,
  Loader2,
} from "lucide-react"
import { Card } from "@/components/ui/card"
import { BlacklistManager } from "@/components/blacklist-manager"
import { AI_PROVIDERS, getModelLabel, type AISettings } from "@/lib/ai/providers"

const sections = [
  { icon: User, label: "Profil", description: "Nom, email, mot de passe" },
  { icon: Bell, label: "Notifications", description: "Préférences de notification" },
  { icon: Shield, label: "Sécurité", description: "Authentification, permissions" },
  { icon: Palette, label: "Apparence", description: "Thème, couleurs" },
  { icon: CreditCard, label: "Facturation", description: "Abonnement, paiements" },
  { icon: Settings, label: "Avancé", description: "API, intégrations" },
]

interface BankConnection {
  id: string
  name: string
  provider: string
  status: "connected" | "disconnected" | "error"
  lastSync: string
  apiKey: string
}

const INITIAL_CONNECTIONS: BankConnection[] = [
  { id: "bank-1", name: "Qonto EWA", provider: "Bridge", status: "connected", lastSync: "Il y a 2h", apiKey: "••••••••••••••••" },
  { id: "bank-2", name: "Wise Perso", provider: "Truelayer", status: "error", lastSync: "Il y a 3j", apiKey: "••••••••••••••••" },
]

const PROVIDERS = ["Bridge", "Truelayer", "Budget Insight", "Nordigen / GoCardless", "Plaid"]

export default function ParametresPage() {
  const [activeTab, setActiveTab] = useState("general")
  const [connections, setConnections] = useState<BankConnection[]>(INITIAL_CONNECTIONS)
  const [isAdding, setIsAdding] = useState(false)
  const [newConnection, setNewConnection] = useState({ name: "", provider: "Bridge", apiKey: "" })
  const [aiSettings, setAiSettings] = useState<AISettings>({ provider: "openai", model: "gpt-4o-mini" })
  const [aiLoading, setAiLoading] = useState(true)
  const [aiSaving, setAiSaving] = useState(false)
  const [aiSaved, setAiSaved] = useState(false)

  useEffect(() => {
    fetch("/api/settings/ai")
      .then((r) => r.json())
      .then((data) => {
        if (data.settings) setAiSettings(data.settings)
      })
      .catch(console.error)
      .finally(() => setAiLoading(false))
  }, [])

  async function saveAiSettings() {
    setAiSaving(true)
    setAiSaved(false)
    try {
      const res = await fetch("/api/settings/ai", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ settings: aiSettings }),
      })
      if (!res.ok) throw new Error()
      setAiSaved(true)
      setTimeout(() => setAiSaved(false), 3000)
    } catch {
      alert("Erreur lors de la sauvegarde")
    } finally {
      setAiSaving(false)
    }
  }

  function addConnection() {
    if (!newConnection.name || !newConnection.apiKey) return
    const connection: BankConnection = {
      id: `bank-${Date.now()}`,
      name: newConnection.name,
      provider: newConnection.provider,
      status: "connected",
      lastSync: "À l'instant",
      apiKey: "•".repeat(newConnection.apiKey.length),
    }
    setConnections((prev) => [...prev, connection])
    setIsAdding(false)
    setNewConnection({ name: "", provider: "Bridge", apiKey: "" })
  }

  function removeConnection(id: string) {
    setConnections((prev) => prev.filter((c) => c.id !== id))
  }

  function syncConnection(id: string) {
    setConnections((prev) => prev.map((c) => (c.id === id ? { ...c, lastSync: "À l'instant", status: "connected" as const } : c)))
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-lg font-semibold text-white">Paramètres</h1>
        <p className="text-sm text-white/40">Gérez vos préférences, intégrations et votre compte</p>
      </div>

      <div className="flex gap-1 border-b border-white/[0.08]">
        {[
          { id: "general", label: "Général" },
          { id: "ai", label: "IA", icon: Bot },
          { id: "banking", label: "Connexions bancaires", icon: Landmark },
          { id: "observatoire", label: "Observatoire WhatsApp", icon: MessageCircle },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium transition-colors ${
              activeTab === tab.id
                ? "border-b-2 border-ewa-orange text-white"
                : "text-white/40 hover:text-white/60"
            }`}
          >
            {tab.icon && <tab.icon className="h-4 w-4" />}
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === "general" && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {sections.map((section) => (
            <div
              key={section.label}
              className="group flex cursor-pointer items-center justify-between rounded-2xl border border-white/[0.08] bg-[hsl(0_0%_13%)] p-5 transition-all duration-300 hover:-translate-y-0.5 hover:border-white/[0.15]"
            >
              <div className="flex items-center gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-ewa-orange/10">
                  <section.icon className="h-5 w-5 text-ewa-orange" />
                </div>
                <div>
                  <p className="text-sm font-medium text-white">{section.label}</p>
                  <p className="text-xs text-white/40">{section.description}</p>
                </div>
              </div>
              <ChevronRight className="h-4 w-4 text-white/20 group-hover:text-white/40" />
            </div>
          ))}
        </div>
      )}

      {activeTab === "banking" && (
        <div className="space-y-6">
          <Card title="Connexions bancaires" icon={Landmark}>
            <div className="space-y-4">
              <p className="text-sm text-white/60">
                Connectez vos comptes bancaires via une API tierce (Bridge, Truelayer, Nordigen...) pour synchroniser automatiquement les transactions dans le module Banque.
              </p>

              <div className="space-y-3">
                {connections.map((connection) => (
                  <div
                    key={connection.id}
                    className="flex items-center justify-between rounded-xl border border-white/[0.08] bg-[hsl(0_0%_10%)] p-4"
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-ewa-orange/10">
                        <Landmark className="h-5 w-5 text-ewa-orange" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-medium text-white">{connection.name}</p>
                          {connection.status === "connected" ? (
                            <span className="inline-flex items-center gap-1 rounded border border-emerald-400/20 bg-emerald-400/10 px-2 py-0.5 text-[10px] font-medium text-emerald-400">
                              <CheckCircle2 className="h-3 w-3" />
                              Connecté
                            </span>
                          ) : connection.status === "error" ? (
                            <span className="inline-flex items-center gap-1 rounded border border-red-400/20 bg-red-400/10 px-2 py-0.5 text-[10px] font-medium text-red-400">
                              <AlertCircle className="h-3 w-3" />
                              Erreur
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 rounded border border-white/20 bg-white/10 px-2 py-0.5 text-[10px] font-medium text-white/60">
                              Déconnecté
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-white/40">{connection.provider} · Dernière sync {connection.lastSync}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => syncConnection(connection.id)}
                        className="rounded-lg p-1.5 text-white/40 transition-colors hover:bg-white/[0.08] hover:text-white"
                        title="Synchroniser"
                      >
                        <RefreshCw className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => removeConnection(connection.id)}
                        className="rounded-lg p-1.5 text-white/40 transition-colors hover:bg-red-400/10 hover:text-red-400"
                        title="Supprimer"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {!isAdding ? (
                <button
                  onClick={() => setIsAdding(true)}
                  className="flex items-center gap-2 rounded-xl border border-dashed border-white/[0.15] bg-transparent px-4 py-3 text-sm font-medium text-white/60 transition-colors hover:bg-white/[0.04] hover:text-white"
                >
                  <Plus className="h-4 w-4" />
                  Ajouter une connexion bancaire
                </button>
              ) : (
                <div className="rounded-xl border border-white/[0.08] bg-[hsl(0_0%_10%)] p-4">
                  <div className="mb-4 grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="mb-1 block text-xs font-medium text-white/60">Nom du compte</label>
                      <input
                        type="text"
                        value={newConnection.name}
                        onChange={(e) => setNewConnection((prev) => ({ ...prev, name: e.target.value }))}
                        className="w-full rounded-xl border border-white/[0.08] bg-[hsl(0_0%_13%)] px-3 py-2 text-sm text-white outline-none focus:border-ewa-orange/50"
                        placeholder="ex: Qonto EWA"
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-xs font-medium text-white/60">Fournisseur API</label>
                      <select
                        value={newConnection.provider}
                        onChange={(e) => setNewConnection((prev) => ({ ...prev, provider: e.target.value }))}
                        className="w-full rounded-xl border border-white/[0.08] bg-[hsl(0_0%_13%)] px-3 py-2 text-sm text-white outline-none focus:border-ewa-orange/50"
                      >
                        {PROVIDERS.map((p) => (
                          <option key={p} value={p}>{p}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="mb-4">
                    <label className="mb-1 block text-xs font-medium text-white/60">Clé API / Token de connexion</label>
                    <input
                      type="password"
                      value={newConnection.apiKey}
                      onChange={(e) => setNewConnection((prev) => ({ ...prev, apiKey: e.target.value }))}
                      className="w-full rounded-xl border border-white/[0.08] bg-[hsl(0_0%_13%)] px-3 py-2 text-sm text-white outline-none focus:border-ewa-orange/50"
                      placeholder="sk_live_..."
                    />
                    <p className="mt-1 text-xs text-white/30">La clé est stockée localement pour la démo. En production, elle serait chiffrée côté serveur.</p>
                  </div>

                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => setIsAdding(false)}
                      className="rounded-xl border border-white/[0.08] bg-transparent px-4 py-2 text-sm font-medium text-white/70 transition-colors hover:bg-white/[0.04]"
                    >
                      Annuler
                    </button>
                    <button
                      onClick={addConnection}
                      className="rounded-xl bg-ewa-orange px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-ewa-orange/90"
                    >
                      Connecter
                    </button>
                  </div>
                </div>
              )}
            </div>
          </Card>

          <Card title="Fournisseurs supportés" icon={CreditCard}>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {PROVIDERS.map((provider) => (
                <div
                  key={provider}
                  className="flex items-center gap-3 rounded-xl border border-white/[0.08] bg-[hsl(0_0%_10%)] p-3"
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-ewa-orange/10">
                    <Landmark className="h-4 w-4 text-ewa-orange" />
                  </div>
                  <span className="text-sm text-white">{provider}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}

      {activeTab === "observatoire" && (
        <Card title="Observatoire WhatsApp" icon={MessageCircle}>
          <BlacklistManager />
        </Card>
      )}

      {activeTab === "ai" && (
        <Card title="IA & Modèles" icon={Bot}>
          {aiLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-5 w-5 animate-spin text-white/30" />
            </div>
          ) : (
            <div className="space-y-6">
              <p className="text-sm text-white/60">
                Configure le fournisseur et le modèle utilisés par le Chat Cerveau EWA et les audits IA.
              </p>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-white/60">Fournisseur</label>
                  <select
                    value={aiSettings.provider}
                    onChange={(e) => {
                      const provider = AI_PROVIDERS.find((p) => p.id === e.target.value)
                      setAiSettings({
                        provider: e.target.value,
                        model: provider?.models[0]?.id ?? "",
                      })
                    }}
                    className="w-full rounded-xl border border-white/[0.08] bg-[hsl(0_0%_13%)] px-3 py-2.5 text-sm text-white outline-none focus:border-ewa-orange/50"
                  >
                    {AI_PROVIDERS.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-medium text-white/60">Modèle</label>
                  <select
                    value={aiSettings.model}
                    onChange={(e) => setAiSettings((prev) => ({ ...prev, model: e.target.value }))}
                    className="w-full rounded-xl border border-white/[0.08] bg-[hsl(0_0%_13%)] px-3 py-2.5 text-sm text-white outline-none focus:border-ewa-orange/50"
                  >
                    {AI_PROVIDERS.find((p) => p.id === aiSettings.provider)?.models.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="rounded-xl border border-white/[0.08] bg-[hsl(0_0%_10%)] p-4">
                <h4 className="mb-2 text-xs font-semibold uppercase tracking-wide text-white/40">Clés API requises</h4>
                <div className="space-y-2">
                  {AI_PROVIDERS.map((p) => (
                    <div key={p.id} className="flex items-center justify-between rounded-lg bg-[hsl(0_0%_13%)] px-3 py-2">
                      <span className="text-xs text-white/60">{p.label}</span>
                      <code className="text-[10px] text-white/30">{p.envKey}</code>
                    </div>
                  ))}
                </div>
                <p className="mt-2 text-[11px] text-white/30">
                  Les clés API sont configurées dans le fichier <code className="text-white/50">.env</code> du projet.
                </p>
              </div>

              <div className="flex items-center justify-between border-t border-white/[0.08] pt-4">
                <div>
                  {aiSaved && (
                    <span className="flex items-center gap-1.5 text-xs text-emerald-400">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      Configuration sauvegardée
                    </span>
                  )}
                </div>
                <button
                  onClick={saveAiSettings}
                  disabled={aiSaving}
                  className="flex items-center gap-2 rounded-xl bg-ewa-orange px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-ewa-orange/90 disabled:opacity-50"
                >
                  {aiSaving ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4" />
                  )}
                  Sauvegarder
                </button>
              </div>
            </div>
          )}
        </Card>
      )}
    </div>
  )
}
