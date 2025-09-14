"use client"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { CATEGORIES } from "@/lib/blog"
import { useAuth } from "@/contexts/auth-context"
import { CommunityStats } from "./community-stats"

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
import { Plus, Search, Edit, Trash2, Eye, Clock, Calendar } from "lucide-react"

interface BlogListProps {
  onCreatePost: () => void
  onEditPost: (post: BlogPost) => void
  onViewPost: (post: BlogPost) => void
  onMyPosts: () => void
}

export function BlogList({ onCreatePost, onEditPost, onViewPost, onMyPosts }: BlogListProps) {
  const { user } = useAuth()
  const [posts, setPosts] = useState<BlogPost[]>([])
  const [filteredPosts, setFilteredPosts] = useState<BlogPost[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [counts, setCounts] = useState({ published: 0, draft: 0, total: 0 })

  const loadPosts = useCallback(async () => {
    try {
      const params = new URLSearchParams()
      if (categoryFilter !== "all") params.append("category", categoryFilter)
      if (searchTerm) params.append("search", searchTerm)

      // Always fetch published posts from all users for community view
      const res = await fetch(`/api/posts/published?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setPosts(data.posts || []);
        // For community view, we only show published posts
        setCounts({ published: data.posts?.length || 0, draft: 0, total: data.posts?.length || 0 });
      } else {
        setPosts([]);
        setCounts({ published: 0, draft: 0, total: 0 });
      }
    } catch {
      setPosts([]);
      setCounts({ published: 0, draft: 0, total: 0 });
    }
  }, [categoryFilter, searchTerm]);

  useEffect(() => {
    loadPosts();
  }, [loadPosts]);

  // Since filtering is now done on the server side, we just set filteredPosts to posts
  useEffect(() => {
    setFilteredPosts(posts)
  }, [posts])

  

  const handleDelete = async (post: BlogPost) => {
    try {
      await fetch(`/api/posts/${post.id}`, { method: "DELETE" });
      await loadPosts(); // refetch from API after delete
    } catch {
      // Optionally, set an error state or show a toast
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <CommunityStats />
      
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Community Blog</h1>
          <p className="text-muted-foreground">Discover and share amazing content from our community</p>
          <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
            <span>{counts.total} published posts</span>
            <span>•</span>
            <span>From {new Set(posts.map(p => p.author.id)).size} authors</span>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={onMyPosts}>
            My Posts
          </Button>
          <Button onClick={onCreatePost}>
            <Plus className="h-4 w-4 mr-2" />
            Write Post
          </Button>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search posts, authors, tags..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="All Categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {CATEGORIES.map((category) => (
              <SelectItem key={category} value={category}>
                {category}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {filteredPosts.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="text-center">
              <h3 className="text-lg font-semibold mb-2">No posts found</h3>
              <p className="text-muted-foreground mb-4">
                {posts.length === 0
                  ? "Get started by creating your first blog post."
                  : "Try adjusting your search or filters."}
              </p>
              {posts.length === 0 && (
                <Button onClick={onCreatePost}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Your First Post
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6">
          {filteredPosts.map((post) => (
            <Card key={post.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant={post.status === "PUBLISHED" ? "default" : "secondary"}>
                        {post.status === "PUBLISHED" ? "Published" : "Draft"}
                      </Badge>
                      <Badge variant="outline">{post.category}</Badge>
                    </div>
                    <CardTitle className="text-xl mb-2">{post.title}</CardTitle>
                    <CardDescription className="text-sm">{post.excerpt}</CardDescription>
                  </div>
                  <div className="flex items-center gap-2 ml-4">
                    <Button variant="ghost" size="sm" onClick={() => onViewPost(post)}>
                      <Eye className="h-4 w-4" />
                    </Button>
                    {user?.id === post.author.id && (
                      <>
                        <Button variant="ghost" size="sm" onClick={() => onEditPost(post)} title="Edit your post">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="sm" title="Delete your post">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Post</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete &quot;{post.title}&quot;? This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDelete(post)}>Delete</AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <div className="flex items-center gap-4">
                    <span>By {post.author.name}</span>
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      <span>{post.readTime} min read</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      <span>
                        {post.status === "PUBLISHED" && post.publishedAt
                          ? formatDate(post.publishedAt)
                          : formatDate(post.createdAt)}
                      </span>
                    </div>
                  </div>
                  {post.tags.length > 0 && (
                    <div className="flex gap-1">
                      {post.tags.slice(0, 3).map((tag) => (
                        <Badge key={tag} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                      {post.tags.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{post.tags.length - 3}
                        </Badge>
                      )}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
