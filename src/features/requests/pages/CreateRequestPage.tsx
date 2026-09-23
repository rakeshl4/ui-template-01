import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { PageHeader } from '@/components/layout/PageHeader'
import { useCreateRequest } from '@/features/requests/api/queries'
import { RequestForm, type SubmitStatus } from '@/features/requests/components/RequestForm'
import type { RequestFormValues } from '@/features/requests/schema'

export function CreateRequestPage() {
  const navigate = useNavigate()
  const createRequest = useCreateRequest()

  async function handleSubmit(values: RequestFormValues, status: SubmitStatus) {
    const created = await createRequest.mutateAsync({ ...values, status })
    toast.success(status === 'Draft' ? 'Request saved as draft' : 'Request submitted', {
      description: created.title,
    })
    navigate(`/requests/${created.id}`)
  }

  return (
    <div>
      <PageHeader
        title="New request"
        description="Fill out the details below to submit a new request."
        breadcrumbs={[{ label: 'Requests', to: '/requests' }, { label: 'New' }]}
      />
      <RequestForm onSubmit={handleSubmit} />
    </div>
  )
}
