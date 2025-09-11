import fs from "fs/promises"
import path from "path"

export type StoredUser = {
  id: string
  name: string
  email: string
  password: string
  role: string
  createdAt: string
}

const dataDir = path.join(process.cwd(), "data")
const usersFile = path.join(dataDir, "users.json")

async function ensureDataFile(): Promise<void> {
  try {
    await fs.mkdir(dataDir, { recursive: true })
    await fs.access(usersFile)
  } catch {
    await fs.writeFile(usersFile, JSON.stringify([], null, 2), "utf8")
  }
}

export async function readAllUsers(): Promise<StoredUser[]> {
  await ensureDataFile()
  const raw = await fs.readFile(usersFile, "utf8")
  try {
    const data = JSON.parse(raw) as StoredUser[]
    return Array.isArray(data) ? data : []
  } catch {
    return []
  }
}

export async function writeAllUsers(users: StoredUser[]): Promise<void> {
  await ensureDataFile()
  await fs.writeFile(usersFile, JSON.stringify(users, null, 2), "utf8")
}

export async function findUserByEmail(email: string): Promise<StoredUser | undefined> {
  const users = await readAllUsers()
  return users.find(u => u.email.toLowerCase() === email.toLowerCase())
}

export async function countUsers(): Promise<number> {
  const users = await readAllUsers()
  return users.length
}

export async function createUser(user: Omit<StoredUser, "createdAt"> & { createdAt?: string }): Promise<StoredUser> {
  const users = await readAllUsers()
  const newUser: StoredUser = {
    ...user,
    createdAt: user.createdAt ?? new Date().toISOString(),
  }
  users.push(newUser)
  await writeAllUsers(users)
  return newUser
}


