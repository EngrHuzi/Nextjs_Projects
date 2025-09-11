export interface BlogPost {
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
  status: "draft" | "published"
  createdAt: string
  updatedAt: string
  publishedAt?: string
  readTime: number
  slug: string
}

const POSTS_KEY = "blog_posts"

export const getStoredPosts = (): BlogPost[] => {
  if (typeof window === "undefined") return []
  const posts = localStorage.getItem(POSTS_KEY)
  return posts ? JSON.parse(posts) : []
}

export const storePosts = (posts: BlogPost[]): void => {
  if (typeof window === "undefined") return
  localStorage.setItem(POSTS_KEY, JSON.stringify(posts))
}

export const createPost = (
  postData: Omit<BlogPost, "id" | "createdAt" | "updatedAt" | "readTime" | "slug">,
): BlogPost => {
  const posts = getStoredPosts()
  const slug = generateSlug(postData.title)
  const readTime = calculateReadTime(postData.content)

  const newPost: BlogPost = {
    ...postData,
    id: Date.now().toString(),
    slug,
    readTime,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    publishedAt: postData.status === "published" ? new Date().toISOString() : undefined,
  }

  posts.unshift(newPost)
  storePosts(posts)
  return newPost
}

export const updatePost = (id: string, updates: Partial<BlogPost>): BlogPost | null => {
  const posts = getStoredPosts()
  const index = posts.findIndex((post) => post.id === id)

  if (index === -1) return null

  const updatedPost = {
    ...posts[index],
    ...updates,
    updatedAt: new Date().toISOString(),
    slug: updates.title ? generateSlug(updates.title) : posts[index].slug,
    readTime: updates.content ? calculateReadTime(updates.content) : posts[index].readTime,
    publishedAt:
      updates.status === "published" && posts[index].status !== "published"
        ? new Date().toISOString()
        : posts[index].publishedAt,
  }

  posts[index] = updatedPost
  storePosts(posts)
  return updatedPost
}

export const deletePost = (id: string): boolean => {
  const posts = getStoredPosts()
  const filteredPosts = posts.filter((post) => post.id !== id)

  if (filteredPosts.length === posts.length) return false

  storePosts(filteredPosts)
  return true
}

export const getPostById = (id: string): BlogPost | null => {
  const posts = getStoredPosts()
  return posts.find((post) => post.id === id) || null
}

export const getPostBySlug = (slug: string): BlogPost | null => {
  const posts = getStoredPosts()
  return posts.find((post) => post.slug === slug) || null
}

export const getPublishedPosts = (): BlogPost[] => {
  return getStoredPosts().filter((post) => post.status === "published")
}

const generateSlug = (title: string): string => {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9 -]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim()
}

const calculateReadTime = (content: string): number => {
  const wordsPerMinute = 200
  const words = content.trim().split(/\s+/).length
  return Math.ceil(words / wordsPerMinute)
}

export const CATEGORIES = [
  "Technology",
  "Business",
  "Design",
  "Marketing",
  "Lifestyle",
  "Travel",
  "Food",
  "Health",
  "Education",
  "Entertainment",
]
