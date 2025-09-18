import fs from "fs/promises"
import path from "path"

const postsFile = path.join(process.cwd(), "data", "posts.json")

async function migratePosts() {
  try {
    // Ensure data directory exists
    await fs.mkdir(path.dirname(postsFile), { recursive: true })
    
    // Check if posts file already exists
    try {
      await fs.access(postsFile)
      console.log("Posts file already exists, skipping migration")
      return
    } catch {
      // File doesn't exist, create empty array
      await fs.writeFile(postsFile, JSON.stringify([], null, 2))
      console.log("Created empty posts file")
    }
    
    console.log("Posts migration completed successfully")
  } catch (error) {
    console.error("Error migrating posts:", error)
  }
}

// Run migration if this file is executed directly
if (require.main === module) {
  migratePosts()
}

export { migratePosts }




