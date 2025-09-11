"use client"

import { useAuth } from "@/contexts/auth-context"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, BookOpen, Sparkles, Users, LogOut } from "lucide-react"

export default function HomePage() {
  const { isAuthenticated, isLoading, user, logout } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/auth")
    }
  }, [isAuthenticated, isLoading, router])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (!isAuthenticated) {
    return null
  }

  const handleLogout = () => {
    logout()
    router.push("/auth")
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div className="text-center flex-1">
              <h1 className="text-4xl font-bold mb-4">Welcome to AI Blog Platform, {user?.name}!</h1>
              <p className="text-xl text-muted-foreground">
                Create, manage, and enhance your blog content with AI-powered tools
              </p>
            </div>
            <Button variant="outline" onClick={handleLogout}>
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>

          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <Card>
              <CardHeader>
                <BookOpen className="h-8 w-8 text-primary mb-2" />
                <CardTitle>Blog Management</CardTitle>
                <CardDescription>Create and edit blog posts with our rich text editor</CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full" onClick={() => router.push("/blog")}>
                  Manage Posts
                </Button>
              </CardContent>
            </Card>

            <Card className="border-primary/20">
              <CardHeader>
                <Sparkles className="h-8 w-8 text-primary mb-2" />
                <CardTitle className="text-primary">AI Features</CardTitle>
                <CardDescription>Generate titles, summaries, and SEO keywords with AI</CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full" onClick={() => router.push("/blog")}>
                  Try AI Assistant
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Users className="h-8 w-8 text-primary mb-2" />
                <CardTitle>Community</CardTitle>
                <CardDescription>Engage with readers through comments and discussions</CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full bg-transparent" variant="outline">
                  Coming Soon
                </Button>
              </CardContent>
            </Card>
          </div>

          {user?.role === "ADMIN" && (
            <Card className="border-primary/20">
              <CardHeader>
                <CardTitle className="text-primary">Admin Dashboard</CardTitle>
                <CardDescription>Manage users, posts, and platform settings</CardDescription>
              </CardHeader>
              <CardContent>
                <Button onClick={() => router.push("/admin")}>Open Admin Dashboard</Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
