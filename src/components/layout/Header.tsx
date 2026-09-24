import { Link } from 'react-router-dom'
import { Menu } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { APP_NAME } from '@/lib/constants'
import logo from '@/assets/logo.svg'

interface HeaderProps {
  onToggleSidebar: () => void
}

export function Header({ onToggleSidebar }: HeaderProps) {
  return (
    <header className="bg-background shadow-brand sticky top-0 z-40 flex h-16 items-center gap-3 px-4 md:px-6">
      <Button
        variant="ghost"
        size="icon"
        aria-label="Toggle navigation"
        className="md:hidden"
        onClick={onToggleSidebar}
      >
        <Menu className="size-5" />
      </Button>

      <Link
        to="/requests"
        className="focus-visible:ring-ring flex items-center gap-3 outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
      >
        <img src={logo} alt="" className="size-9 dark:brightness-0 dark:invert" />
        <span className="text-foreground font-serif text-xl font-semibold tracking-tight">
          {APP_NAME}
        </span>
      </Link>

      <div className="ml-auto flex items-center gap-2">
        {/* TODO: user menu — restore once login is implemented (DropdownMenu + Avatar) */}
      </div>
    </header>
  )
}
