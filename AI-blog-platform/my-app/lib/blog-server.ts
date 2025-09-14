import fs from "fs/promises"
import path from "path"
import type { BlogPost } from "./blog"

const postsFile = path.join(process.cwd(), "data", "posts.json")

// Server-side function to get posts from file system
export const getStoredPostsFromFS = async (): Promise<BlogPost[]> => {
  try {
    await fs.mkdir(path.dirname(postsFile), { recursive: true })
    const data = await fs.readFile(postsFile, "utf8")
    return JSON.parse(data)
  } catch {
    return []
  }
}

export const savePostsToFS = async (posts: BlogPost[]): Promise<void> => {
  await fs.mkdir(path.dirname(postsFile), { recursive: true })
  await fs.writeFile(postsFile, JSON.stringify(posts, null, 2))
}


