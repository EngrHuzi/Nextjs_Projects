"use client"

import { useAuth } from "@/contexts/auth-context"
import { useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, BookOpen, Sparkles, Users, LogOut, Clock, TrendingUp, Star } from "lucide-react"
import { HeroSection } from "@/components/landing/hero-section"

// Define the BlogPost type that matches the API response
interface BlogPost {
  id: string
  title: string
  content: string
  excerpt: string
  author: {
    id: string
    name: string
    email: string
  }
  category: string
  tags: string[]
  status: "DRAFT" | "PUBLISHED"
  createdAt: string
  updatedAt: string
  publishedAt?: string
  readTime: number
  slug: string
}

export default function HomePage() {
  const { isAuthenticated, isLoading, user, logout } = useAuth()
  const router = useRouter()
  const [posts, setPosts] = useState<BlogPost[]>([])

  // Load all published posts for quick stats and recent activity
  const loadPosts = async () => {
    try {
      const res = await fetch("/api/posts/published");
      if (res.ok) {
        const data = await res.json();
        setPosts(data.posts || []);
      } else {
        setPosts([]);
      }
    } catch {
      setPosts([]);
    }
  };

  useEffect(() => {
    loadPosts();
  }, []);

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
  

  // Calculate stats from all published posts
  const totalPosts = posts.length
  
  // Get recent posts (all published posts are already sorted by publishedAt desc)
  const recent = posts.slice(0, 5)
  
  // Get unique authors count
  const uniqueAuthors = new Set(posts.map(p => p.author.id)).size
  
  // Get most active author
  const authorPostCounts = posts.reduce((acc, post) => {
    acc[post.author.name] = (acc[post.author.name] || 0) + 1
    return acc
  }, {} as Record<string, number>)
  const mostActiveAuthor = Object.entries(authorPostCounts).sort(([,a], [,b]) => b - a)[0]

  const handleLogout = () => {
    logout()
    router.push("/")
  }

  return (
    <div className="bg-gradient-to-br from-background to-muted min-h-screen">
      <div className="container mx-auto px-4 py-6 md:py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header with welcome and logout */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 md:mb-8">
            <div className="flex-1">
              <h1 className="text-2xl md:text-4xl font-bold mb-2 md:mb-4">
                Welcome back, {user?.name}! 👋
              </h1>
              <p className="text-base md:text-xl text-muted-foreground mb-1 md:mb-2">
                Ready to create amazing content with AI assistance?
              </p>
              <p className="text-sm md:text-lg text-muted-foreground">
                Your AI-powered blogging journey starts here
              </p>
            </div>
            <Button variant="outline" size="sm" onClick={handleLogout} className="self-start sm:self-auto">
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>

          {/* Main action cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 mb-6 md:mb-8">
            <Card>
              <CardHeader className="pb-3">
                <BookOpen className="h-6 w-6 md:h-8 md:w-8 text-primary mb-2" />
                <CardTitle className="text-lg md:text-xl">Blog Management</CardTitle>
                <CardDescription className="text-sm">Create and edit blog posts with our rich text editor</CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full" size="sm" onClick={() => router.push("/blog")}>
                  Manage Posts
                </Button>
              </CardContent>
            </Card>

            <Card className="border-primary/20">
              <CardHeader className="pb-3">
                <Sparkles className="h-6 w-6 md:h-8 md:w-8 text-primary mb-2" />
                <CardTitle className="text-primary text-lg md:text-xl">AI Features</CardTitle>
                <CardDescription className="text-sm">Generate titles, summaries, and SEO keywords with AI</CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full" size="sm" onClick={() => router.push("/blog")}>
                  Try AI Assistant
                </Button>
              </CardContent>
            </Card>

            <Card className="sm:col-span-2 lg:col-span-1">
              <CardHeader className="pb-3">
                <Users className="h-6 w-6 md:h-8 md:w-8 text-primary mb-2" />
                <CardTitle className="text-lg md:text-xl">Community</CardTitle>
                <CardDescription className="text-sm">Engage with readers through comments and discussions</CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full bg-transparent" size="sm" variant="outline">
                  Coming Soon
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Admin dashboard card */}
          {user?.role === "ADMIN" && (
            <Card className="border-primary/20 mb-6 md:mb-8">
              <CardHeader className="pb-3">
                <CardTitle className="text-primary text-lg md:text-xl">Admin Dashboard</CardTitle>
                <CardDescription className="text-sm">Manage users, posts, and platform settings</CardDescription>
              </CardHeader>
              <CardContent>
                <Button size="sm" onClick={() => router.push("/admin")}>Open Admin Dashboard</Button>
              </CardContent>
            </Card>
          )}

          {/* Stats and recent posts */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg md:text-xl">
                  <TrendingUp className="h-4 w-4 md:h-5 md:w-5 text-green-600" />
                  Platform Stats
                </CardTitle>
                <CardDescription className="text-sm">Community overview</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2 md:space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs md:text-sm text-muted-foreground">Total Published Posts</span>
                  <span className="font-semibold text-sm md:text-base">{totalPosts}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs md:text-sm text-muted-foreground">Active Authors</span>
                  <span className="font-semibold text-blue-600 text-sm md:text-base">{uniqueAuthors}</span>
                </div>
                {mostActiveAuthor && (
                  <div className="flex items-center justify-between">
                    <span className="text-xs md:text-sm text-muted-foreground">Most Active</span>
                    <span className="font-semibold text-purple-600 text-xs md:text-sm truncate max-w-[150px]">{mostActiveAuthor[0]} ({mostActiveAuthor[1]})</span>
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <span className="text-xs md:text-sm text-muted-foreground">Your Posts</span>
                  <span className="font-semibold text-green-600 text-sm md:text-base">
                    {posts.filter(p => p.author.id === user?.id).length}
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg md:text-xl">
                  <Clock className="h-4 w-4 md:h-5 md:w-5 text-blue-600" />
                  Recent Posts
                </CardTitle>
                <CardDescription className="text-sm">Latest from the community</CardDescription>
              </CardHeader>
              <CardContent>
                {recent.length === 0 ? (
                  <div className="text-center py-4 text-muted-foreground">
                    <Star className="h-6 w-6 md:h-8 md:w-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm md:text-base">No posts yet</p>
                    <p className="text-xs md:text-sm">Be the first to publish a blog post!</p>
                  </div>
                ) : (
                  <div className="space-y-2 md:space-y-3">
                    {recent.map((p) => (
                      <div key={p.id} className="flex items-start justify-between gap-2">
                        <div className="min-w-0 flex-1">
                          <div className="font-medium text-sm md:text-base truncate">{p.title}</div>
                          <div className="text-xs text-muted-foreground truncate">
                            by {p.author.name} • {new Date(p.publishedAt || p.createdAt).toLocaleDateString()}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {p.category} • {p.readTime} min
                          </div>
                        </div>
                        <span className="text-xs px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-300 whitespace-nowrap flex-shrink-0">
                          Published
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
