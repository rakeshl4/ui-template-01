import { CheckCircle2, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { useApproveRequest, useRequest } from '@/features/requests/api/queries'
import type { Request } from '@/features/requests/schema'

/** Approving is only possible once extraction has finished (status 'Ready'). */
export function ApproveRequestButton({ request: initial }: { request: Request }) {
  const { data } = useRequest(initial.id)
  const request = data ?? initial
  const approve = useApproveRequest(request.id)

  if (request.status !== 'Ready') return null

  return (
    <Button
      size="sm"
      disabled={approve.isPending}
      onClick={() =>
        approve.mutate(undefined, {
          onSuccess: () => toast.success('Protocol document approved', { description: request.title }),
          onError: (err) => toast.error('Could not approve protocol document', { description: err.message }),
        })
      }
    >
      {approve.isPending ? (
        <Loader2 className="size-4 animate-spin" />
      ) : (
        <CheckCircle2 className="size-4" />
      )}
      Approve
    </Button>
  )
}
