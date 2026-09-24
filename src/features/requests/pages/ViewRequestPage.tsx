import type { ReactNode } from 'react'
import { Link, useParams } from 'react-router-dom'
import { RotateCw, SearchX } from 'lucide-react'
import { PageHeader } from '@/components/layout/PageHeader'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { useRequest } from '@/features/requests/api/queries'
import { ApiError } from '@/features/requests/api/requestsApi'
import { ApproveRequestButton } from '@/features/requests/components/ApproveRequestButton'
import { DeleteRequestButton } from '@/features/requests/components/DeleteRequestButton'
import { RequestDetailCard } from '@/features/requests/components/RequestDetailCard'
import { RequestDocumentsCard } from '@/features/requests/components/RequestDocumentsCard'
import { ScheduleOfAssessmentsCard } from '@/features/requests/components/ScheduleOfAssessmentsCard'
import { StartExtractionButton } from '@/features/requests/components/StartExtractionButton'
import { RequestStatusBadge } from '@/features/requests/components/RequestStatusBadge'
import { formatDateTime } from '@/lib/utils'

function MetadataRow({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4 py-2 text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="text-foreground font-medium">{value}</span>
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
        <div className="bg-muted text-muted-foreground flex size-16 items-center justify-center rounded-full">
          <SearchX className="size-8" />
        </div>
        <div className="space-y-1">
          <h1 className="text-foreground font-serif text-2xl font-semibold">
            {notFound ? 'Protocol document not found' : 'Something went wrong'}
          </h1>
          <p className="text-muted-foreground max-w-sm text-sm">
            {notFound
              ? `We couldn't find a protocol document with ID "${id}".`
              : 'We ran into a problem loading this protocol document. Please try again.'}
          </p>
        </div>
        <div className="flex gap-2">
          <Button asChild variant="outline">
            <Link to="/requests">Back to protocol documents</Link>
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
        breadcrumbs={[{ label: 'Protocol Documents', to: '/requests' }, { label: request.id }]}
        description={request.id}
        actions={
          <div className="flex items-center gap-2">
            <ApproveRequestButton request={request} />
            <StartExtractionButton request={request} variant="outline" />
            <DeleteRequestButton request={request} />
          </div>
        }
      />

      <div className="grid gap-6 md:grid-cols-3">
        <div className="space-y-6 md:col-span-2">
          <RequestDetailCard request={request} />
          <ScheduleOfAssessmentsCard request={request} />
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Details</CardTitle>
            </CardHeader>
            <CardContent className="divide-y">
              {/* TODO: restore once login is implemented
              <MetadataRow label="Requested by" value={request.requestedBy} />
              */}
              <MetadataRow label="Status" value={<RequestStatusBadge status={request.status} />} />
              <MetadataRow label="Created" value={formatDateTime(request.createdAt)} />
              <MetadataRow label="Updated" value={formatDateTime(request.updatedAt)} />
            </CardContent>
          </Card>

          <RequestDocumentsCard request={request} />
        </div>
      </div>
    </div>
  )
}
