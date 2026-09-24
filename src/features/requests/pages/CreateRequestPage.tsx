import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { PageHeader } from '@/components/layout/PageHeader'
import { useCreateRequest } from '@/features/requests/api/queries'
import { RequestForm } from '@/features/requests/components/RequestForm'
import type { RequestFormValues } from '@/features/requests/schema'

export function CreateRequestPage() {
  const navigate = useNavigate()
  const createRequest = useCreateRequest()

  async function handleSubmit(values: RequestFormValues) {
    const created = await createRequest.mutateAsync(values)
    toast.success('Protocol document submitted', { description: created.title })
    navigate(`/requests/${created.id}`)
  }

  return (
    <div>
      <PageHeader
        title="New protocol document"
        description="Fill out the details below to submit a new protocol document."
        breadcrumbs={[{ label: 'Protocol Documents', to: '/requests' }, { label: 'New' }]}
      />
      <RequestForm onSubmit={handleSubmit} />
    </div>
  )
}
