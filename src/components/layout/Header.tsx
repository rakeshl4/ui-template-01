import { Link } from 'react-router-dom'
import { Menu, User } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { ThemeToggle } from '@/components/theme/theme-toggle'
import { APP_NAME } from '@/lib/constants'
import logo from '@/assets/logo.svg'

interface HeaderProps {
  onToggleSidebar: () => void
}

export function Header({ onToggleSidebar }: HeaderProps) {
  return (
    <header className="bg-background/95 sticky top-0 z-40 flex h-16 items-center gap-3 border-b px-4 backdrop-blur supports-[backdrop-filter]:bg-background/80 md:px-6">
      <Button
        variant="ghost"
        size="icon"
        aria-label="Toggle navigation"
        className="md:hidden"
        onClick={onToggleSidebar}
      >
        <Menu className="size-5" />
      </Button>

      <Link to="/requests" className="flex items-center gap-2">
        <img src={logo} alt="" className="size-8" />
        <span className="font-serif text-lg font-semibold text-foreground">{APP_NAME}</span>
      </Link>

      <div className="ml-auto flex items-center gap-2">
        <ThemeToggle />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" aria-label="User menu">
              <Avatar className="size-8">
                <AvatarFallback>
                  <User className="size-4" />
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Jordan Lee</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem disabled>Profile</DropdownMenuItem>
            <DropdownMenuItem disabled>Sign out</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
