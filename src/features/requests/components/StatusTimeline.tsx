import { Check } from 'lucide-react'
import { STATUSES } from '@/lib/constants'
import { cn, formatDateTime } from '@/lib/utils'
import type { Request } from '@/features/requests/schema'

export function StatusTimeline({ request }: { request: Request }) {
  const steps = STATUSES
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
