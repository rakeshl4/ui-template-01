import { FileText } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { Request } from '@/features/requests/schema'

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export function RequestDocumentsCard({ request }: { request: Request }) {
  const documents = request.attachments ?? []

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Documents</CardTitle>
      </CardHeader>
      <CardContent>
        {documents.length === 0 ? (
          <p className="text-muted-foreground text-sm">No documents uploaded.</p>
        ) : (
          <ul className="space-y-2">
            {documents.map((file, index) => (
              <li
                key={`${file.name}-${index}`}
                className="bg-card flex items-center gap-2 rounded-md border px-3 py-2 text-sm"
              >
                <FileText className="text-muted-foreground size-4 shrink-0" />
                <span className="truncate" title={file.name}>
                  {file.name}
                </span>
                <span className="text-muted-foreground ml-auto shrink-0 text-xs">
                  {formatBytes(file.size)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  )
}
