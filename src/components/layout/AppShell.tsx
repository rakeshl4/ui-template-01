import { useState, type ReactNode } from 'react'
import { Header } from '@/components/layout/Header'
import { Sidebar } from '@/components/layout/Sidebar'

export function AppShell({ children }: { children: ReactNode }) {
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <div className="min-h-screen bg-background">
      <Header onToggleSidebar={() => setMobileOpen((v) => !v)} />
      <div className="flex">
        <Sidebar
          collapsed={collapsed}
          onToggleCollapsed={() => setCollapsed((v) => !v)}
          mobileOpen={mobileOpen}
          onCloseMobile={() => setMobileOpen(false)}
        />
        <main className="min-w-0 flex-1">
          <div className="mx-auto w-full max-w-[1200px] px-4 py-6 md:px-8 md:py-8">{children}</div>
        </main>
      </div>
    </div>
  )
}
