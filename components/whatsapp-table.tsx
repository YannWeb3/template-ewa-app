"use client"

import { useEffect, useState } from "react"
import { MessageCircle } from "lucide-react"
import { Card } from "./ui/card"

interface WhatsAppMessage {
  id: string
  created_at: string
  phone: string
  push_name: string
  direction: string
  body: string
  media_type: string
}

export function WhatsAppTable() {
  const [messages, setMessages] = useState<WhatsAppMessage[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/whatsapp/messages")
      .then((r) => r.json())
      .then((data) => {
        setMessages(data)
        setLoading(false)
      })
  }, [])

  return (
    <Card title="Messages WhatsApp" icon={MessageCircle} innerClassName="p-0 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/[0.08] text-left text-white/40">
              <th className="p-3 font-medium">Date</th>
              <th className="p-3 font-medium">Tél</th>
              <th className="p-3 font-medium">Nom</th>
              <th className="p-3 font-medium">Direction</th>
              <th className="p-3 font-medium">Message</th>
              <th className="p-3 font-medium">Média</th>
            </tr>
          </thead>
          <tbody>
            {messages.map((msg) => (
              <tr key={msg.id} className="border-b border-white/[0.04] hover:bg-white/[0.02]">
                <td className="p-3 text-white/30 whitespace-nowrap text-xs">{new Date(msg.created_at).toLocaleString("fr-FR")}</td>
                <td className="p-3 font-mono text-xs text-white/80">{msg.phone}</td>
                <td className="p-3 text-white/60 text-xs">{msg.push_name}</td>
                <td className="p-3">
                  <span className={`rounded px-2 py-0.5 text-[11px] font-medium ${
                    msg.direction === "INBOUND" ? "bg-blue-500/15 text-blue-300" : "bg-green-500/15 text-green-300"
                  }`}>
                    {msg.direction}
                  </span>
                </td>
                <td className="p-3 max-w-xs truncate text-xs text-white/70">{msg.body || "—"}</td>
                <td className="p-3 text-white/30 text-xs">{msg.media_type || "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {loading && <p className="text-white/20 text-center py-12 text-sm">Chargement...</p>}
        {!loading && messages.length === 0 && <p className="text-white/20 text-center py-12 text-sm">Aucun message</p>}
      </div>
    </Card>
  )
}
