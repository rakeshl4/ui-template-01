import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import type { SoaFootnote, SoaTable } from '@/features/requests/schema'
import { SoaFootnotesEditor } from '@/features/requests/components/soa/SoaFootnotesEditor'
import { SoaGrid } from '@/features/requests/components/soa/SoaGrid'
import { toggleCell } from '@/features/requests/utils/schedule'

interface SoaTableViewProps {
  table: SoaTable
  position: number
  total: number
  footnotes: SoaFootnote[]
  scheduleItems: string[]
  dirty: boolean
  saving: boolean
  /** Disables editing, e.g. while a re-extraction is about to replace the tables. */
  locked?: boolean
  showErrors: boolean
  onFootnotesChange: (footnotes: SoaFootnote[]) => void
  /** Receives an updater so rapid toggles never read a stale schedule. */
  onScheduleChange: (update: (scheduleItems: string[]) => string[]) => void
  onPrev: () => void
  onNext: () => void
}

export function SoaTableView({
  table,
  position,
  total,
  footnotes,
  scheduleItems,
  dirty,
  saving,
  locked = false,
  showErrors,
  onFootnotesChange,
  onScheduleChange,
  onPrev,
  onNext,
}: SoaTableViewProps) {
  return (
    <Card className="min-w-0">
      <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-muted-foreground text-xs font-medium">
              Table {position} of {total}
            </p>
            {dirty && (
              <Badge variant="outline" className="text-xs">
                Unsaved changes
              </Badge>
            )}
          </div>
          <h2 className="text-foreground flex flex-wrap items-center gap-2 font-serif text-xl font-semibold">
            {table.title}
            {table.pageRange && (
              <Badge variant="outline" className="font-sans">
                p. {table.pageRange}
              </Badge>
            )}
          </h2>
        </div>
        <div className="flex shrink-0 items-center gap-1">
          <Button
            variant="outline"
            size="sm"
            onClick={onPrev}
            disabled={position <= 1}
            aria-keyshortcuts="["
          >
            <ChevronLeft className="size-4" />
            Prev
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={onNext}
            disabled={position >= total}
            aria-keyshortcuts="]"
          >
            Next
            <ChevronRight className="size-4" />
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        <SoaGrid
          key={`${table.id}-grid`}
          table={table}
          scheduleItems={scheduleItems}
          footnotes={footnotes}
          disabled={saving || locked}
          onToggle={(key) => onScheduleChange((items) => toggleCell(items, key))}
        />
        <Separator />
        <SoaFootnotesEditor
          key={`${table.id}-footnotes`}
          tableId={table.id}
          procedures={table.procedures}
          footnotes={footnotes}
          savedFootnotes={table.footnotes}
          onChange={onFootnotesChange}
          showErrors={showErrors}
          disabled={saving || locked}
        />
      </CardContent>
    </Card>
  )
}
