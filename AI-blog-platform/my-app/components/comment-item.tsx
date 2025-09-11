"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
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
import { deleteComment, updateComment, type Comment } from "@/lib/comments"
import { CommentForm } from "./comment-form"
import { Heart, Reply, Edit, Trash2, MoreHorizontal, Check, X } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Textarea } from "@/components/ui/textarea"

interface CommentItemProps {
  comment: Comment & { replies?: Comment[] }
  onCommentUpdate: () => void
  level?: number
}

export function CommentItem({ comment, onCommentUpdate, level = 0 }: CommentItemProps) {
  const [showReplyForm, setShowReplyForm] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [editContent, setEditContent] = useState(comment.content)
  const [isLiked] = useState(false) // Disable likes for now

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60)

    if (diffInHours < 1) {
      return "Just now"
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h ago`
    } else if (diffInHours < 168) {
      return `${Math.floor(diffInHours / 24)}d ago`
    } else {
      return date.toLocaleDateString()
    }
  }

  const handleLike = () => {
    // Disable likes for now
    return
  }

  const handleDelete = () => {
    if (deleteComment(comment.id)) {
      onCommentUpdate()
    }
  }

  const handleEdit = () => {
    if (editContent.trim() && editContent !== comment.content) {
      updateComment(comment.id, { content: editContent.trim() })
      onCommentUpdate()
    }
    setIsEditing(false)
  }

  const handleReplyAdded = () => {
    setShowReplyForm(false)
    onCommentUpdate()
  }

  const handleStatusChange = (status: "approved" | "rejected") => {
    updateComment(comment.id, { status })
    onCommentUpdate()
  }

  const canEdit = true // Allow everyone to edit for now
  const canDelete = true // Allow everyone to delete for now
  const canModerate = false // Disable moderation for now
  const maxNestingLevel = 3

  return (
    <div className={`${level > 0 ? "ml-8 mt-4" : ""}`}>
      <Card className={`${comment.status === "pending" ? "border-yellow-200 bg-yellow-50/50" : ""}`}>
        <CardContent className="pt-4">
          <div className="flex items-start gap-3">
            <Avatar className="h-8 w-8">
              <AvatarFallback className="text-xs">
                {comment.author.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
                  .toUpperCase()}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2">
                <span className="font-medium text-sm">{comment.author.name}</span>
                <span className="text-xs text-muted-foreground">{formatDate(comment.createdAt)}</span>
                {comment.isEdited && (
                  <Badge variant="outline" className="text-xs">
                    Edited
                  </Badge>
                )}
                {comment.status === "pending" && (
                  <Badge variant="secondary" className="text-xs">
                    Pending
                  </Badge>
                )}
                {comment.status === "rejected" && (
                  <Badge variant="destructive" className="text-xs">
                    Rejected
                  </Badge>
                )}
              </div>

              {isEditing ? (
                <div className="space-y-2">
                  <Textarea
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    className="min-h-[80px] resize-none"
                  />
                  <div className="flex gap-2">
                    <Button size="sm" onClick={handleEdit}>
                      <Check className="h-3 w-3 mr-1" />
                      Save
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => setIsEditing(false)}>
                      <X className="h-3 w-3 mr-1" />
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <p className="text-sm leading-relaxed mb-3">{comment.content}</p>
              )}

              <div className="flex items-center gap-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleLike}
                  className={`h-8 px-2 ${isLiked ? "text-red-500" : ""}`}
                  disabled={true}
                >
                  <Heart className={`h-3 w-3 mr-1 ${isLiked ? "fill-current" : ""}`} />
                  <span className="text-xs">{comment.likes}</span>
                </Button>

                {level < maxNestingLevel && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowReplyForm(!showReplyForm)}
                    className="h-8 px-2"
                  >
                    <Reply className="h-3 w-3 mr-1" />
                    <span className="text-xs">Reply</span>
                  </Button>
                )}

                {(canEdit || canDelete || canModerate) && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <MoreHorizontal className="h-3 w-3" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      {canEdit && (
                        <DropdownMenuItem onClick={() => setIsEditing(true)}>
                          <Edit className="h-3 w-3 mr-2" />
                          Edit
                        </DropdownMenuItem>
                      )}
                      {canModerate && comment.status === "pending" && (
                        <>
                          <DropdownMenuItem onClick={() => handleStatusChange("approved")}>
                            <Check className="h-3 w-3 mr-2" />
                            Approve
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleStatusChange("rejected")}>
                            <X className="h-3 w-3 mr-2" />
                            Reject
                          </DropdownMenuItem>
                        </>
                      )}
                      {canDelete && (
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                              <Trash2 className="h-3 w-3 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Comment</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete this comment? This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {showReplyForm && (
        <div className="mt-4 ml-8">
          <CommentForm
            postId={comment.postId}
            parentId={comment.id}
            onCommentAdded={handleReplyAdded}
            onCancel={() => setShowReplyForm(false)}
            placeholder={`Reply to ${comment.author.name}...`}
          />
        </div>
      )}

      {comment.replies && comment.replies.length > 0 && (
        <div className="mt-2">
          {comment.replies.map((reply) => (
            <CommentItem key={reply.id} comment={reply} onCommentUpdate={onCommentUpdate} level={level + 1} />
          ))}
        </div>
      )}
    </div>
  )
}
