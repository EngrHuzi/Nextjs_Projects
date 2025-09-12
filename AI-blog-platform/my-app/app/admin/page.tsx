"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/auth-context"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Users, FileText, Settings, BarChart3, Eye, Edit, Trash2, Plus } from "lucide-react"
import { AdminUsersTable } from "@/components/admin/admin-users-table"
import { AdminPostsTable } from "@/components/admin/admin-posts-table"
import { AdminSettings } from "@/components/admin/admin-settings"
import { AdminStats } from "@/components/admin/admin-stats"
import type { BlogPost } from "@/lib/blog"
import type { StoredUser } from "@/lib/user-store"

export default function AdminDashboard() {
  const { user, isAuthenticated, isLoading } = useAuth()
  const [activeTab, setActiveTab] = useState("overview")
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalPosts: 0,
    publishedPosts: 0,
    draftPosts: 0,
  })

  useEffect(() => {
    if (isAuthenticated && user?.role === "ADMIN") {
      loadStats()
    }
  }, [isAuthenticated, user])

  const loadStats = async () => {
    try {
      // Get auth token from localStorage
      const token = localStorage.getItem("auth_token")
      if (!token) return

      // Load user stats
      const usersResponse = await fetch("/api/admin/users", {
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      })
      const usersData = await usersResponse.json()
      
      // Load post stats
      const postsResponse = await fetch("/api/admin/posts", {
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      })
      const postsData = await postsResponse.json()
      
      setStats({
        totalUsers: usersData.users?.length || 0,
        totalPosts: postsData.posts?.length || 0,
        publishedPosts: postsData.posts?.filter((p: BlogPost) => p.status === "published").length || 0,
        draftPosts: postsData.posts?.filter((p: BlogPost) => p.status === "draft").length || 0,
      })
    } catch (error) {
      console.error("Failed to load admin stats:", error)
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
            <AdminStats stats={stats} onRefresh={loadStats} />
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
