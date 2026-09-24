import { useState, type ReactNode } from 'react'
import { Header } from '@/components/layout/Header'
import { Sidebar } from '@/components/layout/Sidebar'

export function AppShell({ children, wide = false }: { children: ReactNode; wide?: boolean }) {
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <div className="bg-background min-h-screen">
      <Header onToggleSidebar={() => setMobileOpen((v) => !v)} />
      <div className="flex">
        <Sidebar
          collapsed={collapsed}
          onToggleCollapsed={() => setCollapsed((v) => !v)}
          mobileOpen={mobileOpen}
          onCloseMobile={() => setMobileOpen(false)}
        />
        <main className="min-w-0 flex-1">
          <div
            className={`mx-auto w-full px-4 py-6 md:px-8 md:py-8 ${wide ? '' : 'max-w-[1200px]'}`}
          >
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
