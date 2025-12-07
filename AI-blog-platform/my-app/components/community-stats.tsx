"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Users, FileText, TrendingUp, Clock } from "lucide-react"

interface CommunityStats {
  totalPosts: number
  totalAuthors: number
  recentPosts: Array<{
    id: string
    title: string
    author: {
      id: string
      name: string
    }
    createdAt: string
    category: string
  }>
  topAuthors: Array<{
    id: string
    name: string
    postCount: number
  }>
}

export function CommunityStats() {
  const [stats, setStats] = useState<CommunityStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch("/api/community/stats")
        if (res.ok) {
          const data = await res.json()
          setStats(data)
        }
      } catch (error) {
        console.error("Failed to fetch community stats:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [])

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
              <div className="h-8 bg-muted rounded w-1/2"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (!stats) return null

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    })
  }

  return (
    <div className="space-y-4 md:space-y-6 mb-6 md:mb-8">
      {/* Main Stats */}
      <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        <Card>
          <CardContent className="p-4 md:p-6">
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 md:h-5 md:w-5 text-blue-500 flex-shrink-0" />
              <div className="min-w-0">
                <p className="text-xs md:text-sm text-muted-foreground truncate">Total Posts</p>
                <p className="text-xl md:text-2xl font-bold">{stats.totalPosts}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 md:p-6">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 md:h-5 md:w-5 text-green-500 flex-shrink-0" />
              <div className="min-w-0">
                <p className="text-xs md:text-sm text-muted-foreground truncate">Active Authors</p>
                <p className="text-xl md:text-2xl font-bold">{stats.totalAuthors}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 md:p-6">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 md:h-5 md:w-5 text-purple-500 flex-shrink-0" />
              <div className="min-w-0">
                <p className="text-xs md:text-sm text-muted-foreground truncate">Avg Posts/Author</p>
                <p className="text-xl md:text-2xl font-bold">
                  {stats.totalAuthors > 0 ? Math.round(stats.totalPosts / stats.totalAuthors) : 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 md:p-6">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 md:h-5 md:w-5 text-orange-500 flex-shrink-0" />
              <div className="min-w-0">
                <p className="text-xs md:text-sm text-muted-foreground truncate">Recent Activity</p>
                <p className="text-xl md:text-2xl font-bold">{stats.recentPosts.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity & Top Authors */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
        {/* Recent Posts */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base md:text-lg">
              <Clock className="h-4 w-4 md:h-5 md:w-5" />
              Recent Posts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 md:space-y-3">
              {stats.recentPosts.slice(0, 5).map((post) => (
                <div key={post.id} className="flex items-start gap-2 md:gap-3 p-2 rounded-lg hover:bg-muted/50">
                  <Avatar className="h-7 w-7 md:h-8 md:w-8 flex-shrink-0">
                    <AvatarFallback className="text-xs">
                      {post.author.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")
                        .toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs md:text-sm font-medium truncate" title={post.title}>{post.title}</p>
                    <div className="flex flex-wrap items-center gap-1 md:gap-2 text-xs text-muted-foreground">
                      <span className="truncate max-w-[100px] sm:max-w-[150px] md:max-w-[200px]" title={post.author.name}>by {post.author.name}</span>
                      <span className="hidden sm:inline">•</span>
                      <span className="hidden sm:inline whitespace-nowrap">{formatDate(post.createdAt)}</span>
                    </div>
                    <Badge variant="outline" className="text-xs mt-1">
                      {post.category}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Top Authors */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base md:text-lg">
              <Users className="h-4 w-4 md:h-5 md:w-5" />
              Most Active Authors
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 md:space-y-3">
              {stats.topAuthors.slice(0, 5).map((author, index) => (
                <div key={author.id} className="flex items-center gap-2 md:gap-3 p-2 rounded-lg hover:bg-muted/50">
                  <div className="flex items-center justify-center w-5 h-5 md:w-6 md:h-6 rounded-full bg-primary text-primary-foreground text-xs font-bold flex-shrink-0">
                    {index + 1}
                  </div>
                  <Avatar className="h-7 w-7 md:h-8 md:w-8 flex-shrink-0">
                    <AvatarFallback className="text-xs">
                      {author.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")
                        .toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs md:text-sm font-medium truncate" title={author.name}>{author.name}</p>
                    <p className="text-xs text-muted-foreground whitespace-nowrap">{author.postCount} post{author.postCount !== 1 ? 's' : ''}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}




