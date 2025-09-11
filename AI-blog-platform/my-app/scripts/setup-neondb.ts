import { prisma, verifyDatabaseConnection } from '../lib/db'
import { logger } from '../lib/logger'

async function setupNeonDB() {
  
  try {
    // Test the connection to NeonDB
    logger.info('Testing connection to NeonDB...')
    const connected = await verifyDatabaseConnection()
    
    if (!connected) {
      throw new Error('Failed to connect to NeonDB')
    }
    
    logger.info('Successfully connected to NeonDB!')
    
    // Run a simple query to verify the connection
    const result = await prisma.$queryRaw`SELECT current_database(), current_schema(), version();`
    logger.info('Database information:', { result })
    
    // Check if the required tables exist
    const tables = await prisma.$queryRaw`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `
    logger.info('Existing tables:', { tables })
    
    logger.info('NeonDB setup verification completed successfully')
  } catch (error) {
    logger.error('Failed to connect to NeonDB', { error })
    throw error
  } finally {
    await prisma.$disconnect()
    logger.info('Disconnected from NeonDB')
  }
}

// Run the setup verification
setupNeonDB().catch((error) => {
  logger.error('NeonDB setup verification failed', { error })
  process.exit(1)
})