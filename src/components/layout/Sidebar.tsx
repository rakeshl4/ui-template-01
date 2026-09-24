import { NavLink } from 'react-router-dom'
import { ChevronsLeft, ChevronsRight, ListChecks, PlusCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

const NAV_ITEMS = [
  { to: '/requests', label: 'All protocol documents', icon: ListChecks, end: true },
  { to: '/requests/new', label: 'New protocol document', icon: PlusCircle, end: false },
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
          'bg-card fixed inset-y-0 left-0 z-50 flex h-full flex-col border-r pt-16 transition-[transform,width] duration-200 md:sticky md:top-16 md:z-0 md:h-[calc(100vh-4rem)] md:translate-x-0 md:pt-0',
          collapsed ? 'md:w-16' : 'md:w-64',
          'w-64',
          mobileOpen ? 'translate-x-0 shadow-brand' : '-translate-x-full',
        )}
      >
        <nav className="flex flex-1 flex-col gap-1 p-3" aria-label="Primary">
          {/* <p
            className={cn(
              'text-muted-foreground px-3 pt-2 pb-1 text-xs font-bold tracking-wider uppercase',
              collapsed && 'md:hidden',
            )}
          >
            Protocols
          </p> */}
          {NAV_ITEMS.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              title={collapsed ? label : undefined}
              onClick={onCloseMobile}
              className={({ isActive }) =>
                cn(
                  'focus-visible:ring-ring flex items-center gap-3 border-l-4 border-transparent px-3 py-2.5 text-sm font-medium text-muted-foreground outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:ring-2',
                  collapsed && 'md:justify-center md:px-0',
                  isActive && 'border-primary bg-accent font-bold text-accent-foreground',
                )
              }
            >
              <Icon className="size-5 shrink-0" />
              <span className={cn('truncate', collapsed && 'md:hidden')}>{label}</span>
            </NavLink>
          ))}
        </nav>
        <div className="hidden border-t p-3 md:block">
          <Button
            variant="ghost"
            className={cn(
              'text-muted-foreground w-full gap-2',
              collapsed ? 'justify-center px-0' : 'justify-start px-3',
            )}
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            onClick={onToggleCollapsed}
          >
            {collapsed ? (
              <ChevronsRight className="size-4" />
            ) : (
              <>
                <ChevronsLeft className="size-4" />
                <span className="text-sm">Collapse</span>
              </>
            )}
          </Button>
        </div>
      </aside>
    </>
  )
}
