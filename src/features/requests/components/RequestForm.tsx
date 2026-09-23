import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { CalendarIcon, Loader2 } from 'lucide-react'
import { cn, formatDate } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Calendar } from '@/components/ui/calendar'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { FileDropzone } from '@/features/requests/components/FileDropzone'
import { UnsavedChangesGuard } from '@/features/requests/components/UnsavedChangesGuard'
import { requestFormSchema, type RequestFormValues } from '@/features/requests/schema'

const DESCRIPTION_MIN = 20

function RequiredMark() {
  return (
    <span className="text-destructive" aria-hidden="true">
      {' '}
      *
    </span>
  )
}

export type SubmitStatus = 'Draft' | 'Submitted'

interface RequestFormProps {
  onSubmit: (values: RequestFormValues, status: SubmitStatus) => Promise<void>
}

export function RequestForm({ onSubmit }: RequestFormProps) {
  const navigate = useNavigate()
  const [pendingStatus, setPendingStatus] = useState<SubmitStatus | null>(null)

  const form = useForm<RequestFormValues>({
    resolver: zodResolver(requestFormSchema),
    defaultValues: {
      title: '',
      description: '',
      requestedBy: '',
      dueDate: undefined,
      attachments: [],
    },
  })

  const description = form.watch('description') ?? ''
  const isSubmitting = pendingStatus !== null

  function submitAs(status: SubmitStatus) {
    return form.handleSubmit(async (values) => {
      setPendingStatus(status)
      try {
        await onSubmit(values, status)
      } finally {
        setPendingStatus(null)
      }
    })
  }

  return (
    <Form {...form}>
      <UnsavedChangesGuard isDirty={form.formState.isDirty && !isSubmitting} />
      <form className="space-y-6 pb-28">
        <Card>
          <CardHeader>
            <CardTitle>Request details</CardTitle>
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
                    <Input placeholder="e.g. Laptop replacement for finance team" {...field} />
                  </FormControl>
                  <FormDescription>Between 5 and 120 characters.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem className="md:col-span-2">
                  <FormLabel>
                    Description
                    <RequiredMark />
                  </FormLabel>
                  <FormControl>
                    <Textarea rows={5} placeholder="Describe the request in detail..." {...field} />
                  </FormControl>
                  <div className="flex items-center justify-between">
                    <FormDescription>
                      At least {DESCRIPTION_MIN} characters.
                    </FormDescription>
                    <span
                      className={cn(
                        'text-xs text-muted-foreground',
                        description.length < DESCRIPTION_MIN && 'text-destructive',
                      )}
                    >
                      {description.length} characters
                    </span>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="requestedBy"
              render={({ field }) => (
                <FormItem className="md:col-span-2">
                  <FormLabel>
                    Requested by
                    <RequiredMark />
                  </FormLabel>
                  <FormControl>
                    <Input placeholder="Your full name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Timing</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-6 md:grid-cols-2">
            <FormField
              control={form.control}
              name="dueDate"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Due date</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          type="button"
                          variant="outline"
                          className={cn(
                            'w-full justify-start font-normal',
                            !field.value && 'text-muted-foreground',
                          )}
                        >
                          <CalendarIcon className="mr-2 size-4" />
                          {field.value ? formatDate(field.value) : 'No due date'}
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value ? new Date(field.value) : undefined}
                        onSelect={(date) => field.onChange(date ? date.toISOString() : undefined)}
                        disabled={(date) => date < new Date(new Date().toDateString())}
                        autoFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormDescription>Optional — leave blank if there's no deadline.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Attachments</CardTitle>
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
                  <FormDescription>
                    Supporting documents are stored as metadata only in this preview.
                  </FormDescription>
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
          <Button type="button" variant="outline" disabled={isSubmitting} onClick={submitAs('Draft')}>
            {pendingStatus === 'Draft' && <Loader2 className="size-4 animate-spin" />}
            Save as draft
          </Button>
          <Button type="button" disabled={isSubmitting} onClick={submitAs('Submitted')}>
            {pendingStatus === 'Submitted' && <Loader2 className="size-4 animate-spin" />}
            Submit request
          </Button>
        </div>
      </form>
    </Form>
  )
}
