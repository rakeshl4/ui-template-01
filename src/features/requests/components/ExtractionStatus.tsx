import { Link, useNavigate } from 'react-router-dom'
import { ArrowRight, CheckCircle2, FileText, Loader2, Table2, XCircle } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { isExtracting, useExtraction, useRequest } from '@/features/requests/api/queries'
import type { Request } from '@/features/requests/schema'
import { soaResultsPath } from '@/features/requests/utils/paths'

/** Extraction progress / results summary, driven entirely by the request status. */
export function ExtractionStatus({ request: initial }: { request: Request }) {
  const navigate = useNavigate()
  const { data } = useRequest(initial.id, {
    onExtractionComplete: (completed) => {
      if (completed.status === 'Failed') {
        toast.error('Extraction failed', {
          description: completed.error ?? 'The Schedule of Assessments could not be extracted.',
        })
        return
      }
      toast.success('Extraction complete', {
        description: 'Schedule of Assessments tables are ready to review.',
        action: { label: 'View', onClick: () => navigate(soaResultsPath(initial.id)) },
      })
    },
  })
  const request = data ?? initial
  const hasResults = request.status === 'Ready' || request.status === 'Approved'
  const { data: extraction } = useExtraction(request.id, { enabled: hasResults })

  if (isExtracting(request)) {
    return (
      <div
        className="text-foreground flex items-center gap-2 text-sm font-medium"
        aria-live="polite"
      >
        <Loader2 className="text-primary size-4 animate-spin" />
        Extraction in progress…
      </div>
    )
  }

  if (request.status === 'Failed') {
    return (
      <div
        className="border-red-200 bg-red-50 space-y-1 rounded-md border p-3 text-sm"
        role="alert"
      >
        <p className="text-red-700 flex items-center gap-2 font-medium">
          <XCircle className="size-4 shrink-0" />
          Extraction failed
        </p>
        <p className="text-red-700 pl-6 break-words">
          {request.error ?? 'No error details were returned.'}
        </p>
        <p className="text-muted-foreground pl-6">Start the extraction again to retry.</p>
      </div>
    )
  }

  if (!hasResults) {
    return <p className="text-muted-foreground text-sm">No extraction has been run yet.</p>
  }

  return (
    <div className="space-y-3 text-sm">
      <p className="text-foreground flex items-center gap-2">
        <CheckCircle2 className="text-primary size-4" />
        <span>
          {extraction
            ? `${extraction.tables.length} table${extraction.tables.length === 1 ? '' : 's'} extracted`
            : 'Extraction complete'}
        </span>
      </p>
      {extraction && (
        <ul className="space-y-1">
          {extraction.tables.map((table) => (
            <li key={table.id}>
              <Link
                to={soaResultsPath(request.id, table.id)}
                className="hover:bg-accent hover:text-accent-foreground flex items-center gap-2 rounded-md px-2 py-1.5"
              >
                <Table2 className="text-muted-foreground size-4 shrink-0" />
                <span className="truncate">{table.title}</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
      <div className="flex flex-wrap items-center gap-2">
        <Button asChild size="sm">
          <Link to={soaResultsPath(request.id)}>
            View results
            <ArrowRight className="size-4" />
          </Link>
        </Button>
        {/* Wrapper carries the tooltip because disabled buttons don't receive pointer events. */}
        <span
          title={request.status === 'Approved' ? undefined : 'Approve the request to enable this'}
          className="inline-flex"
        >
          <Button
            size="sm"
            variant="outline"
            disabled={request.status !== 'Approved'}
            onClick={() =>
              toast.info('POP document generation is not available in this preview yet.')
            }
          >
            <FileText className="size-4" />
            Generate POP document
          </Button>
        </span>
      </div>
    </div>
  )
}
