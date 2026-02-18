'use client'

import { Button } from '@/components/ui/button'
import { BookMarked, Home, MessageSquare, GithubIcon, Settings } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ThemeSwitcher } from '@/components/theme-switcher'

interface NavbarProps {
  showBackButton?: boolean
}

export function Navbar({ showBackButton = false }: NavbarProps) {
  const router = useRouter()

  return (
    <nav className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-20 safe-top" aria-label="Main navigation">
      <div className="max-w-6xl mx-auto px-3 sm:px-4 h-14 sm:h-16 flex items-center justify-between gap-2">
        <Link href="/" className="flex items-center gap-2 group min-h-[44px] min-w-[44px] items-center sm:min-w-0 sm:min-h-0" aria-label="ShikshaSahayak home">
          <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center group-hover:shadow-lg transition-all shrink-0">
            <BookMarked className="h-5 w-5 text-white" aria-hidden />
          </div>
          <span className="font-bold text-foreground hidden sm:inline">ShikshaSahayak</span>
        </Link>

        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {showBackButton && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.back()}
              className="gap-2 bg-transparent min-h-[40px] sm:min-h-0"
              aria-label="Go back"
            >
              <Home className="h-4 w-4" aria-hidden />
              <span className="hidden sm:inline">Back</span>
            </Button>
          )}

          <Button variant="outline" size="sm" asChild className="gap-2 bg-transparent hidden sm:flex min-h-[40px]">
            <Link href="/">
              <MessageSquare className="h-4 w-4" aria-hidden />
              Chat
            </Link>
          </Button>

          <ThemeSwitcher />

          <Button variant="ghost" size="icon" asChild className="h-10 w-10 min-h-[44px] min-w-[44px] sm:h-8 sm:w-8 sm:min-h-0 sm:min-w-0" aria-label="Settings">
            <Link href="/settings">
              <Settings className="h-4 w-4" aria-hidden />
            </Link>
          </Button>

          <Button variant="ghost" size="icon" className="h-10 w-10 min-h-[44px] min-w-[44px] sm:h-8 sm:w-8 sm:min-h-0 sm:min-w-0" aria-label="GitHub">
            <GithubIcon className="h-4 w-4" aria-hidden />
          </Button>
        </div>
      </div>
    </nav>
  )
}
