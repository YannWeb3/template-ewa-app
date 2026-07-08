import { Sidebar } from "@/components/sidebar"
import { Topbar } from "@/components/topbar"

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
      <div className="min-h-screen">
        <Sidebar />
        <div className="lg:pl-60 min-h-screen">
          <div className="lg:py-2 lg:pr-2">
            <div className="min-h-[calc(100vh-1rem)] rounded-none lg:rounded-2xl lg:bg-[hsl(0_0%_7.5%)] lg:border lg:border-white/[0.08]">
            <Topbar userName="Ianne (Dev)" role="Admin" />
            <main className="p-4 sm:p-6 lg:p-8">
              <div className="animate-in">{children}</div>
            </main>
          </div>
        </div>
      </div>
    </div>
  )
}
