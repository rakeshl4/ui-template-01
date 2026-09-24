import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { FileDropzone } from '@/features/requests/components/FileDropzone'
import { UnsavedChangesGuard } from '@/features/requests/components/UnsavedChangesGuard'
import { requestFormSchema, type RequestFormValues } from '@/features/requests/schema'

function RequiredMark() {
  return (
    <span className="text-destructive" aria-hidden="true">
      {' '}
      *
    </span>
  )
}

interface RequestFormProps {
  onSubmit: (values: RequestFormValues) => Promise<void>
}

export function RequestForm({ onSubmit }: RequestFormProps) {
  const navigate = useNavigate()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<RequestFormValues>({
    resolver: zodResolver(requestFormSchema),
    defaultValues: {
      title: '',
      description: '',
      // requestedBy: '', // TODO: restore once login is implemented
      attachments: [],
    },
  })

  const submit = form.handleSubmit(async (values) => {
    setIsSubmitting(true)
    try {
      await onSubmit(values)
    } finally {
      setIsSubmitting(false)
    }
  })

  return (
    <Form {...form}>
      <UnsavedChangesGuard isDirty={form.formState.isDirty && !isSubmitting} />
      <form className="space-y-6 pb-28">
        <Card>
          <CardHeader>
            <CardTitle>Protocol document details</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-6 md:grid-cols-2">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem className="md:col-span-2">
                  <FormLabel>
                    Title
                    <RequiredMark />
                  </FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. ONC-2041 Phase II Protocol v3.0" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem className="md:col-span-2">
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea rows={5} placeholder="Describe the " {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Protocol Document</CardTitle>
          </CardHeader>
          <CardContent>
            <FormField
              control={form.control}
              name="attachments"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <FileDropzone value={field.value ?? []} onChange={field.onChange} />
                  </FormControl>
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        <div className="sticky bottom-0 -mx-4 flex flex-col-reverse gap-2 border-t bg-background/95 px-4 py-4 backdrop-blur sm:flex-row sm:justify-end supports-[backdrop-filter]:bg-background/80 md:-mx-8 md:px-8">
          <Button
            type="button"
            variant="secondary"
            disabled={isSubmitting}
            onClick={() => navigate('/requests')}
          >
            Cancel
          </Button>
          <Button type="button" disabled={isSubmitting} onClick={submit}>
            {isSubmitting && <Loader2 className="size-4 animate-spin" />}
            Save
          </Button>
        </div>
      </form>
    </Form>
  )
}
