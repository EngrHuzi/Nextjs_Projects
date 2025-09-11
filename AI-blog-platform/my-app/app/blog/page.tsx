"use client"

import { useState } from "react"
import { BlogList } from "@/components/blog-list"
import { BlogEditor } from "@/components/blog-editor"
import { BlogViewer } from "@/components/blog-viewer"
import type { BlogPost } from "@/lib/blog"

type ViewMode = "list" | "create" | "edit" | "view"

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted">
      {viewMode === "list" && (
        <BlogList onCreatePost={handleCreatePost} onEditPost={handleEditPost} onViewPost={handleViewPost} />
      )}

      {(viewMode === "create" || viewMode === "edit") && (
        <BlogEditor post={selectedPost || undefined} onSave={handleSavePost} onCancel={handleCancel} />
      )}

      {viewMode === "view" && selectedPost && (
        <BlogViewer post={selectedPost} onBack={handleCancel} onEdit={handleEditPost} />
      )}
    </div>
  )
}
