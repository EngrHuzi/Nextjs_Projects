"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Users, FileText, Eye, Edit, RefreshCw, TrendingUp, CalendarClock } from "lucide-react"
import type { BlogPost } from "@/lib/blog"

interface AdminStatsProps {
  stats: {
    totalUsers: number
    totalPosts: number
    publishedPosts: number
    draftPosts: number
  }
  recentPosts?: BlogPost[]
  onRefresh: () => void
}

export function AdminStats({ stats, recentPosts = [], onRefresh }: AdminStatsProps) {
  const { totalUsers, totalPosts, publishedPosts, draftPosts } = stats

  const statCards = [
    {
      title: "Total Users",
      value: totalUsers,
      icon: Users,
      description: "Registered users",
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      title: "Total Posts",
      value: totalPosts,
      icon: FileText,
      description: "All blog posts",
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
    {
      title: "Published Posts",
      value: publishedPosts,
      icon: Eye,
      description: "Live content",
      color: "text-emerald-600",
      bgColor: "bg-emerald-50",
    },
    {
      title: "Draft Posts",
      value: draftPosts,
      icon: Edit,
      description: "Work in progress",
      color: "text-orange-600",
      bgColor: "bg-orange-50",
    },
  ]

  const publishRate = totalPosts > 0 ? Math.round((publishedPosts / totalPosts) * 100) : 0

  const recent = [...recentPosts]
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, 5)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Platform Overview</h2>
          <p className="text-muted-foreground">
            Key metrics and statistics for your blog platform
          </p>
        </div>
        <Button onClick={onRefresh} variant="outline" className="flex items-center gap-2">
          <RefreshCw className="h-4 w-4" />
          Refresh
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat) => {
          const Icon = stat.icon
          return (
            <Card key={stat.title} className="relative overflow-hidden">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </CardTitle>
                <div className={`p-2 rounded-full ${stat.bgColor}`}>
                  <Icon className={`h-4 w-4 ${stat.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground">{stat.value}</div>
                <p className="text-xs text-muted-foreground">{stat.description}</p>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Content Performance
            </CardTitle>
            <CardDescription>
              Publishing and content statistics
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Publish Rate</span>
              <Badge variant="secondary" className="text-sm">
                {publishRate}%
              </Badge>
            </div>
            <div className="w-full bg-muted rounded-full h-2">
              <div
                className="bg-primary h-2 rounded-full transition-all duration-300"
                style={{ width: `${publishRate}%` }}
              />
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">
                {publishedPosts} of {totalPosts} posts published
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CalendarClock className="h-5 w-5" />
              Recent Activity
            </CardTitle>
            <CardDescription>
              Latest changes to posts
            </CardDescription>
          </CardHeader>
          <CardContent>
            {recent.length === 0 ? (
              <div className="text-center py-6 text-muted-foreground text-sm">
                No recent activity
              </div>
            ) : (
              <div className="space-y-4">
                {recent.map((post) => (
                  <div key={post.id} className="flex items-start justify-between">
                    <div className="min-w-0">
                      <div className="font-medium truncate max-w-[220px]">{post.title}</div>
                      <div className="text-xs text-muted-foreground">
                        {post.status === "PUBLISHED" ? "Published" : "Updated"} • {new Date(post.updatedAt).toLocaleString()}
                      </div>
                    </div>
                    <Badge variant={post.status === "PUBLISHED" ? "default" : "secondary"}>
                      {post.status}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
            <div className="mt-4 flex gap-2">
              <Button 
                variant="outline" 
                className="flex-1"
                onClick={() => window.location.href = "/blog"}
              >
                <FileText className="h-4 w-4 mr-2" />
                View Posts
              </Button>
              <Button 
                variant="outline" 
                className="flex-1"
                onClick={() => window.location.href = "/blog?mode=create"}
              >
                <Edit className="h-4 w-4 mr-2" />
                New Post
              </Button>
              <Button 
                variant="outline" 
                onClick={onRefresh}
                className="shrink-0"
              >
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
