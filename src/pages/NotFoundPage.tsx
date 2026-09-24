import { Link } from 'react-router-dom'
import { Compass } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function NotFoundPage() {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-24 text-center">
      <div className="flex size-16 items-center justify-center rounded-full bg-muted text-muted-foreground">
        <Compass className="size-8" />
      </div>
      <div className="space-y-1">
        <h1 className="font-serif text-2xl font-semibold text-foreground">Page not found</h1>
        <p className="max-w-sm text-sm text-muted-foreground">
          The page you're looking for doesn't exist or may have been moved.
        </p>
      </div>
      <Button asChild>
        <Link to="/requests">Back to protocol documents</Link>
      </Button>
    </div>
  )
}
