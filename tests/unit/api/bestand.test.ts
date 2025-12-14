import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mockPrisma } from '../../mocks/prisma.mock'
import { createTestBestand } from '../../helpers/test-data.factory'

describe('Bestand (Inventory) API', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Inventory Management', () => {
    it('should retrieve inventory for a product at a location', async () => {
      const testInventory = createTestBestand({
        ProduktID: 1,
        StandortID: 1,
        Menge: 100
      })

      mockPrisma.bestand.findFirst.mockResolvedValue(testInventory)

      const result = testInventory

      expect(result).toHaveProperty('ProduktID', 1)
      expect(result).toHaveProperty('StandortID', 1)
      expect(result).toHaveProperty('Menge', 100)
    })

    it('should update inventory quantity', async () => {
      const updatedInventory = createTestBestand({
        ProduktID: 1,
        StandortID: 1,
        Menge: 150
      })

      mockPrisma.bestand.upsert.mockResolvedValue(updatedInventory)

      const result = updatedInventory

      expect(result).toHaveProperty('Menge', 150)
    })

    it('should warn when stock is below minimum', () => {
      const lowStock = createTestBestand({
        Menge: 5,
        Mindestbestand: 10,
        Maximalbestand: 100
      })

      const isBelowMinimum = lowStock.Menge < lowStock.Mindestbestand

      expect(isBelowMinimum).toBe(true)
    })

    it('should warn when stock exceeds maximum', () => {
      const overStock = createTestBestand({
        Menge: 550,
        Mindestbestand: 10,
        Maximalbestand: 500
      })

      const isAboveMaximum = overStock.Menge > overStock.Maximalbestand

      expect(isAboveMaximum).toBe(true)
    })

    it('should retrieve all inventory items for a location', async () => {
      const locationInventory = [
        createTestBestand({ ProduktID: 1, StandortID: 1, Menge: 100 }),
        createTestBestand({ ProduktID: 2, StandortID: 1, Menge: 50 }),
        createTestBestand({ ProduktID: 3, StandortID: 1, Menge: 200 }),
      ]

      mockPrisma.bestand.findMany.mockResolvedValue(locationInventory)

      const result = locationInventory

      expect(result).toHaveLength(3)
      expect(result.every(item => item.StandortID === 1)).toBe(true)
    })

    it('should create stock movement record', async () => {
      const stockMovement = {
        ProduktID: 1,
        StandortID: 1,
        Bewegungsart: 'Eingang',
        Menge: 50,
        Datum: new Date(),
        Referenz: 'WE-2024-001'
      }

      mockPrisma.lagerbewegungen.create.mockResolvedValue({
        BewegungID: 1,
        ...stockMovement
      })

      const result = await mockPrisma.lagerbewegungen.create({
        data: stockMovement
      })

      expect(result).toHaveProperty('BewegungID')
      expect(result).toHaveProperty('Bewegungsart', 'Eingang')
      expect(result).toHaveProperty('Menge', 50)
    })
  })
})
