"use client"

import { useAuth } from '@/contexts/auth-context'
import { UserMenu } from '@/components/auth/user-menu'
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
      <div className="container flex h-14 max-w-screen-2xl items-center">
        <div className="mr-4 hidden md:flex">
          <a className="mr-6 flex items-center space-x-2" href="/blog">
            <PenTool className="h-6 w-6" />
            <span className="hidden font-bold sm:inline-block">
              AI Blog Platform
            </span>
          </a>
        </div>
        
        <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
          <div className="w-full flex-1 md:w-auto md:flex-none">
            <nav className="flex items-center space-x-4">
              <Button
                variant="ghost"
                onClick={() => router.push('/blog')}
                className="text-sm font-medium transition-colors hover:text-primary"
              >
                Blog
              </Button>
              {user?.role === 'ADMIN' && (
                <Button
                  variant="ghost"
                  onClick={() => router.push('/admin')}
                  className="text-sm font-medium transition-colors hover:text-primary"
                >
                  <Crown className="h-4 w-4 mr-2" />
                  Admin
                </Button>
              )}
            </nav>
          </div>
          
          <div className="flex items-center space-x-2">
            <UserMenu />
          </div>
        </div>
      </div>
    </header>
  )
}




