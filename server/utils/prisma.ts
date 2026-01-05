import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '@prisma/client'

// ============================================================================
// Prisma Client Singleton
// ============================================================================

/**
 * Creates a new Prisma client instance with PostgreSQL adapter
 * Uses connection string from environment or defaults to local development
 */
const prismaClientSingleton = () => {
  const connectionString = process.env.DATABASE_URL || 
    'postgresql://magic_auth_user:magic_auth_password@localhost:5433/magic_auth'
  
  const pool = new PrismaPg({ connectionString })
  return new PrismaClient({ adapter: pool })
}

type PrismaClientSingleton = ReturnType<typeof prismaClientSingleton>

/**
 * Global store for Prisma client to prevent multiple instances
 * during hot module replacement in development
 */
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClientSingleton | undefined
}

/**
 * Shared Prisma client instance
 * Reuses existing instance in development to prevent connection exhaustion
 */
export const prisma = globalForPrisma.prisma ?? prismaClientSingleton()

// Preserve client across HMR in development
if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}

export default prisma
