import { describe, it, expect, vi, beforeEach, beforeAll } from 'vitest'

// Mock modules
const mockPrisma = {
  user: {
    findUnique: vi.fn(),
    update: vi.fn(),
  },
}

const mockAuthUtils = {
  requireUser: vi.fn(),
}

vi.mock('../../server/utils/prisma', () => ({
  default: mockPrisma,
}))

vi.mock('../../server/utils/auth', () => mockAuthUtils)

vi.mock('h3', async () => {
  const actual = await vi.importActual('h3') as any
  return {
    ...actual,
    readBody: async (event: any) => event._body || {},
  }
})

const mockConfig = {
  public: {
    appUrl: 'https://example.com',
  },
}

// Mock Nuxt auto-imports
beforeAll(() => {
  ;(globalThis as any).useRuntimeConfig = () => mockConfig
  ;(globalThis as any).createError = (opts: any) => {
    const error = new Error(opts.message) as any
    error.statusCode = opts.statusCode
    error.statusMessage = opts.statusMessage
    return error
  }
  ;(globalThis as any).defineEventHandler = (handler: any) => handler
})

// Import handler after mocks
const updateHandler = (await import('../../server/api/auth/me.patch')).default

describe('PATCH /api/auth/me', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  // ==========================================================================
  // Successful Updates
  // ==========================================================================

  describe('Successful Updates', () => {
    it('should update user name', async () => {
      const mockUser = {
        id: 'user123',
        email: 'test@example.com',
        name: 'Old Name',
        stripeCustomerId: null,
      }

      const updatedUser = {
        ...mockUser,
        name: 'New Name',
      }

      mockAuthUtils.requireUser.mockResolvedValue(mockUser)
      mockPrisma.user.update.mockResolvedValue(updatedUser)

      const mockEvent = {
        _body: { name: 'New Name' },
        node: {
          req: { method: 'PATCH', headers: {} },
          res: {},
        },
      }

      const result = await updateHandler(mockEvent)

      expect(result).toEqual({
        success: true,
        user: updatedUser,
      })

      expect(mockPrisma.user.update).toHaveBeenCalledWith({
        where: { id: 'user123' },
        data: { name: 'New Name' },
      })
    })

    it('should update multiple fields at once', async () => {
      const mockUser = {
        id: 'user123',
        email: 'test@example.com',
        name: 'Old Name',
        stripeCustomerId: null,
      }

      const updateData = {
        name: 'New Name',
        bio: 'Developer',
        avatar: 'https://example.com/avatar.jpg',
      }

      const updatedUser = {
        ...mockUser,
        ...updateData,
      }

      mockAuthUtils.requireUser.mockResolvedValue(mockUser)
      mockPrisma.user.update.mockResolvedValue(updatedUser)

      const mockEvent = {
        _body: updateData,
        node: {
          req: { method: 'PATCH', headers: {} },
          res: {},
        },
      }

      const result = await updateHandler(mockEvent)

      expect(result.success).toBe(true)
      expect(mockPrisma.user.update).toHaveBeenCalledWith({
        where: { id: 'user123' },
        data: updateData,
      })
    })

    it('should update email if unique', async () => {
      const mockUser = {
        id: 'user123',
        email: 'old@example.com',
        name: 'Test User',
        stripeCustomerId: null,
      }

      const updatedUser = {
        ...mockUser,
        email: 'new@example.com',
      }

      mockAuthUtils.requireUser.mockResolvedValue(mockUser)
      mockPrisma.user.findUnique.mockResolvedValue(null) // Email not taken
      mockPrisma.user.update.mockResolvedValue(updatedUser)

      const mockEvent = {
        _body: { email: 'new@example.com' },
        node: {
          req: { method: 'PATCH', headers: {} },
          res: {},
        },
      }

      const result = await updateHandler(mockEvent)

      expect(result.success).toBe(true)
      expect(result.user.email).toBe('new@example.com')
    })
  })

  // ==========================================================================
  // Protected Fields
  // ==========================================================================

  describe('Protected Fields', () => {
    it('should ignore id field in update', async () => {
      const mockUser = {
        id: 'user123',
        email: 'test@example.com',
        name: 'Test User',
        stripeCustomerId: null,
      }

      mockAuthUtils.requireUser.mockResolvedValue(mockUser)
      mockPrisma.user.update.mockResolvedValue({ ...mockUser, name: 'Updated' })

      const mockEvent = {
        _body: {
          id: 'different-id', // Should be ignored
          name: 'Updated',
        },
        node: {
          req: { method: 'PATCH', headers: {} },
          res: {},
        },
      }

      await updateHandler(mockEvent)

      expect(mockPrisma.user.update).toHaveBeenCalledWith({
        where: { id: 'user123' },
        data: { name: 'Updated' }, // id not included
      })
    })

    it('should ignore createdAt field in update', async () => {
      const mockUser = {
        id: 'user123',
        email: 'test@example.com',
        name: 'Test User',
        stripeCustomerId: null,
      }

      mockAuthUtils.requireUser.mockResolvedValue(mockUser)
      mockPrisma.user.update.mockResolvedValue({ ...mockUser, name: 'Updated' })

      const mockEvent = {
        _body: {
          createdAt: new Date(), // Should be ignored
          name: 'Updated',
        },
        node: {
          req: { method: 'PATCH', headers: {} },
          res: {},
        },
      }

      await updateHandler(mockEvent)

      expect(mockPrisma.user.update).toHaveBeenCalledWith({
        where: { id: 'user123' },
        data: { name: 'Updated' }, // createdAt not included
      })
    })
  })

  // ==========================================================================
  // Validation Errors
  // ==========================================================================

  describe('Validation Errors', () => {
    it('should throw error if no fields to update', async () => {
      const mockUser = {
        id: 'user123',
        email: 'test@example.com',
        name: 'Test User',
        stripeCustomerId: null,
      }

      mockAuthUtils.requireUser.mockResolvedValue(mockUser)

      const mockEvent = {
        _body: {},
        node: {
          req: { method: 'PATCH', headers: {} },
          res: {},
        },
      }

      await expect(updateHandler(mockEvent)).rejects.toThrow('No valid fields to update')
    })

    it('should throw error if only protected fields provided', async () => {
      const mockUser = {
        id: 'user123',
        email: 'test@example.com',
        name: 'Test User',
        stripeCustomerId: null,
      }

      mockAuthUtils.requireUser.mockResolvedValue(mockUser)

      const mockEvent = {
        _body: {
          id: 'different-id',
          createdAt: new Date(),
        },
        node: {
          req: { method: 'PATCH', headers: {} },
          res: {},
        },
      }

      await expect(updateHandler(mockEvent)).rejects.toThrow('No valid fields to update')
    })

    it('should throw error if email already exists', async () => {
      const mockUser = {
        id: 'user123',
        email: 'old@example.com',
        name: 'Test User',
        stripeCustomerId: null,
      }

      const existingUser = {
        id: 'other-user',
        email: 'taken@example.com',
      }

      mockAuthUtils.requireUser.mockResolvedValue(mockUser)
      mockPrisma.user.findUnique.mockResolvedValue(existingUser)

      const mockEvent = {
        _body: { email: 'taken@example.com' },
        node: {
          req: { method: 'PATCH', headers: {} },
          res: {},
        },
      }

      await expect(updateHandler(mockEvent)).rejects.toThrow('Email address is already in use')
    })

    it('should handle Prisma errors gracefully', async () => {
      const mockUser = {
        id: 'user123',
        email: 'test@example.com',
        name: 'Test User',
        stripeCustomerId: null,
      }

      mockAuthUtils.requireUser.mockResolvedValue(mockUser)
      mockPrisma.user.update.mockRejectedValue(new Error('Database error'))

      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

      const mockEvent = {
        _body: { name: 'New Name' },
        node: {
          req: { method: 'PATCH', headers: {} },
          res: {},
        },
      }

      await expect(updateHandler(mockEvent)).rejects.toThrow('Database error')

      consoleErrorSpy.mockRestore()
    })
  })

  // ==========================================================================
  // Authentication
  // ==========================================================================

  describe('Authentication', () => {
    it('should require authentication', async () => {
      mockAuthUtils.requireUser.mockRejectedValue(
        new Error('Authentication required')
      )

      const mockEvent = {
        _body: { name: 'New Name' },
        node: {
          req: { method: 'PATCH', headers: {} },
          res: {},
        },
      }

      await expect(updateHandler(mockEvent)).rejects.toThrow('Authentication required')
    })
  })
})
