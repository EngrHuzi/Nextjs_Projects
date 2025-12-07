"use client"

import { useAuth } from '@/contexts/auth-context'
import { UserMenu } from '@/components/auth/user-menu'
import { ThemeToggle } from '@/components/theme-toggle'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'
import { PenTool, Crown } from 'lucide-react'

export function Header() {
  const { user, isAuthenticated } = useAuth()
  const router = useRouter()

  if (!isAuthenticated) {
    return null
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 max-w-screen-2xl items-center px-4">
        {/* Logo - Icon on mobile, full on desktop */}
        <div className="mr-3 md:mr-4 flex items-center flex-shrink-0">
          <a className="flex items-center gap-2" href="/blog">
            <PenTool className="h-5 w-5 md:h-6 md:w-6 flex-shrink-0" />
            <span className="hidden md:inline-block font-bold text-base whitespace-nowrap">
              AI Blog Platform
            </span>
          </a>
        </div>

        <div className="flex flex-1 items-center justify-between gap-2 min-w-0">
          <nav className="flex items-center gap-1 md:gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push('/blog')}
              className="text-xs md:text-sm font-medium transition-colors hover:text-primary px-2 md:px-4"
            >
              <span>Blog</span>
            </Button>
            {user?.role === 'ADMIN' && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push('/admin')}
                className="text-xs md:text-sm font-medium transition-colors hover:text-primary px-2 md:px-4"
              >
                <Crown className="h-4 w-4 mr-1 md:mr-2 flex-shrink-0" />
                <span className="hidden sm:inline">Admin</span>
              </Button>
            )}
          </nav>

          <div className="flex items-center gap-1 md:gap-2 flex-shrink-0">
            <ThemeToggle />
            <UserMenu />
          </div>
        </div>
      </div>
    </header>
  )
}




