import { PrismaClient } from "@prisma/client"
import { logger } from "./logger"

declare global {
  // Prevent multiple instances of Prisma Client in dev
  var prisma: PrismaClient | undefined
}

const prismaClientSingleton = () => {
  try {
    return new PrismaClient({
      log: process.env.LOG_LEVEL === "debug" ? ["query", "error", "warn"] : ["error"],
      datasources: {
        db: {
          url: process.env.DATABASE_URL,
        },
      },
    })
  } catch (error) {
    logger.error("Failed to initialize Prisma client", { error })
    throw new Error("Database connection failed")
  }
}

export const prisma = global.prisma ?? prismaClientSingleton()

if (process.env.NODE_ENV !== "production") global.prisma = prisma

// ✅ Removed all Node.js-specific code to ensure Edge Runtime compatibility
// If you need to disconnect Prisma on process exit, do it in server-only scripts, not here.

// Verify database connection on startup
export const verifyDatabaseConnection = async () => {
  try {
    await prisma.$connect()
    logger.info("Successfully connected to database")
    return true
  } catch (error) {
    logger.error("Failed to connect to database", { error })
    return false
  }
}
