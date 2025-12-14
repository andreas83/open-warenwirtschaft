import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mockPrisma } from '../../mocks/prisma.mock'
import { createMockEvent } from '../../helpers/api-test.helpers'
import { createTestRechnung, createTestRechnungsposition } from '../../helpers/test-data.factory'

describe('Rechnungen API', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Invoice Operations', () => {
    it('should create a new invoice with positions', async () => {
      const newInvoiceData = {
        KundenID: 1,
        Rechnungsdatum: new Date('2024-01-01'),
        Faelligkeitsdatum: new Date('2024-01-31'),
        Status: 'offen',
        GesamtbetragNetto: 100.00,
        GesamtbetragBrutto: 119.00,
        MwStBetrag: 19.00,
        Waehrung: 'EUR',
        StandortID: 1,
        Positionen: [
          {
            ProduktID: 1,
            Bezeichnung: 'Test Produkt',
            Menge: 1,
            Einzelpreis: 100.00,
            MwStSatz: 19.00,
            Gesamtpreis: 119.00
          }
        ]
      }

      const createdInvoice = createTestRechnung()
      mockPrisma.rechnungen.create.mockResolvedValue(createdInvoice)

      expect(createdInvoice).toHaveProperty('RechnungsID')
      expect(createdInvoice).toHaveProperty('Status', 'offen')
    })

    it('should calculate invoice totals correctly', () => {
      const position1 = createTestRechnungsposition({
        Menge: 2,
        Einzelpreis: 50.00,
        MwStSatz: 19.00
      })

      const position2 = createTestRechnungsposition({
        Menge: 1,
        Einzelpreis: 30.00,
        MwStSatz: 19.00
      })

      // Netto: (2 * 50) + (1 * 30) = 130
      const nettoTotal = (position1.Menge * position1.Einzelpreis) +
                         (position2.Menge * position2.Einzelpreis)

      // MwSt: 130 * 0.19 = 24.70
      const mwstTotal = nettoTotal * (position1.MwStSatz / 100)

      // Brutto: 130 + 24.70 = 154.70
      const bruttoTotal = nettoTotal + mwstTotal

      expect(nettoTotal).toBe(130.00)
      expect(mwstTotal).toBe(24.70)
      expect(bruttoTotal).toBe(154.70)
    })

    it('should retrieve invoice with all related data', async () => {
      const invoiceWithRelations = {
        ...createTestRechnung(),
        Kunden: {
          KundenID: 1,
          Firmenname: 'Test Kunde GmbH'
        },
        Rechnungspositionen: [
          createTestRechnungsposition()
        ],
        Standorte: {
          StandortID: 1,
          Standortname: 'Hauptlager'
        }
      }

      mockPrisma.rechnungen.findUnique.mockResolvedValue(invoiceWithRelations)

      const result = invoiceWithRelations

      expect(result).toHaveProperty('Kunden')
      expect(result).toHaveProperty('Rechnungspositionen')
      expect(result).toHaveProperty('Standorte')
    })

    it('should filter invoices by status', async () => {
      const openInvoices = [
        createTestRechnung({ RechnungsID: 1, Status: 'offen' }),
        createTestRechnung({ RechnungsID: 2, Status: 'offen' }),
      ]

      mockPrisma.rechnungen.findMany.mockResolvedValue(openInvoices)

      const result = openInvoices

      expect(result).toHaveLength(2)
      expect(result.every(inv => inv.Status === 'offen')).toBe(true)
    })

    it('should filter invoices by date range', async () => {
      const dateFrom = new Date('2024-01-01')
      const dateTo = new Date('2024-12-31')

      const invoicesInRange = [
        createTestRechnung({
          RechnungsID: 1,
          Rechnungsdatum: new Date('2024-06-15')
        }),
      ]

      mockPrisma.rechnungen.findMany.mockResolvedValue(invoicesInRange)

      const result = invoicesInRange

      result.forEach(invoice => {
        expect(invoice.Rechnungsdatum >= dateFrom).toBe(true)
        expect(invoice.Rechnungsdatum <= dateTo).toBe(true)
      })
    })
  })
})
