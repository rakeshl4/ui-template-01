import { useState } from 'react'
import { Search } from 'lucide-react'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { SoaTable } from '@/features/requests/schema'
import { cn } from '@/lib/utils'

const FILTER_THRESHOLD = 5

interface SoaTableNavProps {
  tables: SoaTable[]
  activeId: string
  dirtyIds: Set<string>
  onSelect: (tableId: string) => void
}

/** Sticky left rail listing every extracted table (md and up). */
export function SoaTableNav({ tables, activeId, dirtyIds, onSelect }: SoaTableNavProps) {
  const [filter, setFilter] = useState('')
  const query = filter.trim().toLowerCase()
  const visible = query ? tables.filter((t) => t.title.toLowerCase().includes(query)) : tables

  return (
    <nav aria-label="Extracted tables" className="sticky top-4 hidden space-y-3 md:block">
      <h2 className="text-muted-foreground px-2 text-xs font-semibold tracking-wide uppercase">
        Tables ({tables.length})
      </h2>

      {tables.length > FILTER_THRESHOLD && (
        <div className="relative">
          <Search className="text-muted-foreground pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2" />
          <Input
            aria-label="Filter tables"
            placeholder="Filter tables…"
            className="h-8 pl-8"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          />
        </div>
      )}

      <ul className="space-y-1">
        {visible.map((table) => {
          const active = table.id === activeId
          const dirty = dirtyIds.has(table.id)
          return (
            <li key={table.id}>
              <button
                type="button"
                aria-current={active ? 'page' : undefined}
                onClick={() => onSelect(table.id)}
                className={cn(
                  'flex w-full items-start gap-3 rounded-md border border-transparent px-2 py-2 text-left text-sm transition-colors',
                  'hover:bg-accent hover:text-accent-foreground focus-visible:ring-ring/50 focus-visible:ring-[3px] focus-visible:outline-none',
                  active && 'border-border bg-accent text-accent-foreground',
                )}
              >
                <span
                  className={cn(
                    'mt-0.5 flex size-5 shrink-0 items-center justify-center rounded text-xs font-semibold tabular-nums',
                    active
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-muted-foreground',
                  )}
                >
                  {table.index}
                </span>
                <span className="flex min-w-0 flex-1 items-center gap-1.5">
                  <span className={cn('truncate', active && 'font-medium')}>{table.title}</span>
                  {dirty && (
                    <span
                      className="size-1.5 shrink-0 rounded-full bg-amber-500"
                      title="Unsaved changes"
                      aria-label="Unsaved changes"
                    />
                  )}
                </span>
              </button>
            </li>
          )
        })}
        {visible.length === 0 && (
          <li className="text-muted-foreground px-2 py-2 text-sm">No tables match “{filter}”.</li>
        )}
      </ul>
    </nav>
  )
}

/** Compact table picker shown instead of the rail on small screens. */
export function SoaTableSelect({ tables, activeId, dirtyIds, onSelect }: SoaTableNavProps) {
  return (
    <div className="md:hidden">
      <Select value={activeId} onValueChange={onSelect}>
        <SelectTrigger className="w-full" aria-label="Select table">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {tables.map((table) => (
            <SelectItem key={table.id} value={table.id}>
              {table.index}. {table.title}
              {dirtyIds.has(table.id) ? ' •' : ''}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
