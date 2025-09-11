"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { getApprovedCommentsByPostId, organizeComments, type Comment } from "@/lib/comments"
import { CommentForm } from "./comment-form"
import { CommentItem } from "./comment-item"
import { MessageCircle, Filter } from "lucide-react"

interface CommentSectionProps {
  postId: string
}

export function CommentSection({ postId }: CommentSectionProps) {
  const [comments, setComments] = useState<Comment[]>([])
  const [organizedComments, setOrganizedComments] = useState<Comment[]>([])
  const [sortBy, setSortBy] = useState<"newest" | "oldest" | "popular">("newest")
  const [showCommentForm, setShowCommentForm] = useState(false)

  const loadComments = useCallback(() => {
    const postComments = getApprovedCommentsByPostId(postId)
    setComments(postComments)
  }, [postId])

  useEffect(() => {
    loadComments()
  }, [loadComments])

  const organizeAndSortComments = useCallback(() => {
    const sortedComments = [...comments]

    switch (sortBy) {
      case "oldest":
        sortedComments.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
        break
      case "popular":
        sortedComments.sort((a, b) => b.likes - a.likes)
        break
      case "newest":
      default:
        sortedComments.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        break
    }

    const organized = organizeComments(sortedComments)
    setOrganizedComments(organized)
  }, [comments, sortBy])

  useEffect(() => {
    organizeAndSortComments()
  }, [organizeAndSortComments])

  

  const handleCommentAdded = () => {
    loadComments()
    setShowCommentForm(false)
  }

  const handleCommentUpdate = () => {
    loadComments()
  }

  const totalComments = comments.length
  const rootComments = comments.filter((c) => !c.parentId).length
  const replies = totalComments - rootComments

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <MessageCircle className="h-5 w-5" />
              Comments ({totalComments})
            </CardTitle>
            {totalComments > 0 && (
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-muted-foreground" />
                <Select value={sortBy} onValueChange={(value: "newest" | "oldest" | "popular") => setSortBy(value)}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="newest">Newest</SelectItem>
                    <SelectItem value="oldest">Oldest</SelectItem>
                    <SelectItem value="popular">Popular</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
          {totalComments > 0 && (
            <p className="text-sm text-muted-foreground">
              {rootComments} {rootComments === 1 ? "comment" : "comments"}
              {replies > 0 && ` • ${replies} ${replies === 1 ? "reply" : "replies"}`}
            </p>
          )}
        </CardHeader>
        <CardContent>
          {!showCommentForm ? (
            <Button onClick={() => setShowCommentForm(true)} className="w-full">
              <MessageCircle className="h-4 w-4 mr-2" />
              Join the Discussion
            </Button>
          ) : (
            <CommentForm
              postId={postId}
              onCommentAdded={handleCommentAdded}
              onCancel={() => setShowCommentForm(false)}
            />
          )}
        </CardContent>
      </Card>

      {organizedComments.length > 0 ? (
        <div className="space-y-4">
          {organizedComments.map((comment) => (
            <CommentItem key={comment.id} comment={comment} onCommentUpdate={handleCommentUpdate} />
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="py-12 text-center">
            <MessageCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No comments yet</h3>
            <p className="text-muted-foreground mb-4">Be the first to share your thoughts on this post.</p>
            {!showCommentForm && (
              <Button onClick={() => setShowCommentForm(true)}>
                <MessageCircle className="h-4 w-4 mr-2" />
                Start the Discussion
              </Button>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
