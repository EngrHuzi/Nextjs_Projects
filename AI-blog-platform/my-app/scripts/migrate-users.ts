import fs from 'fs'
import path from 'path'
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

interface StoredUser {
  id: string
  name: string
  email: string
  password: string
  role: string
  createdAt: string
}

async function migrateUsers() {
  try {
    console.log('Starting user migration...')
    
    // Check if data directory exists
    const dataDir = path.join(process.cwd(), 'data')
    if (!fs.existsSync(dataDir)) {
      console.log('No data directory found. No users to migrate.')
      return
    }
    
    // Check if users.json exists
    const usersFilePath = path.join(dataDir, 'users.json')
    if (!fs.existsSync(usersFilePath)) {
      console.log('No users.json file found. No users to migrate.')
      return
    }
    
    // Read users from JSON file
    const usersData = fs.readFileSync(usersFilePath, 'utf8')
    const users: StoredUser[] = JSON.parse(usersData)
    
    if (users.length === 0) {
      console.log('No users found in users.json. No users to migrate.')
      return
    }
    
    console.log(`Found ${users.length} users to migrate.`)
    
    // Migrate each user
    for (const user of users) {
      // Check if user already exists in database
      const existingUser = await prisma.user.findUnique({
        where: { email: user.email.toLowerCase() },
      })
      
      if (existingUser) {
        console.log(`User ${user.email} already exists in database. Skipping.`)
        continue
      }
      
      // Create user in database
      await prisma.user.create({
        data: {
          id: user.id,
          name: user.name,
          email: user.email.toLowerCase(),
          password: user.password, // Password is already hashed
          role: user.role.toUpperCase() as 'ADMIN' | 'USER',
          createdAt: new Date(user.createdAt),
        },
      })
      
      console.log(`Migrated user: ${user.email}`)
    }
    
    console.log('User migration completed successfully!')
  } catch (error) {
    console.error('Error migrating users:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

migrateUsers()