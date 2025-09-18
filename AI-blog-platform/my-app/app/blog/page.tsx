"use client"

import { useState } from "react"
import { BlogList } from "@/components/blog-list"
import { BlogEditor } from "@/components/blog-editor"
import { BlogViewer } from "@/components/blog-viewer"
import { MyPosts } from "@/components/my-posts"

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

type ViewMode = "list" | "create" | "edit" | "view" | "my-posts"

export default function BlogPage() {
  const [viewMode, setViewMode] = useState<ViewMode>("list")
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null)

  const handleCreatePost = () => {
    setSelectedPost(null)
    setViewMode("create")
  }

  const handleEditPost = (post: BlogPost) => {
    setSelectedPost(post)
    setViewMode("edit")
  }

  const handleViewPost = (post: BlogPost) => {
    setSelectedPost(post)
    setViewMode("view")
  }

  const handleSavePost = () => {
    setViewMode("list")
    setSelectedPost(null)
  }

  const handleCancel = () => {
    setViewMode("list")
    setSelectedPost(null)
  }

  const handleMyPosts = () => {
    setViewMode("my-posts")
    setSelectedPost(null)
  }

  return (
    <div className="bg-gradient-to-br from-background to-muted">
      {viewMode === "list" && (
        <BlogList onCreatePost={handleCreatePost} onEditPost={handleEditPost} onViewPost={handleViewPost} onMyPosts={handleMyPosts} />
      )}

      {viewMode === "my-posts" && (
        <MyPosts 
          onCreatePost={handleCreatePost} 
          onEditPost={handleEditPost} 
          onViewPost={handleViewPost}
          onBackToCommunity={() => setViewMode("list")}
        />
      )}

      {(viewMode === "create" || viewMode === "edit") && (
        <BlogEditor 
          key={selectedPost?.id || "new"} 
          post={selectedPost || undefined} 
          onSave={handleSavePost} 
          onCancel={handleCancel} 
        />
      )}

      {viewMode === "view" && selectedPost && (
        <BlogViewer post={selectedPost} onBack={handleCancel} onEdit={handleEditPost} />
      )}
    </div>
  )
}
