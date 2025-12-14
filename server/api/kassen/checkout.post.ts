import prisma from '../../../lib/prisma'

interface CheckoutItem {
  ProduktID: number
  Menge: number
  EinzelpreisBrutto: number
  MwSt_Satz: number
}

interface CheckoutBody {
  KassenID: number
  items: CheckoutItem[]
  Zahlungsart: string
  GegebenBetrag?: number
  KundenID?: number
  BenutzerID?: number
  Beschreibung?: string
}

// Map frontend payment methods to Kassenbuchungen enum values
function mapKassenbuchungenZahlungsart(method: string): string {
  const mapping: Record<string, string> = {
    'Bar': 'Bar',
    'EC-Karte': 'EC_Karte',
    'Kreditkarte': 'Kreditkarte',
    'Gutschein': 'Gutschein'
  }
  return mapping[method] || 'Sonstige'
}

// Map frontend payment methods to Zahlungen enum values
function mapZahlungenZahlungsart(method: string): string {
  const mapping: Record<string, string> = {
    'Bar': 'Bar',
    'EC-Karte': 'Kreditkarte', // Zahlungen doesn't have EC-Karte
    'Kreditkarte': 'Kreditkarte',
    'Gutschein': 'Gutschein',
    'PayPal': 'PayPal',
    'Überweisung': 'Bank_berweisung'
  }
  return mapping[method] || 'Bar'
}

export default defineEventHandler(async (event) => {
  try {
    const body: CheckoutBody = await readBody(event)

    if (!body.KassenID) {
      return { success: false, message: 'KassenID ist erforderlich' }
    }

    if (!body.items || body.items.length === 0) {
      return { success: false, message: 'Keine Produkte im Warenkorb' }
    }

    // Calculate totals
    let gesamtBrutto = 0
    let gesamtNetto = 0
    let gesamtMwst = 0

    const rechnungspositionen = body.items.map((item) => {
      const brutto = item.EinzelpreisBrutto * item.Menge
      const mwstFaktor = 1 + (item.MwSt_Satz / 100)
      const netto = brutto / mwstFaktor
      const mwstBetrag = brutto - netto

      gesamtBrutto += brutto
      gesamtNetto += netto
      gesamtMwst += mwstBetrag

      return {
        ProduktID: item.ProduktID,
        Menge: item.Menge,
        EinzelpreisNetto: parseFloat((item.EinzelpreisBrutto / mwstFaktor).toFixed(2)),
        RabattProzentPosition: 0,
        RabattBetragPosition: 0,
        GesamtpreisNettoPosition: parseFloat(netto.toFixed(2)),
        MwSt_Satz: item.MwSt_Satz,
        MwSt_Betrag: parseFloat(mwstBetrag.toFixed(2)),
        Beschreibung: ''
      }
    })

    // Execute transaction
    const result = await prisma.$transaction(async (tx) => {
      // 1. Get cash register
      const kasse = await tx.kassen.findUnique({
        where: { KassenID: body.KassenID }
      })

      if (!kasse) {
        throw new Error('Kasse nicht gefunden')
      }

      // 2. Generate invoice number
      const today = new Date()
      const datePrefix = `${today.getFullYear()}${String(today.getMonth() + 1).padStart(2, '0')}${String(today.getDate()).padStart(2, '0')}`

      // Count today's invoices for sequential numbering
      const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate())
      const todayEnd = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1)

      const invoiceCount = await tx.rechnungen.count({
        where: {
          Erstelldatum: {
            gte: todayStart,
            lt: todayEnd
          }
        }
      })

      const rechnungsnummer = `POS-${datePrefix}-${String(invoiceCount + 1).padStart(4, '0')}`

      // 3. Get or create a default POS customer if no customer is specified
      let kundenId = body.KundenID

      if (!kundenId) {
        // Find or create default POS customer
        let posKunde = await tx.kunden.findFirst({
          where: { Email: 'pos@kasse.local' }
        })

        if (!posKunde) {
          // Generate unique customer number
          const kundenCount = await tx.kunden.count()
          const kundennummer = `POS-${String(kundenCount + 1).padStart(6, '0')}`

          posKunde = await tx.kunden.create({
            data: {
              Kundennummer: kundennummer,
              Vorname: 'Barkunde',
              Nachname: 'POS',
              Email: 'pos@kasse.local',
              Adresse: 'Barverkauf',
              PLZ: '00000',
              Ort: 'Barverkauf',
              Land: 'Deutschland',
              Kundenstatus: 'Aktiv'
            }
          })
        }

        kundenId = posKunde.KundenID
      }

      // 4. Create invoice
      const rechnung = await tx.rechnungen.create({
        data: {
          KundenID: kundenId,
          Rechnungsnummer: rechnungsnummer,
          Rechnungsdatum: today,
          Faelligkeitsdatum: today, // POS invoices are paid immediately
          Zahlungsstatus: 'Bezahlt',
          GesamtbetragNetto: parseFloat(gesamtNetto.toFixed(2)),
          MwSt_Gesamt: parseFloat(gesamtMwst.toFixed(2)),
          GesamtrabattBetrag: 0,
          GesamtbetragBrutto: parseFloat(gesamtBrutto.toFixed(2)),
          Waehrung: kasse.Waehrung || 'EUR',
          Kommentare: `POS-Verkauf an Kasse ${kasse.Kassenbezeichnung}`,
          Rechnungspositionen: {
            create: rechnungspositionen
          }
        },
        include: {
          Rechnungspositionen: true
        }
      })

      // 5. Create cash register booking
      const mappedKassenbuchungZahlungsart = mapKassenbuchungenZahlungsart(body.Zahlungsart)
      await tx.kassenbuchungen.create({
        data: {
          KassenID: body.KassenID,
          RechnungsID: rechnung.RechnungsID,
          KundenID: kundenId,
          Buchungsdatum: new Date(),
          Buchungstyp: 'Einnahme',
          Betrag: parseFloat(gesamtBrutto.toFixed(2)),
          Zahlungsart: mappedKassenbuchungZahlungsart as any,
          Beschreibung: body.Beschreibung || `POS-Verkauf ${rechnungsnummer}`,
          Belegnummer: rechnungsnummer
        }
      })

      // 6. Update cash register balance
      const neuerBestand = parseFloat(kasse.AktuellerBestand.toString()) + gesamtBrutto

      await tx.kassen.update({
        where: { KassenID: body.KassenID },
        data: {
          AktuellerBestand: parseFloat(neuerBestand.toFixed(2)),
          LetzteAenderung: new Date()
        }
      })

      // 7. Update inventory (reduce stock)
      for (const item of body.items) {
        // Find existing stock at the location of the cash register
        const bestand = await tx.bestand.findFirst({
          where: {
            ProduktID: item.ProduktID,
            StandortID: kasse.StandortID || undefined
          }
        })

        if (bestand) {
          const neueMenge = Math.max(0, Number(bestand.Menge) - item.Menge)
          await tx.bestand.update({
            where: { BestandID: bestand.BestandID },
            data: {
              Menge: neueMenge,
              LetzteAenderung: new Date()
            }
          })

          // Create inventory movement record - requires a user ID
          // Skip if no user context available (POS anonymous sales)
          try {
            // Only create movement if we have a user context
            if (body.BenutzerID) {
              await tx.lagerbewegungen.create({
                data: {
                  BestandID: bestand.BestandID,
                  BenutzerID: body.BenutzerID,
                  Bewegungstyp: 'Ausgang',
                  Menge: item.Menge,
                  Bewegungsdatum: new Date(),
                  ReferenzDokumentID: rechnung.RechnungsID,
                  ReferenzDokumentTyp: 'Rechnung',
                  Kommentare: `POS-Verkauf ${rechnungsnummer}`
                }
              })
            }
          } catch {
            // Lagerbewegungen might not exist in all schemas
          }
        }
      }

      // 8. Create payment record
      const mappedZahlungZahlungsart = mapZahlungenZahlungsart(body.Zahlungsart)
      await tx.zahlungen.create({
        data: {
          RechnungsID: rechnung.RechnungsID,
          Zahlungsdatum: new Date(),
          Betrag: parseFloat(gesamtBrutto.toFixed(2)),
          Zahlungsart: mappedZahlungZahlungsart as any,
          Waehrung: kasse.Waehrung || 'EUR',
          Kommentare: `POS-Zahlung an Kasse ${kasse.Kassenbezeichnung}`
        }
      })

      return {
        rechnung,
        neuerKassenbestand: neuerBestand
      }
    })

    return {
      success: true,
      rechnungsId: result.rechnung.RechnungsID,
      rechnungsnummer: result.rechnung.Rechnungsnummer,
      gesamtBrutto: parseFloat(gesamtBrutto.toFixed(2)),
      neuerKassenbestand: result.neuerKassenbestand
    }
  } catch (error: any) {
    console.error('Checkout error:', error)
    return {
      success: false,
      message: error.message || 'Fehler beim Checkout'
    }
  }
})
