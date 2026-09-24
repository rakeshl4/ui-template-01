import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { Request } from '@/features/requests/schema'

export function RequestDetailCard({ request }: { request: Request }) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Description</CardTitle>
        </CardHeader>
        <CardContent>
          {request.description ? (
            <p className="whitespace-pre-wrap text-sm leading-relaxed text-foreground">
              {request.description}
            </p>
          ) : (
            <p className="text-sm text-muted-foreground">No description provided.</p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
