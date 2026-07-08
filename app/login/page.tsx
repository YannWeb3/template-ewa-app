"use client"

import { useState } from "react"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Demo: redirect to dashboard
    window.location.href = "/"
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm space-y-8">
        <div className="text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-ewa-orange">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-white">
              <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" fill="currentColor" />
            </svg>
          </div>
          <h1 className="mt-4 text-2xl font-bold text-foreground">EWA</h1>
          <p className="mt-1 text-sm text-white/40">Connecte-toi à ton espace</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label htmlFor="email" className="text-sm text-white/60">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="ianne@ewa-dev.com"
              className="w-full rounded-lg border border-white/[0.08] bg-[hsl(0_0%_10%)] px-3 py-2.5 text-sm text-white placeholder:text-white/20 outline-none focus:border-ewa-orange/50"
            />
          </div>
          <div className="space-y-1">
            <label htmlFor="password" className="text-sm text-white/60">Mot de passe</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full rounded-lg border border-white/[0.08] bg-[hsl(0_0%_10%)] px-3 py-2.5 text-sm text-white placeholder:text-white/20 outline-none focus:border-ewa-orange/50"
            />
          </div>
          <button
            type="submit"
            className="w-full rounded-lg bg-ewa-orange py-2.5 text-sm font-medium text-white transition-colors hover:bg-ewa-orange/90"
          >
            Se connecter
          </button>
        </form>
      </div>
    </div>
  )
}
