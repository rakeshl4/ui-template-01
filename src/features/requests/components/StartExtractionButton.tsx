import { useState } from 'react'
import { Loader2, ScanText } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { isExtracting, useRequest, useStartExtraction } from '@/features/requests/api/queries'
import type { Request } from '@/features/requests/schema'

interface StartExtractionButtonProps {
  request: Request
  variant?: 'default' | 'outline'
}

export function StartExtractionButton({
  request: initial,
  variant = 'default',
}: StartExtractionButtonProps) {
  const [confirmOpen, setConfirmOpen] = useState(false)
  const { data } = useRequest(initial.id)
  const request = data ?? initial
  const start = useStartExtraction(request.id)

  const running = isExtracting(request) || start.isPending
  const hasRun = request.status === 'Ready' || request.status === 'Approved'

  function run() {
    start.mutate(undefined, {
      onError: (err) => toast.error('Could not start extraction', { description: err.message }),
    })
  }

  const disabledReason = running ? 'Extraction is already running' : undefined

  return (
    <>
      {/* Wrapper carries the tooltip because disabled buttons don't receive pointer events. */}
      <span title={disabledReason} className="inline-flex">
        <Button
          variant={variant}
          size="sm"
          disabled={Boolean(disabledReason)}
          onClick={() => (hasRun ? setConfirmOpen(true) : run())}
        >
          {running ? <Loader2 className="size-4 animate-spin" /> : <ScanText className="size-4" />}
          Start Extraction
        </Button>
      </span>

      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Start extraction?</AlertDialogTitle>
            <AlertDialogDescription>
              This replaces the previously extracted tables and any footnote edits you have saved.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={run}>Start Extraction</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
