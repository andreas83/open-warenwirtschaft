import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mockPrisma } from '../../mocks/prisma.mock'
import { createMockEvent } from '../../helpers/api-test.helpers'
import { createTestProdukt } from '../../helpers/test-data.factory'
import produkteGetHandler from '../../../server/api/produkte.get'
import produktePostHandler from '../../../server/api/produkte.post'

describe('Produkte API', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('GET /api/produkte', () => {
    it('should return all products with pagination', async () => {
      const testProducts = [
        createTestProdukt({ ProduktID: 1, Produktname: 'Produkt 1' }),
        createTestProdukt({ ProduktID: 2, Produktname: 'Produkt 2' }),
      ]

      mockPrisma.produkte.findMany.mockResolvedValue(testProducts)
      mockPrisma.produkte.count.mockResolvedValue(2)

      const event = createMockEvent({
        query: { limit: '10', offset: '0' }
      })

      const result = await produkteGetHandler(event)

      expect(mockPrisma.produkte.findMany).toHaveBeenCalled()
      expect(result).toHaveProperty('data')
      expect(result).toHaveProperty('total', 2)
      expect(result.data).toHaveLength(2)
    })

    it('should return a single product by ID', async () => {
      const testProduct = createTestProdukt({ ProduktID: 1 })
      mockPrisma.produkte.findUnique.mockResolvedValue(testProduct)

      const event = createMockEvent({
        query: { id: '1' }
      })

      const result = await produkteGetHandler(event)

      expect(mockPrisma.produkte.findUnique).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { ProduktID: 1 }
        })
      )
      expect(result).toEqual(testProduct)
    })

    it('should return 404 when product not found', async () => {
      mockPrisma.produkte.findUnique.mockResolvedValue(null)

      const event = createMockEvent({
        query: { id: '999' }
      })

      const result = await produkteGetHandler(event)

      expect(result).toHaveProperty('status', 404)
      expect(result).toHaveProperty('message', 'Produkt nicht gefunden')
    })

    it('should search products by name or description', async () => {
      const searchResults = [
        createTestProdukt({ ProduktID: 1, Produktname: 'Apfel' }),
      ]

      mockPrisma.produkte.findMany.mockResolvedValue(searchResults)
      mockPrisma.produkte.count.mockResolvedValue(1)

      const event = createMockEvent({
        query: { search: 'Apfel', limit: '10', offset: '0' }
      })

      const result = await produkteGetHandler(event)

      expect(mockPrisma.produkte.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            OR: [
              { Produktname: { contains: 'Apfel' } },
              { Beschreibung: { contains: 'Apfel' } }
            ]
          }
        })
      )
      expect(result.data).toHaveLength(1)
    })

    it('should handle errors gracefully', async () => {
      mockPrisma.produkte.findMany.mockRejectedValue(new Error('Database error'))

      const event = createMockEvent({
        query: { limit: '10', offset: '0' }
      })

      const result = await produkteGetHandler(event)

      expect(result).toHaveProperty('status', 500)
      expect(result).toHaveProperty('message', 'Interner Serverfehler')
    })
  })

  describe('POST /api/produkte', () => {
    it('should create a new product', async () => {
      const newProductData = {
        Produktname: 'Neues Produkt',
        Beschreibung: 'Test Beschreibung',
        Artikelnummer: 'ART-001',
        EAN_Code: '1234567890123',
        UmsatzsteuersatzID: 1,
        EinheitID: 1,
      }

      const createdProduct = createTestProdukt(newProductData)
      mockPrisma.produkte.create.mockResolvedValue(createdProduct)

      const event = createMockEvent({
        body: newProductData
      })

      const result = await produktePostHandler(event)

      expect(mockPrisma.produkte.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            Produktname: 'Neues Produkt'
          })
        })
      )
      expect(result).toHaveProperty('status', 201)
      expect(result).toHaveProperty('data')
    })

    it('should validate required fields', async () => {
      const event = createMockEvent({
        body: { Beschreibung: 'Test' } // Missing Produktname
      })

      const result = await produktePostHandler(event)

      expect(result).toHaveProperty('status', 400)
      expect(result).toHaveProperty('message', 'Produktname ist erforderlich')
    })

    it('should handle empty body', async () => {
      global.readBody = vi.fn().mockResolvedValue(undefined)

      const event = createMockEvent({})

      const result = await produktePostHandler(event)

      expect(result).toHaveProperty('status', 400)
    })

    it('should create product with supplier details', async () => {
      const productWithSupplier = {
        Produktname: 'Produkt mit Lieferant',
        UmsatzsteuersatzID: 1,
        EinheitID: 1,
        LieferantenDetails: [
          {
            LieferantenID: 1,
            LieferantenArtikelnummer: 'LF-001',
            Lieferzeit: 7,
            Mindestbestellmenge: 10,
            PreisBeimLieferanten: 50.00,
            WaehrungLieferant: 'EUR'
          }
        ]
      }

      const createdProduct = createTestProdukt()
      mockPrisma.produkte.create.mockResolvedValue(createdProduct)

      const event = createMockEvent({
        body: productWithSupplier
      })

      const result = await produktePostHandler(event)

      expect(mockPrisma.produkte.create).toHaveBeenCalled()
      expect(result).toHaveProperty('status', 201)
    })
  })
})
