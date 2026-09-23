import { NavLink } from 'react-router-dom'
import { ChevronsLeft, ChevronsRight, ListChecks, PlusCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

const NAV_ITEMS = [
  { to: '/requests', label: 'All requests', icon: ListChecks, end: true },
  { to: '/requests/new', label: 'New request', icon: PlusCircle, end: false },
]

interface SidebarProps {
  collapsed: boolean
  onToggleCollapsed: () => void
  mobileOpen: boolean
  onCloseMobile: () => void
}

export function Sidebar({ collapsed, onToggleCollapsed, mobileOpen, onCloseMobile }: SidebarProps) {
  return (
    <>
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 md:hidden"
          onClick={onCloseMobile}
          aria-hidden="true"
        />
      )}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 flex h-full flex-col border-r bg-card pt-16 transition-transform duration-200 md:sticky md:top-0 md:z-0 md:translate-x-0 md:pt-0',
          collapsed ? 'md:w-16' : 'md:w-56',
          'w-56',
          mobileOpen ? 'translate-x-0' : '-translate-x-full',
        )}
      >
        <nav className="flex flex-1 flex-col gap-1 p-3" aria-label="Primary">
          {NAV_ITEMS.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              onClick={onCloseMobile}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground',
                  isActive && 'bg-accent text-accent-foreground',
                )
              }
            >
              <Icon className="size-4 shrink-0" />
              <span className={cn(collapsed && 'md:hidden')}>{label}</span>
            </NavLink>
          ))}
        </nav>
        <div className="hidden border-t p-3 md:block">
          <Button
            variant="ghost"
            size="icon"
            className="w-full justify-center"
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            onClick={onToggleCollapsed}
          >
            {collapsed ? <ChevronsRight className="size-4" /> : <ChevronsLeft className="size-4" />}
          </Button>
        </div>
      </aside>
    </>
  )
}
