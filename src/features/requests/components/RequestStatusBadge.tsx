import { cn } from '@/lib/utils'
import type { Request } from '@/features/requests/schema'

type Status = Request['status']

const STATUS_STYLES: Record<Status, string> = {
  Draft: 'bg-grey-lighter text-grey-dark border-grey-light',
  Submitted: 'bg-primary-50 text-primary-700 border-primary-200',
  'In Review': 'bg-amber-50 text-amber-700 border-amber-200',
  Approved: 'bg-secondary-50 text-secondary-700 border-secondary-200',
  Rejected: 'bg-red-50 text-red-700 border-red-200',
}

export function RequestStatusBadge({ status }: { status: Status }) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium whitespace-nowrap',
        STATUS_STYLES[status],
      )}
    >
      {status}
    </span>
  )
}
