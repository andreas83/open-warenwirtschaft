import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mockPrisma } from '../../mocks/prisma.mock'
import { createMockEvent } from '../../helpers/api-test.helpers'
import { createTestKunde } from '../../helpers/test-data.factory'
import kundenGetHandler from '../../../server/api/kunden.get'

describe('Kunden API', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('GET /api/kunden', () => {
    it('should return all customers with pagination', async () => {
      const testCustomers = [
        createTestKunde({ KundenID: 1, Firmenname: 'Firma 1' }),
        createTestKunde({ KundenID: 2, Firmenname: 'Firma 2' }),
      ]

      mockPrisma.kunden.findMany.mockResolvedValue(testCustomers)

      const event = createMockEvent({
        query: { limit: '10', offset: '0' }
      })

      const result = await kundenGetHandler(event)

      expect(mockPrisma.kunden.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          take: 10,
          skip: 0
        })
      )
      expect(result).toHaveLength(2)
    })

    it('should return a single customer by ID', async () => {
      const testCustomer = createTestKunde({ KundenID: 1 })
      mockPrisma.kunden.findUnique.mockResolvedValue(testCustomer)

      const event = createMockEvent({
        query: { id: '1' }
      })

      const result = await kundenGetHandler(event)

      expect(mockPrisma.kunden.findUnique).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { KundenID: 1 }
        })
      )
      expect(result).toEqual(testCustomer)
    })

    it('should return 404 when customer not found', async () => {
      mockPrisma.kunden.findUnique.mockResolvedValue(null)

      const event = createMockEvent({
        query: { id: '999' }
      })

      const result = await kundenGetHandler(event)

      expect(result).toHaveProperty('status', 404)
      expect(result).toHaveProperty('message', 'Kunde nicht gefunden')
    })

    it('should use default pagination values', async () => {
      const testCustomers = [createTestKunde()]
      mockPrisma.kunden.findMany.mockResolvedValue(testCustomers)

      const event = createMockEvent({
        query: {} // No limit/offset provided
      })

      const result = await kundenGetHandler(event)

      expect(mockPrisma.kunden.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          take: 10,  // Default limit
          skip: 0    // Default offset
        })
      )
    })

    it('should handle errors gracefully', async () => {
      mockPrisma.kunden.findMany.mockRejectedValue(new Error('Database error'))

      const event = createMockEvent({
        query: {}
      })

      const result = await kundenGetHandler(event)

      expect(result).toHaveProperty('status', 500)
      expect(result).toHaveProperty('message', 'Interner Serverfehler')
    })
  })
})
