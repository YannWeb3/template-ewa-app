"use client"

import { useState, useEffect, useCallback } from "react"
import { Phone, Trash2, Plus } from "lucide-react"

interface BlacklistEntry {
  id: string
  phone: string
  label: string
  created_at: string
}

export function BlacklistManager() {
  const [entries, setEntries] = useState<BlacklistEntry[]>([])
  const [newPhone, setNewPhone] = useState("")
  const [newLabel, setNewLabel] = useState("")
  const [loading, setLoading] = useState(true)

  const fetchList = useCallback(async () => {
    const res = await fetch("/api/whatsapp/blacklist")
    if (res.ok) setEntries(await res.json())
    setLoading(false)
  }, [])

  useEffect(() => { fetchList() }, [fetchList])

  const addEntry = async () => {
    if (!newPhone.trim()) return
    const res = await fetch("/api/whatsapp/blacklist", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone: newPhone.trim(), label: newLabel.trim() }),
    })
    if (res.ok) {
      setNewPhone("")
      setNewLabel("")
      fetchList()
    }
  }

  const removeEntry = async (phone: string) => {
    const res = await fetch(`/api/whatsapp/blacklist?phone=${encodeURIComponent(phone)}`, {
      method: "DELETE",
    })
    if (res.ok) fetchList()
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-white/40">
        Les numéros dans cette liste rouge sont ignorés. Aucun message en provenance de ces numéros ne sera stocké.
      </p>

      <div className="flex gap-2">
        <input
          type="text"
          placeholder="Numéro (ex: 33612345678)"
          value={newPhone}
          onChange={(e) => setNewPhone(e.target.value)}
          className="flex-1 rounded-lg border border-white/[0.08] bg-[hsl(0_0%_10%)] px-3 py-2 text-sm text-white placeholder:text-white/20 outline-none focus:border-[#FF6B1A]/50"
        />
        <input
          type="text"
          placeholder="Label"
          value={newLabel}
          onChange={(e) => setNewLabel(e.target.value)}
          className="w-28 rounded-lg border border-white/[0.08] bg-[hsl(0_0%_10%)] px-3 py-2 text-sm text-white placeholder:text-white/20 outline-none focus:border-[#FF6B1A]/50"
        />
        <button
          onClick={addEntry}
          className="flex items-center gap-1.5 rounded-lg bg-[#FF6B1A] px-3 py-2 text-sm font-medium text-white hover:opacity-80 transition-opacity"
        >
          <Plus className="h-3.5 w-3.5" /> Ajouter
        </button>
      </div>

      {loading ? (
        <p className="text-sm text-white/30">Chargement...</p>
      ) : entries.length === 0 ? (
        <p className="text-sm text-white/30">Aucun numéro dans la liste rouge.</p>
      ) : (
        <div className="space-y-1">
          {entries.map((entry) => (
            <div
              key={entry.id}
              className="flex items-center justify-between rounded-lg border border-white/[0.06] bg-[hsl(0_0%_10%)] px-3 py-2"
            >
              <div className="flex items-center gap-3">
                <Phone className="h-3.5 w-3.5 text-white/30" />
                <span className="text-sm text-white">{entry.phone}</span>
                {entry.label && (
                  <span className="rounded bg-white/[0.06] px-2 py-0.5 text-[11px] text-white/40">
                    {entry.label}
                  </span>
                )}
              </div>
              <button
                onClick={() => removeEntry(entry.phone)}
                className="rounded p-1 text-white/20 hover:bg-red-500/10 hover:text-red-400 transition-colors"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
