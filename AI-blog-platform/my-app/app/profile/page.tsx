"use client"

import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/auth-context'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Crown, Star } from 'lucide-react'

export default function ProfilePage() {
  const { user, isLoading, logout } = useAuth()
  const router = useRouter()
  
  // Format date to display nicely
  const formatDate = (date: Date | string | null | undefined) => {
    if (!date) return 'N/A'
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }


  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          <p>Loading...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    router.push('/auth')
    return null
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Your Profile</h1>
        
        <div className="grid gap-6 md:grid-cols-3">
          {/* User Info Card */}
          <Card className="md:col-span-2">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl">Account Information</CardTitle>
                <div className="flex items-center space-x-2">
                  {user.role === 'ADMIN' && (
                    <Badge variant="outline" className="bg-amber-100 text-amber-800 hover:bg-amber-100">
                      <Crown className="h-3 w-3 mr-1" />
                      Admin
                    </Badge>
                  )}
                  <Badge 
                    variant="outline" 
                    className="bg-primary/10 text-primary hover:bg-primary/10"
                  >
                    <Star className="h-3 w-3 mr-1" />
                    User
                  </Badge>
                </div>
              </div>
              <CardDescription>
                Manage your account details
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1">
                <p className="text-sm font-medium">Name</p>
                <p className="text-base">{user.name}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium">Email</p>
                <p className="text-base">{user.email}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium">Member Since</p>
                <p className="text-base">{formatDate(user.createdAt)}</p>
              </div>
              {user.role === 'ADMIN' && (
                <div className="mt-4">
                  <Button 
                    variant="outline" 
                    className="w-full" 
                    onClick={() => router.push('/admin')}
                  >
                    <Crown className="h-4 w-4 mr-2" />
                    Go to Admin Dashboard
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

        </div>

        <div className="mt-8 pt-6 border-t">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Account Actions</h2>
          </div>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <Button variant="outline" onClick={() => router.push('/blog')}>
              Go to Blog
            </Button>
            <Button variant="destructive" onClick={logout}>
              Sign Out
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}