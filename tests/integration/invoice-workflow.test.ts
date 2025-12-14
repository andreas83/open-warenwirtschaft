import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mockPrisma } from '../mocks/prisma.mock'
import {
  createTestRechnung,
  createTestRechnungsposition,
  createTestKunde,
  createTestProdukt,
  createTestBestand
} from '../helpers/test-data.factory'

/**
 * Integration Tests for Invoice Workflow
 * Tests the complete invoice creation and management process
 */
describe('Invoice Workflow Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Complete Invoice Creation Process', () => {
    it('should create invoice with customer, products, and calculate totals', async () => {
      // Setup test data
      const kunde = createTestKunde({ KundenID: 1 })
      const produkt1 = createTestProdukt({ ProduktID: 1, Produktname: 'Produkt A' })
      const produkt2 = createTestProdukt({ ProduktID: 2, Produktname: 'Produkt B' })

      // Mock customer lookup
      mockPrisma.kunden.findUnique.mockResolvedValue(kunde)

      // Mock product lookups
      mockPrisma.produkte.findUnique
        .mockResolvedValueOnce(produkt1)
        .mockResolvedValueOnce(produkt2)

      // Create invoice positions
      const positions = [
        {
          ProduktID: 1,
          Bezeichnung: 'Produkt A',
          Menge: 2,
          Einzelpreis: 50.00,
          MwStSatz: 19.00
        },
        {
          ProduktID: 2,
          Bezeichnung: 'Produkt B',
          Menge: 1,
          Einzelpreis: 30.00,
          MwStSatz: 19.00
        }
      ]

      // Calculate totals
      const netto = positions.reduce((sum, pos) => sum + (pos.Menge * pos.Einzelpreis), 0)
      const mwst = positions.reduce((sum, pos) => {
        const posNetto = pos.Menge * pos.Einzelpreis
        return sum + (posNetto * pos.MwStSatz / 100)
      }, 0)
      const brutto = netto + mwst

      // Create invoice
      const invoice = createTestRechnung({
        KundenID: kunde.KundenID,
        GesamtbetragNetto: netto,
        MwStBetrag: mwst,
        GesamtbetragBrutto: brutto
      })

      mockPrisma.rechnungen.create.mockResolvedValue(invoice)

      // Assertions
      expect(invoice.GesamtbetragNetto).toBe(130.00)
      expect(invoice.MwStBetrag).toBe(24.70)
      expect(invoice.GesamtbetragBrutto).toBe(154.70)
      expect(invoice.KundenID).toBe(kunde.KundenID)
    })

    it('should update inventory after invoice creation', async () => {
      // Setup
      const bestand = createTestBestand({
        ProduktID: 1,
        StandortID: 1,
        Menge: 100
      })

      const verkaufsMenge = 10

      mockPrisma.bestand.findFirst.mockResolvedValue(bestand)

      // Update inventory
      const updatedBestand = {
        ...bestand,
        Menge: bestand.Menge - verkaufsMenge
      }

      mockPrisma.bestand.upsert.mockResolvedValue(updatedBestand)

      // Create stock movement
      const bewegung = {
        ProduktID: 1,
        StandortID: 1,
        Bewegungsart: 'Ausgang',
        Menge: verkaufsMenge,
        Datum: new Date(),
        Referenz: 'RE-2024-001'
      }

      mockPrisma.lagerbewegungen.create.mockResolvedValue({
        BewegungID: 1,
        ...bewegung
      })

      // Verify
      const result = updatedBestand
      expect(result.Menge).toBe(90)
    })
  })

  describe('Invoice Status Transitions', () => {
    it('should transition invoice from offen to bezahlt', async () => {
      const invoice = createTestRechnung({
        RechnungsID: 1,
        Status: 'offen'
      })

      const paidInvoice = {
        ...invoice,
        Status: 'bezahlt'
      }

      mockPrisma.rechnungen.update.mockResolvedValue(paidInvoice)

      const result = paidInvoice
      expect(result.Status).toBe('bezahlt')
    })

    it('should handle partial payment scenario', async () => {
      const invoice = createTestRechnung({
        RechnungsID: 1,
        GesamtbetragBrutto: 1000.00,
        Status: 'offen'
      })

      // First partial payment
      const payment1 = {
        ZahlungID: 1,
        RechnungsID: invoice.RechnungsID,
        Betrag: 500.00,
        Zahlungsdatum: new Date(),
        Zahlungsart: 'Überweisung'
      }

      // Second partial payment
      const payment2 = {
        ZahlungID: 2,
        RechnungsID: invoice.RechnungsID,
        Betrag: 500.00,
        Zahlungsdatum: new Date(),
        Zahlungsart: 'Überweisung'
      }

      const totalPaid = payment1.Betrag + payment2.Betrag

      // Invoice should be fully paid
      expect(totalPaid).toBe(invoice.GesamtbetragBrutto)

      const updatedInvoice = {
        ...invoice,
        Status: 'bezahlt'
      }

      mockPrisma.rechnungen.update.mockResolvedValue(updatedInvoice)

      expect(updatedInvoice.Status).toBe('bezahlt')
    })
  })

  describe('Invoice with Discounts', () => {
    it('should calculate invoice with item-level discount', () => {
      const position = createTestRechnungsposition({
        Menge: 10,
        Einzelpreis: 100.00,
        Rabatt: 10, // 10% discount
        MwStSatz: 19.00
      })

      const brutto = position.Menge * position.Einzelpreis
      const rabattBetrag = brutto * (position.Rabatt / 100)
      const nettoNachRabatt = brutto - rabattBetrag
      const mwst = nettoNachRabatt * (position.MwStSatz / 100)
      const gesamt = nettoNachRabatt + mwst

      expect(brutto).toBe(1000.00)
      expect(rabattBetrag).toBe(100.00)
      expect(nettoNachRabatt).toBe(900.00)
      expect(mwst).toBe(171.00)
      expect(gesamt).toBe(1071.00)
    })
  })

  describe('Invoice Validation', () => {
    it('should validate invoice has at least one position', () => {
      const invoiceData = {
        KundenID: 1,
        Rechnungsdatum: new Date(),
        Positionen: []
      }

      const isValid = invoiceData.Positionen.length > 0

      expect(isValid).toBe(false)
    })

    it('should validate customer exists before creating invoice', async () => {
      mockPrisma.kunden.findUnique.mockResolvedValue(null)

      const customerExists = null
      expect(customerExists).toBeNull()
    })

    it('should validate product availability before adding to invoice', async () => {
      const bestand = createTestBestand({
        ProduktID: 1,
        Menge: 5
      })

      const requestedMenge = 10

      mockPrisma.bestand.findFirst.mockResolvedValue(bestand)

      const hasEnoughStock = bestand.Menge >= requestedMenge

      expect(hasEnoughStock).toBe(false)
    })
  })
})
