import { useNavigate } from 'react-router-dom'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { RequestStatusBadge } from '@/features/requests/components/RequestStatusBadge'
import { formatDate } from '@/lib/utils'
import type { Request } from '@/features/requests/schema'

export function RequestsTable({ requests }: { requests: Request[] }) {
  const navigate = useNavigate()

  return (
    <>
      <div className="hidden overflow-hidden rounded-lg border md:block">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Title</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Created</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {requests.map((request) => (
              <TableRow
                key={request.id}
                className="cursor-pointer"
                tabIndex={0}
                onClick={() => navigate(`/requests/${request.id}`)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') navigate(`/requests/${request.id}`)
                }}
              >
                <TableCell className="font-mono text-xs text-muted-foreground">
                  {request.id}
                </TableCell>
                <TableCell className="font-medium text-foreground">{request.title}</TableCell>
                <TableCell>
                  <RequestStatusBadge status={request.status} />
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {formatDate(request.createdAt)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <ul className="space-y-3 md:hidden">
        {requests.map((request) => (
          <li key={request.id}>
            <button
              type="button"
              onClick={() => navigate(`/requests/${request.id}`)}
              className="w-full space-y-2 rounded-lg border bg-card p-4 text-left transition-colors hover:bg-accent"
            >
              <div className="flex items-start justify-between gap-2">
                <span className="font-medium text-foreground">{request.title}</span>
                <RequestStatusBadge status={request.status} />
              </div>
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                <span className="font-mono">{request.id}</span>
                <span>{formatDate(request.createdAt)}</span>
              </div>
            </button>
          </li>
        ))}
      </ul>
    </>
  )
}
