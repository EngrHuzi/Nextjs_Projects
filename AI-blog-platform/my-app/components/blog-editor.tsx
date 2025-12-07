"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CATEGORIES } from "@/lib/blog"
import { fetchWithAuth } from "@/lib/utils"
import { AIAssistant } from "./ai-assistant"
import { Save, Eye, X } from "lucide-react"

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

interface BlogEditorProps {
  post?: BlogPost
  onSave: (post: BlogPost) => void
  onCancel: () => void
}

export function BlogEditor({ post, onSave, onCancel }: BlogEditorProps) {
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [excerpt, setExcerpt] = useState("")
  const [category, setCategory] = useState("")
  const [tags, setTags] = useState<string[]>([])
  const [tagInput, setTagInput] = useState("")
  const [status, setStatus] = useState<"DRAFT" | "PUBLISHED">("DRAFT")
  const [error, setError] = useState("")
  const [isPreview, setIsPreview] = useState(false)

  // Initialize state when post prop changes
  useEffect(() => {
    if (post) {
      setTitle(post.title || "")
      setContent(post.content || "")
      setExcerpt(post.excerpt || "")
      setCategory(post.category || "")
      setTags(post.tags || [])
      setStatus(post.status || "DRAFT")
    } else {
      // Reset to default values for new post
      setTitle("")
      setContent("")
      setExcerpt("")
      setCategory("")
      setTags([])
      setStatus("DRAFT")
    }
    setError("")
    setIsPreview(false)
  }, [post])

  const handleAddTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()])
      setTagInput("")
    }
  }

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((tag) => tag !== tagToRemove))
  }

  const handleSave = async () => {
    if (!title.trim() || !content.trim() || !category) {
      setError("Please fill in all required fields")
      return
    }

    try {
      setError("")
      const postData = {
        title: title.trim(),
        content: content.trim(),
        excerpt: excerpt.trim() || content.trim().substring(0, 150) + "...",
        category,
        tags,
        status,
      }

      let response: Response
      if (post) {
        // Update existing post
        response = await fetchWithAuth(`/api/posts/${post.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(postData),
        })
      } else {
        // Create new post
        response = await fetchWithAuth("/api/posts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(postData),
        })
      }

      if (!response.ok) {
        const errorData = await response.json()
        setError(errorData.error || "Failed to save post")
        return
      }

      const data = await response.json()
      onSave(data.post)
    } catch (error) {
      console.error("Save error:", error)
      setError("Failed to save post")
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && tagInput.trim()) {
      e.preventDefault()
      handleAddTag()
    }
  }

  const handleTitleSelect = (aiTitle: string) => {
    console.log("Setting title to:", aiTitle);
    setTitle(aiTitle)
  }

  const handleContentUpdate = (aiContent: string) => {
    setContent(aiContent)
  }

  const handleTagsUpdate = (aiTags: string[]) => {
    const newTags = [...tags]
    aiTags.forEach((tag) => {
      if (!newTags.includes(tag)) {
        newTags.push(tag)
      }
    })
    setTags(newTags)
  }

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <h1 className="text-2xl md:text-3xl font-bold">{post ? "Edit Post" : "Create New Post"}</h1>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsPreview(!isPreview)}
            className="flex-1 sm:flex-none"
          >
            <Eye className="h-4 w-4 sm:mr-2" />
            <span className="hidden sm:inline">{isPreview ? "Edit" : "Preview"}</span>
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={onCancel}
            className="flex-1 sm:flex-none"
          >
            <X className="h-4 w-4 sm:mr-2" />
            <span className="hidden sm:inline">Cancel</span>
          </Button>
          <Button onClick={handleSave} size="sm" className="flex-1 sm:flex-none">
            <Save className="h-4 w-4 sm:mr-2" />
            <span className="hidden sm:inline">Save</span>
          </Button>
        </div>
      </div>

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {isPreview ? (
        <Card>
          <CardHeader>
            <CardTitle>{title || "Untitled Post"}</CardTitle>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>{category}</span>
              {tags.length > 0 && (
                <div className="flex gap-1">
                  {tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div className="prose max-w-none">
              {content.split("\n").map((paragraph, index) => (
                <p key={index} className="mb-4">
                  {paragraph}
                </p>
              ))}
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 md:gap-6">
          {/* Main Editor Column */}
          <div className="lg:col-span-3 space-y-4 md:space-y-6">
            {/* Title Input */}
            <div className="space-y-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter post title"
                className="text-base md:text-lg"
              />
            </div>

            {/* AI Assistant - Mobile Only (appears after title, before content) */}
            <div className="lg:hidden">
              <AIAssistant
                title={title}
                content={content}
                category={category}
                onTitleSelect={handleTitleSelect}
                onContentUpdate={handleContentUpdate}
                onTagsUpdate={handleTagsUpdate}
              />
            </div>

            {/* Content Textarea */}
            <div className="space-y-2">
              <Label htmlFor="content">Content *</Label>
              <Textarea
                id="content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Write your post content here..."
                className="min-h-[300px] md:min-h-[400px] resize-none"
              />
            </div>

            {/* Excerpt Textarea */}
            <div className="space-y-2">
              <Label htmlFor="excerpt">Excerpt</Label>
              <Textarea
                id="excerpt"
                value={excerpt}
                onChange={(e) => setExcerpt(e.target.value)}
                placeholder="Brief description of your post (optional - will be auto-generated if empty)"
                className="h-20 resize-none"
              />
            </div>

            {/* Post Settings - Mobile Only */}
            <div className="lg:hidden">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base md:text-lg">Post Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Status</Label>
                    <Select value={status} onValueChange={(value: "DRAFT" | "PUBLISHED") => setStatus(value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="DRAFT">Draft</SelectItem>
                        <SelectItem value="PUBLISHED">Published</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Category *</Label>
                    <Select value={category} onValueChange={setCategory}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {CATEGORIES.map((cat) => (
                          <SelectItem key={cat} value={cat}>
                            {cat}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Tags</Label>
                    <div className="flex gap-2">
                      <Input
                        value={tagInput}
                        onChange={(e) => setTagInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Add tag"
                        className="flex-1"
                      />
                      <Button type="button" onClick={handleAddTag} size="sm">
                        Add
                      </Button>
                    </div>
                    {tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {tags.map((tag) => (
                          <Badge key={tag} variant="secondary" className="text-xs">
                            {tag}
                            <button
                              type="button"
                              onClick={() => handleRemoveTag(tag)}
                              className="ml-1 hover:text-destructive"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Sidebar - Desktop Only */}
          <div className="hidden lg:block space-y-6">
            <AIAssistant
              title={title}
              content={content}
              category={category}
              onTitleSelect={handleTitleSelect}
              onContentUpdate={handleContentUpdate}
              onTagsUpdate={handleTagsUpdate}
            />

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Post Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Status</Label>
                  <Select value={status} onValueChange={(value: "DRAFT" | "PUBLISHED") => setStatus(value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="DRAFT">Draft</SelectItem>
                      <SelectItem value="PUBLISHED">Published</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Category *</Label>
                  <Select value={category} onValueChange={setCategory}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {CATEGORIES.map((cat) => (
                        <SelectItem key={cat} value={cat}>
                          {cat}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Tags</Label>
                  <div className="flex gap-2">
                    <Input
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyDown={handleKeyDown}
                      placeholder="Add tag"
                      className="flex-1"
                    />
                    <Button type="button" onClick={handleAddTag} size="sm">
                      Add
                    </Button>
                  </div>
                  {tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {tags.map((tag) => (
                        <Badge key={tag} variant="secondary" className="text-xs">
                          {tag}
                          <button
                            type="button"
                            onClick={() => handleRemoveTag(tag)}
                            className="ml-1 hover:text-destructive"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  )
}
