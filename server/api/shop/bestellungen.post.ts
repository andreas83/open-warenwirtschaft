import prisma from '~/lib/prisma'

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)

    // Generate order number if not provided
    const bestellnummer = body.Bestellnummer || `SHP-${Date.now()}`

    const order = await prisma.shopBestellungen.create({
      data: {
        KundenID: body.KundenID,
        Bestellnummer: bestellnummer,
        Status: body.Status || 'Neu',
        Zahlungsstatus: body.Zahlungsstatus || 'Ausstehend',
        Versandstatus: body.Versandstatus || 'NichtVersendet',
        Zahlungsart: body.Zahlungsart || null,
        Versandart: body.Versandart || null,

        // Billing Information
        RechnungsVorname: body.RechnungsVorname,
        RechnungsNachname: body.RechnungsNachname,
        RechnungsFirma: body.RechnungsFirma || null,
        RechnungsAdresse: body.RechnungsAdresse,
        RechnungsPLZ: body.RechnungsPLZ,
        RechnungsOrt: body.RechnungsOrt,
        RechnungsLand: body.RechnungsLand,
        RechnungsTelefon: body.RechnungsTelefon || null,
        RechnungsEmail: body.RechnungsEmail,

        // Shipping Information
        LieferungVorname: body.LieferungVorname,
        LieferungNachname: body.LieferungNachname,
        LieferungFirma: body.LieferungFirma || null,
        LieferungAdresse: body.LieferungAdresse,
        LieferungPLZ: body.LieferungPLZ,
        LieferungOrt: body.LieferungOrt,
        LieferungLand: body.LieferungLand,
        LieferungTelefon: body.LieferungTelefon || null,

        // Pricing
        ZwischensummeNetto: body.ZwischensummeNetto,
        Versandkosten: body.Versandkosten || 0,
        RabattBetrag: body.RabattBetrag || 0,
        RabattCode: body.RabattCode || null,
        MwStGesamt: body.MwStGesamt,
        GesamtsummeBrutto: body.GesamtsummeBrutto,
        Waehrung: body.Waehrung || 'EUR',

        // Additional Information
        KundenNotizen: body.KundenNotizen || null,
        InterneNotizen: body.InterneNotizen || null,
        IPAdresse: body.IPAdresse || null,
        UserAgent: body.UserAgent || null
      },
      include: {
        Kunden: true
      }
    })

    // Create order items if provided
    if (body.ShopBestellpositionen && body.ShopBestellpositionen.length > 0) {
      await Promise.all(
        body.ShopBestellpositionen.map((item: any) =>
          prisma.shopBestellpositionen.create({
            data: {
              ShopBestellID: order.ShopBestellID,
              ShopProduktID: item.ShopProduktID,
              Produktname: item.Produktname,
              SKU: item.SKU || null,
              Menge: item.Menge,
              EinzelpreisNetto: item.EinzelpreisNetto,
              GesamtpreisNetto: item.GesamtpreisNetto,
              MwStSatz: item.MwStSatz,
              MwStBetrag: item.MwStBetrag,
              AttributeJSON: item.AttributeJSON ? JSON.stringify(item.AttributeJSON) : null
            }
          })
        )
      )
    }

    // Fetch complete order with items
    const completeOrder = await prisma.shopBestellungen.findUnique({
      where: { ShopBestellID: order.ShopBestellID },
      include: {
        Kunden: true,
        ShopBestellpositionen: {
          include: {
            ShopProdukte: true
          }
        }
      }
    })

    return completeOrder
  } catch (error: any) {
    console.error('Error creating shop order:', error)
    throw createError({
      statusCode: 500,
      message: error.message || 'Fehler beim Erstellen der Shop-Bestellung'
    })
  }
})
