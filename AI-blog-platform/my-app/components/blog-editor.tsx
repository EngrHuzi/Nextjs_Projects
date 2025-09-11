"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { createPost, updatePost, type BlogPost, CATEGORIES } from "@/lib/blog"
import { AIAssistant } from "./ai-assistant"
import { Save, Eye, X } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"

interface BlogEditorProps {
  post?: BlogPost
  onSave: (post: BlogPost) => void
  onCancel: () => void
}

export function BlogEditor({ post, onSave, onCancel }: BlogEditorProps) {
  const { user } = useAuth()
  const [title, setTitle] = useState(post?.title || "")
  const [content, setContent] = useState(post?.content || "")
  const [excerpt, setExcerpt] = useState(post?.excerpt || "")
  const [category, setCategory] = useState(post?.category || "")
  const [tags, setTags] = useState<string[]>(post?.tags || [])
  const [tagInput, setTagInput] = useState("")
  const [status, setStatus] = useState<"draft" | "published">(post?.status || "draft")
  const [error, setError] = useState("")
  const [isPreview, setIsPreview] = useState(false)

  const handleAddTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()])
      setTagInput("")
    }
  }

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((tag) => tag !== tagToRemove))
  }

  const handleSave = () => {
    if (!title.trim() || !content.trim() || !category) {
      setError("Please fill in all required fields")
      return
    }

    // Remove authentication check

    try {
      let savedPost: BlogPost

      if (post) {
        // Update existing post
        const updated = updatePost(post.id, {
          title: title.trim(),
          content: content.trim(),
          excerpt: excerpt.trim() || content.trim().substring(0, 150) + "...",
          category,
          tags,
          status,
        })
        if (!updated) {
          setError("Failed to update post")
          return
        }
        savedPost = updated
      } else {
        // Create new post
        savedPost = createPost({
          title: title.trim(),
          content: content.trim(),
          excerpt: excerpt.trim() || content.trim().substring(0, 150) + "...",
          author: {
            id: user?.id || "anonymous",
            name: user?.name || "Anonymous",
            email: user?.email || "anonymous@example.com",
          },
          category,
          tags,
          status,
        })
      }

      onSave(savedPost)
    } catch {
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
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">{post ? "Edit Post" : "Create New Post"}</h1>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => setIsPreview(!isPreview)}>
            <Eye className="h-4 w-4 mr-2" />
            {isPreview ? "Edit" : "Preview"}
          </Button>
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button onClick={handleSave}>
            <Save className="h-4 w-4 mr-2" />
            Save {status === "published" ? "& Publish" : "Draft"}
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
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-3 space-y-6">
            <div className="space-y-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter post title"
                className="text-lg"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="content">Content *</Label>
              <Textarea
                id="content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Write your post content here..."
                className="min-h-[400px] resize-none"
              />
            </div>

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
          </div>

          <div className="space-y-6">
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
                  <Select value={status} onValueChange={(value: "draft" | "published") => setStatus(value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="published">Published</SelectItem>
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
