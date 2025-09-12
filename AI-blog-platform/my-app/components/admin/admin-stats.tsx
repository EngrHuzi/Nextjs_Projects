"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Users, FileText, Eye, Edit, RefreshCw, TrendingUp } from "lucide-react"

interface AdminStatsProps {
  stats: {
    totalUsers: number
    totalPosts: number
    publishedPosts: number
    draftPosts: number
  }
  onRefresh: () => void
}

export function AdminStats({ stats, onRefresh }: AdminStatsProps) {
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
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>
              Common administrative tasks
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button 
              variant="outline" 
              className="w-full justify-start"
              onClick={() => window.location.href = "/blog"}
            >
              <FileText className="h-4 w-4 mr-2" />
              View All Posts
            </Button>
            <Button 
              variant="outline" 
              className="w-full justify-start"
              onClick={() => window.location.href = "/blog?mode=create"}
            >
              <Edit className="h-4 w-4 mr-2" />
              Create New Post
            </Button>
            <Button 
              variant="outline" 
              className="w-full justify-start"
              onClick={onRefresh}
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh Data
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
