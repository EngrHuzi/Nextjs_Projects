"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { createComment, type Comment } from "@/lib/comments"
import { useAuth } from "@/contexts/auth-context"
import { Send, X } from "lucide-react"

interface CommentFormProps {
  postId: string
  parentId?: string
  onCommentAdded: (comment: Comment) => void
  onCancel?: () => void
  placeholder?: string
}

export function CommentForm({ postId, parentId, onCommentAdded, onCancel, placeholder }: CommentFormProps) {
  const { user } = useAuth()
  const [content, setContent] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!content.trim()) {
      setError("Please enter a comment")
      return
    }

    setIsSubmitting(true)
    setError("")

    try {
      const newComment = createComment({
        postId,
        parentId,
        author: {
          id: user?.id || "anonymous",
          name: user?.name || "Anonymous",
          email: user?.email || "anonymous@example.com",
        },
        content: content.trim(),
        status: "approved", // Auto-approve all comments
      })

      onCommentAdded(newComment)
      setContent("")
      if (onCancel) onCancel()
    } catch {
      setError("Failed to post comment")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">{parentId ? "Reply to Comment" : "Leave a Comment"}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <Textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder={placeholder || "Share your thoughts..."}
            className="min-h-[100px] resize-none"
            disabled={isSubmitting}
          />

          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Commenting as <span className="font-medium">{user?.name || "Anonymous"}</span>
            </p>
            <div className="flex gap-2">
              {onCancel && (
                <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
              )}
              <Button type="submit" disabled={isSubmitting || !content.trim()}>
                <Send className="h-4 w-4 mr-2" />
                {isSubmitting ? "Posting..." : "Post Comment"}
              </Button>
            </div>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
