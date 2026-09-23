import { Paperclip } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { Request } from '@/features/requests/schema'

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export function RequestDetailCard({ request }: { request: Request }) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Description</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="whitespace-pre-wrap text-sm leading-relaxed text-foreground">
            {request.description}
          </p>
        </CardContent>
      </Card>

      {request.attachments && request.attachments.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Attachments</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {request.attachments.map((file) => (
                <li
                  key={file.name}
                  className="flex items-center gap-2 rounded-md border bg-card px-3 py-2 text-sm"
                >
                  <Paperclip className="size-4 shrink-0 text-muted-foreground" />
                  <span className="truncate">{file.name}</span>
                  <span className="ml-auto shrink-0 text-xs text-muted-foreground">
                    {formatBytes(file.size)}
                  </span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
