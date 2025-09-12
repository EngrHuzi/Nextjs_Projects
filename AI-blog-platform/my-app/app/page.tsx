"use client"

import { useAuth } from "@/contexts/auth-context"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, BookOpen, Sparkles, Users, LogOut, Clock, TrendingUp, Star } from "lucide-react"
import { HeroSection } from "@/components/landing/hero-section"
import { Header } from "@/components/layout/header"

export default function HomePage() {
  const { isAuthenticated, isLoading, user, logout } = useAuth()
  const router = useRouter()

  // Remove automatic redirect to auth page
  // Users can now see the landing page first

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (!isAuthenticated) {
    return <HeroSection />
  }

  const handleLogout = () => {
    logout()
    router.push("/")
  }

  return (
    <div className="bg-gradient-to-br from-background to-muted">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div className="text-center flex-1">
              <h1 className="text-4xl font-bold mb-4">
                Welcome back, {user?.name}! 👋
              </h1>
              <p className="text-xl text-muted-foreground mb-2">
                Ready to create amazing content with AI assistance?
              </p>
              <p className="text-lg text-muted-foreground">
                Your AI-powered blogging journey starts here
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

          <div className="grid md:grid-cols-2 gap-6 mt-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-green-600" />
                  Quick Stats
                </CardTitle>
                <CardDescription>Your platform overview</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Total Posts</span>
                  <span className="font-semibold">0</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Published</span>
                  <span className="font-semibold text-green-600">0</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Drafts</span>
                  <span className="font-semibold text-orange-600">0</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-blue-600" />
                  Recent Activity
                </CardTitle>
                <CardDescription>Your latest actions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-4 text-muted-foreground">
                  <Star className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>No recent activity</p>
                  <p className="text-sm">Start by creating your first blog post!</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
