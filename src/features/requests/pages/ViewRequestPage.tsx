import type { ReactNode } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, Pencil, RotateCw, SearchX } from 'lucide-react'
import { PageHeader } from '@/components/layout/PageHeader'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { useRequest } from '@/features/requests/api/queries'
import { ApiError } from '@/features/requests/api/requestsApi'
import { RequestDetailCard } from '@/features/requests/components/RequestDetailCard'
import { RequestStatusBadge } from '@/features/requests/components/RequestStatusBadge'
import { StatusTimeline } from '@/features/requests/components/StatusTimeline'
import { formatDate } from '@/lib/utils'

function MetadataRow({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4 py-2 text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium text-foreground">{value}</span>
    </div>
  )
}

export function ViewRequestPage() {
  const { id } = useParams<{ id: string }>()
  const { data: request, isPending, isError, error, refetch } = useRequest(id)

  if (isPending) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-24 w-full" />
        <div className="grid gap-6 md:grid-cols-3">
          <Skeleton className="h-64 md:col-span-2" />
          <Skeleton className="h-64" />
        </div>
      </div>
    )
  }

  if (isError) {
    const notFound = error instanceof ApiError && error.status === 404

    return (
      <div className="flex flex-col items-center justify-center gap-4 py-24 text-center">
        <div className="flex size-16 items-center justify-center rounded-full bg-muted text-muted-foreground">
          <SearchX className="size-8" />
        </div>
        <div className="space-y-1">
          <h1 className="font-serif text-2xl font-semibold text-foreground">
            {notFound ? 'Request not found' : 'Something went wrong'}
          </h1>
          <p className="max-w-sm text-sm text-muted-foreground">
            {notFound
              ? `We couldn't find a request with ID "${id}".`
              : 'We ran into a problem loading this request. Please try again.'}
          </p>
        </div>
        <div className="flex gap-2">
          <Button asChild variant="outline">
            <Link to="/requests">Back to requests</Link>
          </Button>
          {!notFound && (
            <Button onClick={() => refetch()}>
              <RotateCw className="size-4" />
              Retry
            </Button>
          )}
        </div>
      </div>
    )
  }

  return (
    <div>
      <PageHeader
        title={request.title}
        breadcrumbs={[{ label: 'Requests', to: '/requests' }, { label: request.id }]}
        description={request.id}
        actions={
          <>
            <RequestStatusBadge status={request.status} />
            <Button variant="outline" size="sm" disabled title="Editing is not available in this preview">
              <Pencil className="size-4" />
              Edit
            </Button>
            <Button asChild variant="secondary" size="sm">
              <Link to="/requests">
                <ArrowLeft className="size-4" />
                Back to list
              </Link>
            </Button>
          </>
        }
      />

      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-2">
          <RequestDetailCard request={request} />
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Details</CardTitle>
            </CardHeader>
            <CardContent className="divide-y">
              <MetadataRow label="Requested by" value={request.requestedBy} />
              <MetadataRow label="Due date" value={formatDate(request.dueDate)} />
              <MetadataRow label="Created" value={formatDate(request.createdAt)} />
              <MetadataRow label="Updated" value={formatDate(request.updatedAt)} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <StatusTimeline request={request} />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
