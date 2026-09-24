import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'
import { Loader2, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { requestKeys, useDeleteRequest } from '@/features/requests/api/queries'
import type { Request } from '@/features/requests/schema'

export function DeleteRequestButton({ request }: { request: Request }) {
  const [open, setOpen] = useState(false)
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const remove = useDeleteRequest(request.id)

  function confirmDelete() {
    remove.mutate(undefined, {
      onSuccess: () => {
        toast.success('Protocol document deleted', { description: request.title })
        navigate('/requests', { replace: true })
        queryClient.removeQueries({ queryKey: requestKeys.detail(request.id) })
      },
      onError: (err) => {
        setOpen(false)
        toast.error('Could not delete protocol document', { description: err.message })
      },
    })
  }

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        className="text-destructive hover:text-destructive"
        onClick={() => setOpen(true)}
      >
        <Trash2 className="size-4" />
        Delete
      </Button>

      <AlertDialog open={open} onOpenChange={(next) => !remove.isPending && setOpen(next)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this protocol document?</AlertDialogTitle>
            <AlertDialogDescription>
              “{request.title}” ({request.id}) and any extracted Schedule of Assessments data will
              be permanently deleted. This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={remove.isPending}>Cancel</AlertDialogCancel>
            {/* Plain Button: AlertDialogAction would close the dialog before the request finishes. */}
            <Button variant="destructive" disabled={remove.isPending} onClick={confirmDelete}>
              {remove.isPending && <Loader2 className="size-4 animate-spin" />}
              Delete
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
