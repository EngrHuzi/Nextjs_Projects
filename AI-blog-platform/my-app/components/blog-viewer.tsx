"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
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
import { CommentSection } from "@/components/comment-section"
import { ArrowLeft, Edit, Clock, Calendar, User } from "lucide-react"

interface BlogViewerProps {
  post: BlogPost
  onBack: () => void
  onEdit: (post: BlogPost) => void
}

export function BlogViewer({ post, onBack, onEdit }: BlogViewerProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  const canEdit = true // Allow everyone to edit for now

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <Button variant="ghost" onClick={onBack}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Posts
        </Button>
        {canEdit && (
          <Button onClick={() => onEdit(post)}>
            <Edit className="h-4 w-4 mr-2" />
            Edit Post
          </Button>
        )}
      </div>

      <div className="space-y-8">
        <Card>
          <CardHeader className="space-y-4">
            <div className="flex items-center gap-2">
              <Badge variant={post.status === "PUBLISHED" ? "default" : "secondary"}>{post.status}</Badge>
              <Badge variant="outline">{post.category}</Badge>
            </div>

            <h1 className="text-4xl font-bold leading-tight">{post.title}</h1>

            <div className="flex items-center gap-6 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <User className="h-4 w-4" />
                <span>By {post.author.name}</span>
              </div>
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                <span>{formatDate(post.publishedAt || post.createdAt)}</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                <span>{post.readTime} min read</span>
              </div>
            </div>

            {post.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {post.tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
            )}
          </CardHeader>

          <CardContent>
            <div className="prose max-w-none">
              {post.content.split("\n").map((paragraph, index) => {
                if (paragraph.trim() === "") {
                  return <br key={index} />
                }

                // Simple markdown-like formatting
                if (paragraph.startsWith("# ")) {
                  return (
                    <h1 key={index} className="text-3xl font-bold mt-8 mb-4">
                      {paragraph.substring(2)}
                    </h1>
                  )
                }

                if (paragraph.startsWith("## ")) {
                  return (
                    <h2 key={index} className="text-2xl font-semibold mt-6 mb-3">
                      {paragraph.substring(3)}
                    </h2>
                  )
                }

                if (paragraph.startsWith("### ")) {
                  return (
                    <h3 key={index} className="text-xl font-medium mt-4 mb-2">
                      {paragraph.substring(4)}
                    </h3>
                  )
                }

                return (
                  <p key={index} className="mb-4 leading-relaxed">
                    {paragraph}
                  </p>
                )
              })}
            </div>
          </CardContent>
        </Card>

        <Separator />

        <CommentSection postId={post.id} />
      </div>
    </div>
  )
}
