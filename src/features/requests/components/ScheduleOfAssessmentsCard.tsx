import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ExtractionStatus } from '@/features/requests/components/ExtractionStatus'
import type { Request } from '@/features/requests/schema'

export function ScheduleOfAssessmentsCard({ request }: { request: Request }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Schedule of Assessments</CardTitle>
      </CardHeader>
      <CardContent>
        <ExtractionStatus request={request} />
      </CardContent>
    </Card>
  )
}
