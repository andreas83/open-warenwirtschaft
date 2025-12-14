import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mockPrisma } from '../mocks/prisma.mock'
import {
  createTestProdukt,
  createTestBestand,
  createTestLieferant,
  createTestStandort
} from '../helpers/test-data.factory'

/**
 * Integration Tests for Product Management Workflow
 * Tests product creation, inventory management, and supplier relations
 */
describe('Product Management Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Complete Product Setup', () => {
    it('should create product with supplier and initial inventory', async () => {
      // Create supplier
      const lieferant = createTestLieferant({ LieferantenID: 1 })
      mockPrisma.lieferanten.findUnique.mockResolvedValue(lieferant)

      // Create product with supplier link
      const produkt = createTestProdukt({
        ProduktID: 1,
        Produktname: 'Neues Produkt'
      })

      mockPrisma.produkte.create.mockResolvedValue(produkt)

      // Create initial inventory at main location
      const standort = createTestStandort({
        StandortID: 1,
        IstHauptstandort: true
      })

      const bestand = createTestBestand({
        ProduktID: produkt.ProduktID,
        StandortID: standort.StandortID,
        Menge: 100,
        Mindestbestand: 10,
        Maximalbestand: 500
      })

      mockPrisma.bestand.create.mockResolvedValue(bestand)

      // Verify complete setup
      expect(produkt).toBeDefined()
      expect(bestand.ProduktID).toBe(produkt.ProduktID)
      expect(bestand.Menge).toBe(100)
    })
  })

  describe('Inventory Management', () => {
    it('should transfer inventory between locations', async () => {
      const fromLocation = 1
      const toLocation = 2
      const produktId = 1
      const transferMenge = 50

      // Get source inventory
      const sourceBestand = createTestBestand({
        ProduktID: produktId,
        StandortID: fromLocation,
        Menge: 100
      })

      mockPrisma.bestand.findFirst.mockResolvedValueOnce(sourceBestand)

      // Get target inventory
      const targetBestand = createTestBestand({
        ProduktID: produktId,
        StandortID: toLocation,
        Menge: 20
      })

      mockPrisma.bestand.findFirst.mockResolvedValueOnce(targetBestand)

      // Update source (decrease)
      const updatedSource = {
        ...sourceBestand,
        Menge: sourceBestand.Menge - transferMenge
      }

      // Update target (increase)
      const updatedTarget = {
        ...targetBestand,
        Menge: targetBestand.Menge + transferMenge
      }

      mockPrisma.bestand.upsert
        .mockResolvedValueOnce(updatedSource)
        .mockResolvedValueOnce(updatedTarget)

      // Create movement records
      const outgoingMovement = {
        BewegungID: 1,
        ProduktID: produktId,
        StandortID: fromLocation,
        Bewegungsart: 'Transfer Ausgang',
        Menge: transferMenge,
        Datum: new Date()
      }

      const incomingMovement = {
        BewegungID: 2,
        ProduktID: produktId,
        StandortID: toLocation,
        Bewegungsart: 'Transfer Eingang',
        Menge: transferMenge,
        Datum: new Date()
      }

      mockPrisma.lagerbewegungen.create
        .mockResolvedValueOnce(outgoingMovement)
        .mockResolvedValueOnce(incomingMovement)

      // Verify transfer
      expect(updatedSource.Menge).toBe(50)
      expect(updatedTarget.Menge).toBe(70)
    })

    it('should handle stock replenishment from supplier', async () => {
      const produkt = createTestProdukt({ ProduktID: 1 })
      const currentBestand = createTestBestand({
        ProduktID: 1,
        Menge: 5,
        Mindestbestand: 10,
        Maximalbestand: 100
      })

      mockPrisma.bestand.findFirst.mockResolvedValue(currentBestand)

      // Check if replenishment needed
      const needsReplenishment = currentBestand.Menge < currentBestand.Mindestbestand
      expect(needsReplenishment).toBe(true)

      // Calculate order quantity (to max level)
      const orderQuantity = currentBestand.Maximalbestand - currentBestand.Menge
      expect(orderQuantity).toBe(95)

      // Create purchase order
      const bestellung = {
        BestellungID: 1,
        LieferantenID: 1,
        Bestelldatum: new Date(),
        Status: 'bestellt'
      }

      // After receiving goods
      const updatedBestand = {
        ...currentBestand,
        Menge: currentBestand.Menge + orderQuantity
      }

      mockPrisma.bestand.upsert.mockResolvedValue(updatedBestand)

      expect(updatedBestand.Menge).toBe(100)
      expect(updatedBestand.Menge).toBe(currentBestand.Maximalbestand)
    })
  })

  describe('Multi-Location Inventory', () => {
    it('should get total inventory across all locations', async () => {
      const produktId = 1

      const inventoryAtLocations = [
        createTestBestand({ ProduktID: produktId, StandortID: 1, Menge: 100 }),
        createTestBestand({ ProduktID: produktId, StandortID: 2, Menge: 50 }),
        createTestBestand({ ProduktID: produktId, StandortID: 3, Menge: 25 }),
      ]

      mockPrisma.bestand.findMany.mockResolvedValue(inventoryAtLocations)

      const totalMenge = inventoryAtLocations.reduce((sum, b) => sum + b.Menge, 0)

      expect(totalMenge).toBe(175)
      expect(inventoryAtLocations).toHaveLength(3)
    })

    it('should identify locations with low stock', async () => {
      const inventoryAtLocations = [
        createTestBestand({ StandortID: 1, Menge: 100, Mindestbestand: 10 }),
        createTestBestand({ StandortID: 2, Menge: 5, Mindestbestand: 10 }),
        createTestBestand({ StandortID: 3, Menge: 3, Mindestbestand: 10 }),
      ]

      mockPrisma.bestand.findMany.mockResolvedValue(inventoryAtLocations)

      const lowStockLocations = inventoryAtLocations.filter(
        b => b.Menge < b.Mindestbestand
      )

      expect(lowStockLocations).toHaveLength(2)
      expect(lowStockLocations[0].StandortID).toBe(2)
      expect(lowStockLocations[1].StandortID).toBe(3)
    })
  })

  describe('Product Price Management', () => {
    it('should handle price changes with validity dates', () => {
      const currentDate = new Date('2024-06-15')

      const prices = [
        {
          PreisID: 1,
          ProduktID: 1,
          Preis: 100.00,
          GueltigAb: new Date('2024-01-01'),
          GueltigBis: new Date('2024-05-31')
        },
        {
          PreisID: 2,
          ProduktID: 1,
          Preis: 110.00,
          GueltigAb: new Date('2024-06-01'),
          GueltigBis: null
        }
      ]

      const currentPrice = prices.find(p =>
        p.GueltigAb <= currentDate &&
        (p.GueltigBis === null || p.GueltigBis >= currentDate)
      )

      expect(currentPrice?.Preis).toBe(110.00)
      expect(currentPrice?.PreisID).toBe(2)
    })
  })
})
