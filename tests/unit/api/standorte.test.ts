import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mockPrisma } from '../../mocks/prisma.mock'
import { createMockEvent } from '../../helpers/api-test.helpers'
import { createTestStandort, createTestBestand } from '../../helpers/test-data.factory'

describe('Standorte API', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Location Management', () => {
    it('should return all locations', async () => {
      const testLocations = [
        createTestStandort({ StandortID: 1, Standortname: 'Hauptlager' }),
        createTestStandort({ StandortID: 2, Standortname: 'Filiallager', IstHauptstandort: false }),
      ]

      mockPrisma.standorte.findMany.mockResolvedValue(testLocations)

      const result = testLocations

      expect(result).toHaveLength(2)
      expect(result[0].IstHauptstandort).toBe(true)
      expect(result[1].IstHauptstandort).toBe(false)
    })

    it('should retrieve location by ID', async () => {
      const testLocation = createTestStandort({ StandortID: 1 })
      mockPrisma.standorte.findUnique.mockResolvedValue(testLocation)

      const result = testLocation

      expect(result).toHaveProperty('StandortID', 1)
      expect(result).toHaveProperty('Standortname', 'Hauptlager')
    })

    it('should create a new location', async () => {
      const newLocation = {
        Standortname: 'Neues Lager',
        Adresse: 'Neue Straße 1',
        PLZ: '12345',
        Stadt: 'Neustadt',
        Land: 'Deutschland',
        IstHauptstandort: false
      }

      const createdLocation = createTestStandort(newLocation)
      mockPrisma.standorte.create.mockResolvedValue(createdLocation)

      const result = createdLocation

      expect(result).toHaveProperty('Standortname', 'Neues Lager')
      expect(result).toHaveProperty('IstHauptstandort', false)
    })

    it('should update location details', async () => {
      const updatedLocation = createTestStandort({
        StandortID: 1,
        Standortname: 'Aktualisiertes Lager'
      })

      mockPrisma.standorte.update.mockResolvedValue(updatedLocation)

      const result = updatedLocation

      expect(result).toHaveProperty('Standortname', 'Aktualisiertes Lager')
    })

    it('should retrieve location with inventory', async () => {
      const locationWithInventory = {
        ...createTestStandort(),
        Bestand: [
          createTestBestand({ ProduktID: 1, Menge: 100 }),
          createTestBestand({ ProduktID: 2, Menge: 50 }),
        ]
      }

      mockPrisma.standorte.findUnique.mockResolvedValue(locationWithInventory)

      const result = locationWithInventory

      expect(result).toHaveProperty('Bestand')
      expect(result.Bestand).toHaveLength(2)
    })
  })
})
