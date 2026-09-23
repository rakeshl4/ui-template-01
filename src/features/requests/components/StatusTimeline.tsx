import { Check } from 'lucide-react'
import { cn, formatDateTime } from '@/lib/utils'
import type { Request } from '@/features/requests/schema'

const HAPPY_PATH: Request['status'][] = ['Draft', 'Submitted', 'In Review', 'Approved']

export function StatusTimeline({ request }: { request: Request }) {
  const steps = request.status === 'Rejected' ? [...HAPPY_PATH.slice(0, 3), 'Rejected' as const] : HAPPY_PATH
  const currentIndex = steps.indexOf(request.status)

  return (
    <ol className="space-y-4">
      {steps.map((step, index) => {
        const state = index < currentIndex ? 'complete' : index === currentIndex ? 'current' : 'upcoming'
        return (
          <li key={step} className="flex items-start gap-3">
            <span
              className={cn(
                'flex size-6 shrink-0 items-center justify-center rounded-full border text-xs font-medium',
                state === 'complete' && 'border-secondary-500 bg-secondary-500 text-white',
                state === 'current' && 'border-primary-500 bg-primary-500 text-white',
                state === 'upcoming' && 'border-input bg-background text-muted-foreground',
              )}
            >
              {state === 'complete' ? <Check className="size-3.5" /> : index + 1}
            </span>
            <div className="space-y-0.5 pt-0.5">
              <p
                className={cn(
                  'text-sm font-medium',
                  state === 'upcoming' ? 'text-muted-foreground' : 'text-foreground',
                )}
              >
                {step}
              </p>
              {index === 0 && (
                <p className="text-xs text-muted-foreground">{formatDateTime(request.createdAt)}</p>
              )}
              {index === currentIndex && index !== 0 && (
                <p className="text-xs text-muted-foreground">{formatDateTime(request.updatedAt)}</p>
              )}
            </div>
          </li>
        )
      })}
    </ol>
  )
}
