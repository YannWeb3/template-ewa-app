import type { LucideIcon } from "lucide-react"

interface CardProps {
  title?: string
  subtitle?: string
  icon?: LucideIcon
  action?: React.ReactNode
  children: React.ReactNode
  className?: string
  innerClassName?: string
}

export function Card({ title, subtitle, icon: Icon, action, children, className, innerClassName }: CardProps) {
  return (
    <div
      className={`group/card flex flex-col rounded-2xl border border-white/[0.08] bg-[hsl(0_0%_13%)] transition-all duration-300 hover:-translate-y-0.5 hover:border-white/[0.15] hover:shadow-[0_8px_30px_rgba(255,107,26,0.06)] ${className ?? ""}`}
    >
      {title && (
        <div className="flex items-center justify-between px-4 py-2.5">
          <div className="flex items-center gap-2">
            {Icon && (
              <Icon className="h-3.5 w-3.5 text-white/35 transition-colors duration-300 group-hover/card:text-ewa-orange/60" />
            )}
            <span className="text-[12px] font-semibold text-white/50 transition-colors duration-300 group-hover/card:text-white/70">
              {title}
            </span>
            {subtitle && (
              <span className="text-[11px] text-white/25">— {subtitle}</span>
            )}
          </div>
          {action}
        </div>
      )}
      <div className={`flex flex-1 flex-col ${title ? "px-1.5 pb-1.5" : "p-1.5"}`}>
        <div
          className={`flex-1 rounded-xl border border-white/[0.10] bg-[hsl(0_0%_6.5%)] p-4 shadow-[0_0_0_1px_rgba(255,255,255,0.04),0_0_20px_rgba(255,255,255,0.03),inset_0_1px_0_rgba(255,255,255,0.06)] ${innerClassName ?? ""}`}
        >
          {children}
        </div>
      </div>
    </div>
  )
}
