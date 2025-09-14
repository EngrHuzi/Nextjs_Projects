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
    <div className="bg-gradient-to-br from-background to-muted">
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
                  Platform Stats
                </CardTitle>
                <CardDescription>Community overview</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Total Published Posts</span>
                  <span className="font-semibold">{totalPosts}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Active Authors</span>
                  <span className="font-semibold text-blue-600">{uniqueAuthors}</span>
                </div>
                {mostActiveAuthor && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Most Active</span>
                    <span className="font-semibold text-purple-600">{mostActiveAuthor[0]} ({mostActiveAuthor[1]} posts)</span>
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Your Posts</span>
                  <span className="font-semibold text-green-600">
                    {posts.filter(p => p.author.id === user?.id).length}
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-blue-600" />
                  Recent Posts
                </CardTitle>
                <CardDescription>Latest from the community</CardDescription>
              </CardHeader>
              <CardContent>
                {recent.length === 0 ? (
                  <div className="text-center py-4 text-muted-foreground">
                    <Star className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p>No posts yet</p>
                    <p className="text-sm">Be the first to publish a blog post!</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {recent.map((p) => (
                      <div key={p.id} className="flex items-start justify-between">
                        <div className="min-w-0 flex-1">
                          <div className="font-medium truncate max-w-[200px]">{p.title}</div>
                          <div className="text-xs text-muted-foreground">
                            by {p.author.name} • {new Date(p.publishedAt || p.createdAt).toLocaleDateString()}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {p.category} • {p.readTime} min read
                          </div>
                        </div>
                        <span className="text-xs px-2 py-0.5 rounded bg-emerald-100 text-emerald-700 ml-2">
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
