export interface Comment {
  id: string
  postId: string
  author: {
    id: string
    name: string
    email: string
  }
  content: string
  parentId?: string // For threaded replies
  createdAt: string
  updatedAt: string
  isEdited: boolean
  status: "approved" | "pending" | "rejected"
  likes: number
  likedBy: string[] // User IDs who liked this comment
}

const COMMENTS_KEY = "blog_comments"

export const getStoredComments = (): Comment[] => {
  if (typeof window === "undefined") return []
  const comments = localStorage.getItem(COMMENTS_KEY)
  return comments ? JSON.parse(comments) : []
}

export const storeComments = (comments: Comment[]): void => {
  if (typeof window === "undefined") return
  localStorage.setItem(COMMENTS_KEY, JSON.stringify(comments))
}

export const createComment = (
  commentData: Omit<Comment, "id" | "createdAt" | "updatedAt" | "isEdited" | "likes" | "likedBy">,
): Comment => {
  const comments = getStoredComments()

  const newComment: Comment = {
    ...commentData,
    id: Date.now().toString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    isEdited: false,
    likes: 0,
    likedBy: [],
  }

  comments.unshift(newComment)
  storeComments(comments)
  return newComment
}

export const updateComment = (id: string, updates: Partial<Comment>): Comment | null => {
  const comments = getStoredComments()
  const index = comments.findIndex((comment) => comment.id === id)

  if (index === -1) return null

  const updatedComment = {
    ...comments[index],
    ...updates,
    updatedAt: new Date().toISOString(),
    isEdited: updates.content ? true : comments[index].isEdited,
  }

  comments[index] = updatedComment
  storeComments(comments)
  return updatedComment
}

export const deleteComment = (id: string): boolean => {
  const comments = getStoredComments()
  const filteredComments = comments.filter((comment) => comment.id !== id)

  if (filteredComments.length === comments.length) return false

  storeComments(filteredComments)
  return true
}

export const getCommentsByPostId = (postId: string): Comment[] => {
  return getStoredComments().filter((comment) => comment.postId === postId)
}

export const getApprovedCommentsByPostId = (postId: string): Comment[] => {
  return getCommentsByPostId(postId).filter((comment) => comment.status === "approved")
}

export const toggleCommentLike = (commentId: string, userId: string): Comment | null => {
  const comments = getStoredComments()
  const index = comments.findIndex((comment) => comment.id === commentId)

  if (index === -1) return null

  const comment = comments[index]
  const hasLiked = comment.likedBy.includes(userId)

  if (hasLiked) {
    comment.likedBy = comment.likedBy.filter((id) => id !== userId)
    comment.likes = Math.max(0, comment.likes - 1)
  } else {
    comment.likedBy.push(userId)
    comment.likes += 1
  }

  comment.updatedAt = new Date().toISOString()
  comments[index] = comment
  storeComments(comments)
  return comment
}

export const organizeComments = (comments: Comment[]): Comment[] => {
  const commentMap = new Map<string, Comment & { replies: Comment[] }>()
  const rootComments: (Comment & { replies: Comment[] })[] = []

  // First pass: create map and add replies array
  comments.forEach((comment) => {
    commentMap.set(comment.id, { ...comment, replies: [] })
  })

  // Second pass: organize into tree structure
  comments.forEach((comment) => {
    const commentWithReplies = commentMap.get(comment.id)!

    if (comment.parentId) {
      const parent = commentMap.get(comment.parentId)
      if (parent) {
        parent.replies.push(commentWithReplies)
      }
    } else {
      rootComments.push(commentWithReplies)
    }
  })

  // Sort by creation date (newest first for root, oldest first for replies)
  rootComments.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  rootComments.forEach((comment) => {
    comment.replies.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
  })

  return rootComments
}

export const getPendingComments = (): Comment[] => {
  return getStoredComments().filter((comment) => comment.status === "pending")
}

export const getCommentStats = () => {
  const comments = getStoredComments()
  return {
    total: comments.length,
    approved: comments.filter((c) => c.status === "approved").length,
    pending: comments.filter((c) => c.status === "pending").length,
    rejected: comments.filter((c) => c.status === "rejected").length,
  }
}
