import { PrismaClient } from '@prisma/client'
import { execSync } from 'child_process'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function setupDatabase() {
  try {
    console.log('Setting up database...')
    
    // Run Prisma migrations
    console.log('Running Prisma migrations...')
    execSync('npx prisma migrate deploy', { stdio: 'inherit' })
    
    // Check if admin user exists
    const adminExists = await prisma.user.findFirst({
      where: { role: 'ADMIN' },
    })
    
    // Create admin user if none exists
    if (!adminExists) {
      console.log('Creating admin user...')
      const hashedPassword = await bcrypt.hash('admin123', 12)
      
      await prisma.user.create({
        data: {
          name: 'Admin User',
          email: 'admin@example.com',
          password: hashedPassword,
          role: 'ADMIN',
        },
      })
      
      console.log('Admin user created successfully!')
      console.log('Email: admin@example.com')
      console.log('Password: admin123')
      console.log('IMPORTANT: Change this password after first login!')
    } else {
      console.log('Admin user already exists. Skipping creation.')
    }
    
    // Create sample blog post if none exists
    const postCount = await prisma.post.count()
    
    if (postCount === 0) {
      console.log('Creating sample blog post...')
      
      const admin = await prisma.user.findFirst({
        where: { role: 'ADMIN' },
      })
      
      if (admin) {
        await prisma.post.create({
          data: {
            title: 'Welcome to the AI Blog Platform',
            content: 'This is a sample blog post created during database setup. You can edit or delete this post from the admin dashboard.',
            published: true,
            authorId: admin.id,
          },
        })
        
        console.log('Sample blog post created successfully!')
      }
    } else {
      console.log('Blog posts already exist. Skipping sample creation.')
    }
    
    console.log('Database setup completed successfully!')
  } catch (error) {
    console.error('Error setting up database:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

setupDatabase()