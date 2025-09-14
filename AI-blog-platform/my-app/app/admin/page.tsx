"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/auth-context"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Users, FileText, Settings, BarChart3 } from "lucide-react"
import { AdminUsersTable } from "@/components/admin/admin-users-table"
import { AdminPostsTable } from "@/components/admin/admin-posts-table"
import { AdminSettings } from "@/components/admin/admin-settings"
import { AdminStats } from "@/components/admin/admin-stats"
import { fetchWithAuth } from "@/lib/utils"
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

export default function AdminDashboard() {
  const { user, isAuthenticated, isLoading } = useAuth()
  const [activeTab, setActiveTab] = useState("overview")
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalPosts: 0,
    publishedPosts: 0,
    draftPosts: 0,
  })
  const [posts, setPosts] = useState<BlogPost[]>([])

  useEffect(() => {
    if (isAuthenticated && user?.role === "ADMIN") {
      loadStats()
    }

    // Auto-refresh when tab becomes visible
    const handleVisibility = () => {
      if (document.visibilityState === "visible") {
        loadStats()
      }
    }
    document.addEventListener("visibilitychange", handleVisibility)

    // Auto-refresh when localStorage posts change (from other tabs)
    const handleStorage = (e: StorageEvent) => {
      if (e.key === "blog_posts") {
        loadStats()
      }
    }
    window.addEventListener("storage", handleStorage)

    return () => {
      document.removeEventListener("visibilitychange", handleVisibility)
      window.removeEventListener("storage", handleStorage)
    }
  }, [isAuthenticated, user])

  const loadStats = async () => {
    try {
      // Load user stats
      const usersResponse = await fetchWithAuth("/api/admin/users")
      if (!usersResponse.ok) {
        throw new Error(`Users API failed: ${usersResponse.status}`)
      }
      const usersData = await usersResponse.json()
      
      // Load posts from API
      const postsResponse = await fetchWithAuth("/api/admin/posts")
      if (!postsResponse.ok) {
        throw new Error(`Posts API failed: ${postsResponse.status}`)
      }
      const postsData = await postsResponse.json()
      const apiPosts: BlogPost[] = postsData.posts || []
      
      const newStats = {
        totalUsers: usersData.users?.length || 0,
        totalPosts: apiPosts.length,
        publishedPosts: apiPosts.filter((p: BlogPost) => p.status === "PUBLISHED").length,
        draftPosts: apiPosts.filter((p: BlogPost) => p.status === "DRAFT").length,
      }
      
      setStats(newStats)
      setPosts(apiPosts)
    } catch (error) {
      console.error("Failed to load admin stats:", error)
      // Set error state or show user-friendly message
      setStats({
        totalUsers: 0,
        totalPosts: 0,
        publishedPosts: 0,
        draftPosts: 0,
      })
      setPosts([])
    }
  }

  if (isLoading) {
    return (
      <div className="bg-gradient-to-br from-background to-muted flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading admin dashboard...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated || user?.role !== "ADMIN") {
    return (
      <div className="bg-gradient-to-br from-background to-muted flex items-center justify-center py-12">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold text-destructive">Access Denied</CardTitle>
            <CardDescription>
              You need admin privileges to access this dashboard.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Button onClick={() => window.location.href = "/auth"}>
              Go to Login
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="bg-gradient-to-br from-background to-muted">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">Admin Dashboard</h1>
          <p className="text-muted-foreground">
            Manage users, posts, and platform settings
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="users" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Users
            </TabsTrigger>
            <TabsTrigger value="posts" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Posts
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Settings
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <AdminStats stats={stats} recentPosts={posts} onRefresh={loadStats} />
          </TabsContent>

          <TabsContent value="users" className="space-y-6">
            <AdminUsersTable onUserUpdate={loadStats} />
          </TabsContent>

          <TabsContent value="posts" className="space-y-6">
            <AdminPostsTable onPostUpdate={loadStats} />
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <AdminSettings />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
