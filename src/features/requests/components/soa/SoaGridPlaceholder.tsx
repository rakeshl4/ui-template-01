import { Table2 } from 'lucide-react'

/**
 * Stand-in for the extracted grid. The overflow wrapper and min-height are already sized for
 * a wide SoA table so the real grid can replace the inner box without layout changes.
 */
export function SoaGridPlaceholder() {
  return (
    <div className="overflow-x-auto" data-testid="soa-grid">
      <div className="bg-muted/30 flex min-h-72 flex-col items-center justify-center gap-3 rounded-lg border-2 border-dashed p-8 text-center">
        <div className="bg-muted text-muted-foreground flex size-12 items-center justify-center rounded-full">
          <Table2 className="size-6" />
        </div>
      </div>
    </div>
  )
}
