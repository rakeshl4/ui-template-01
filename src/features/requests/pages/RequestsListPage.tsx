import { useState } from 'react'
import { Link } from 'react-router-dom'
import { FileQuestion, Plus, RotateCw } from 'lucide-react'
import { PageHeader } from '@/components/layout/PageHeader'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { useRequests } from '@/features/requests/api/queries'
import { RequestsFilters } from '@/features/requests/components/RequestsFilters'
import { RequestsTable } from '@/features/requests/components/RequestsTable'
import type { RequestFilters } from '@/features/requests/schema'

export function RequestsListPage() {
  const [filters, setFilters] = useState<RequestFilters>({ sort: 'createdAt-desc' })
  const { data: requests, isPending, isError, refetch } = useRequests(filters)

  const hasActiveFilters = Boolean(filters.search || filters.status)

  return (
    <div>
      <PageHeader
        title="Requests"
        description="Browse, search and track every request submitted across the organisation."
        actions={
          <Button asChild>
            <Link to="/requests/new">
              <Plus className="size-4" />
              New request
            </Link>
          </Button>
        }
      />

      <RequestsFilters filters={filters} onChange={setFilters} />

      {isPending && (
        <div className="space-y-2">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
      )}

      {isError && (
        <div className="flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed py-16 text-center">
          <p className="text-sm text-muted-foreground">Failed to load requests.</p>
          <Button variant="outline" size="sm" onClick={() => refetch()}>
            <RotateCw className="size-4" />
            Retry
          </Button>
        </div>
      )}

      {requests && requests.length === 0 && (
        <div className="flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed py-16 text-center">
          <div className="flex size-14 items-center justify-center rounded-full bg-muted text-muted-foreground">
            <FileQuestion className="size-7" />
          </div>
          <div className="space-y-1">
            <p className="font-medium text-foreground">
              {hasActiveFilters ? 'No requests match your filters' : 'No requests yet'}
            </p>
            <p className="text-sm text-muted-foreground">
              {hasActiveFilters
                ? 'Try adjusting your search or filters.'
                : 'Get started by creating your first request.'}
            </p>
          </div>
          {!hasActiveFilters && (
            <Button asChild size="sm">
              <Link to="/requests/new">
                <Plus className="size-4" />
                New request
              </Link>
            </Button>
          )}
        </div>
      )}

      {requests && requests.length > 0 && <RequestsTable requests={requests} />}
    </div>
  )
}
