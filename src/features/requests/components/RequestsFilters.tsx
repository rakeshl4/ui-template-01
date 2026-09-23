import { Search } from 'lucide-react'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { STATUSES } from '@/lib/constants'
import type { RequestFilters } from '@/features/requests/schema'

const ALL = '__all__'

interface RequestsFiltersProps {
  filters: RequestFilters
  onChange: (filters: RequestFilters) => void
}

export function RequestsFilters({ filters, onChange }: RequestsFiltersProps) {
  return (
    <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
      <div className="relative flex-1 sm:max-w-xs">
        <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Search by title, ID or requester"
          className="pl-9"
          value={filters.search ?? ''}
          onChange={(e) => onChange({ ...filters, search: e.target.value })}
          aria-label="Search requests"
        />
      </div>

      <Select
        value={filters.status ?? ALL}
        onValueChange={(v) => onChange({ ...filters, status: v === ALL ? undefined : (v as RequestFilters['status']) })}
      >
        <SelectTrigger className="sm:w-40" aria-label="Filter by status">
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={ALL}>All statuses</SelectItem>
          {STATUSES.map((status) => (
            <SelectItem key={status} value={status}>
              {status}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={filters.sort ?? 'createdAt-desc'}
        onValueChange={(v) => onChange({ ...filters, sort: v as RequestFilters['sort'] })}
      >
        <SelectTrigger className="sm:w-48" aria-label="Sort by created date">
          <SelectValue placeholder="Sort" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="createdAt-desc">Newest first</SelectItem>
          <SelectItem value="createdAt-asc">Oldest first</SelectItem>
        </SelectContent>
      </Select>
    </div>
  )
}
