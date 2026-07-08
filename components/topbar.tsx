"use client"

import { Bell, ChevronDown, LogOut } from "lucide-react"
import { useState } from "react"
import { useRouter } from "next/navigation"

interface TopbarProps {
  userName: string
  role: string
}

export function Topbar({ userName, role }: TopbarProps) {
  const [menuOpen, setMenuOpen] = useState(false)
  const router = useRouter()
  const initial = userName.charAt(0).toUpperCase()

  return (
    <header className="sticky top-0 z-20 flex h-14 items-center justify-end border-b border-white/[0.06] px-4 sm:px-6 lg:px-8 backdrop-blur-xl lg:rounded-t-2xl">
      <div className="flex-1 lg:hidden" />
      <div className="flex items-center gap-2 sm:gap-3">
        <button className="relative rounded-lg p-2 text-white/40 transition-colors hover:bg-white/[0.04] hover:text-white" title="Notifications">
          <Bell className="h-4 w-4" />
          <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-ewa-orange" />
        </button>

        <div className="h-5 w-px bg-white/[0.08] hidden sm:block" />

        <div className="relative">
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm transition-colors hover:bg-white/[0.05]"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-ewa-orange text-xs font-semibold text-white">
              {initial}
            </div>
            <span className="font-medium text-white hidden sm:inline">{userName}</span>
            <span className="text-white/40 font-normal text-sm hidden sm:inline">({role})</span>
            <ChevronDown className="h-3.5 w-3.5 text-white/40 hidden sm:block" />
          </button>

          {menuOpen && (
            <div className="absolute right-0 mt-1 w-44 rounded-lg border border-white/[0.08] bg-[hsl(0_0%_10%)] p-1 shadow-[0_8px_30px_rgba(0,0,0,0.4)]">
              <button
                onClick={() => {
                  setMenuOpen(false)
                  router.push("/login")
                }}
                className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-white/50 transition-colors hover:bg-white/[0.05] hover:text-white"
              >
                <LogOut className="h-3.5 w-3.5" />
                Se déconnecter
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
