"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState, useEffect } from "react"
import {
  LayoutDashboard, Users, FolderKanban, UsersRound, GraduationCap,
  BookOpen, Film, Scissors, Landmark, BarChart4, Search, Brain,
  MessageCircle, Settings, Menu, X, SearchIcon,
} from "lucide-react"

const navItems = [
  { name: "Tableau de bord", href: "/", icon: LayoutDashboard },
  { name: "Clients", href: "/clients", icon: Users },
  { name: "Projets", href: "/projets", icon: FolderKanban },
  { name: "Équipe", href: "/equipe", icon: UsersRound },
  { name: "Académie", href: "/academie", icon: GraduationCap },
  { name: "Playbooks", href: "/playbooks", icon: BookOpen },
  { name: "Frame.io", href: "/frameio", icon: Film },
  { name: "Retour montage", href: "/retour-montage", icon: Scissors },
  { name: "Banque", href: "/banque", icon: Landmark },
  { name: "Analytics", href: "/analytics", icon: BarChart4 },
  { name: "Recherche IG", href: "/recherche-ig", icon: Search },
  { name: "Cerveau EWA", href: "/cerveau-ewa", icon: Brain },
  { name: "Observatoire", href: "/observatoire", icon: MessageCircle },
]

const bottomItems = [{ name: "Paramètres", href: "/parametres", icon: Settings }]

export function Sidebar() {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)

  useEffect(() => {
    setOpen(false)
  }, [pathname])

  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden"
      return () => { document.body.style.overflow = "" }
    }
  }, [open])

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/"
    return pathname.startsWith(href)
  }

  const sidebarContent = (
    <>
      <div className="flex h-14 items-center justify-between px-4">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-ewa-orange">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="text-white">
              <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" fill="currentColor" />
            </svg>
          </div>
          <span className="text-sm font-semibold tracking-tight text-white">EWA Studio</span>
        </div>
        <button
          onClick={() => setOpen(false)}
          className="flex h-8 w-8 items-center justify-center rounded-lg text-white/50 hover:bg-white/[0.04] lg:hidden"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      <div className="px-3 pb-3">
        <div className="flex h-9 w-full items-center gap-2.5 rounded-lg border border-white/[0.08] bg-white/[0.04] px-3 text-[13px] text-white/40">
          <SearchIcon className="h-3.5 w-3.5 shrink-0 opacity-60" />
          <span className="flex-1">Rechercher...</span>
          <kbd className="hidden sm:inline-flex h-5 items-center gap-0.5 rounded border border-white/[0.1] bg-white/[0.06] px-1.5 text-[10px] font-medium text-white/40">⌘K</kbd>
        </div>
      </div>

      <nav className="flex flex-1 flex-col gap-1 overflow-y-auto px-3 py-2">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            title={item.name}
            className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all duration-200 ${
              isActive(item.href)
                ? "bg-white/[0.08] font-medium text-white"
                : "font-normal text-white/50 hover:bg-white/[0.04] hover:text-white/80 hover:translate-x-0.5"
            }`}
          >
            <item.icon className={`h-[18px] w-[18px] shrink-0 ${isActive(item.href) ? "text-ewa-orange" : ""}`} />
            {item.name}
          </Link>
        ))}
      </nav>

      <div className="border-t border-white/[0.06] px-3 py-3">
        {bottomItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all duration-200 ${
              isActive(item.href)
                ? "bg-white/[0.08] font-medium text-white"
                : "font-normal text-white/50 hover:bg-white/[0.04] hover:text-white/80 hover:translate-x-0.5"
            }`}
          >
            <item.icon className={`h-[18px] w-[18px] shrink-0 ${isActive(item.href) ? "text-ewa-orange" : ""}`} />
            {item.name}
          </Link>
        ))}
      </div>
    </>
  )

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="fixed left-4 top-3.5 z-40 flex h-8 w-8 items-center justify-center rounded-lg bg-[hsl(0_0%_7%)] border border-white/[0.08] text-white lg:hidden"
        aria-label="Ouvrir le menu"
      >
        <Menu className="h-5 w-5" />
      </button>

      {open && (
        <div className="fixed inset-0 z-40 bg-black/60 lg:hidden" onClick={() => setOpen(false)} />
      )}

      <aside className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-white/[0.08] bg-[hsl(0_0%_4%)] transition-transform duration-200 lg:hidden ${
        open ? "translate-x-0" : "-translate-x-full"
      }`}>
        {sidebarContent}
      </aside>

      <aside className="fixed inset-y-0 left-0 z-30 hidden w-60 flex-col bg-[hsl(0_0%_4%)] border-r border-white/[0.08] lg:flex">
        {sidebarContent}
      </aside>
    </>
  )
}
