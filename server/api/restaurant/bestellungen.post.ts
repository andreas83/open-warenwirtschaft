import prisma from '~/lib/prisma'

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)

    // Support both camelCase and PascalCase field names
    const tischId = body.tischId || body.TischID
    const kundenId = body.kundenId || body.KundenID || null
    const benutzerId = body.benutzerId || body.BenutzerID || null
    const personenAnzahl = body.personenAnzahl || body.PersonenAnzahl || 1
    const notizen = body.notizen || body.Notizen || null
    const status = body.status || body.Status || 'Offen'
    const gesamtbetragNetto = body.gesamtbetragNetto || body.GesamtbetragNetto || 0
    const gesamtbetragBrutto = body.gesamtbetragBrutto || body.GesamtbetragBrutto || 0
    const mwStGesamt = body.mwStGesamt || body.MwStGesamt || 0
    const positionen = body.positionen || body.Positionen || []

    // Validate TischID is provided
    if (!tischId) {
      throw createError({
        statusCode: 400,
        message: 'Tisch ist erforderlich'
      })
    }

    // Generate order number
    const count = await prisma.restaurantBestellungen.count()
    const bestellnummer = `RB-${new Date().getFullYear()}-${String(count + 1).padStart(6, '0')}`

    const order = await prisma.restaurantBestellungen.create({
      data: {
        TischID: tischId,
        KundenID: kundenId,
        BenutzerID: benutzerId,
        Bestellnummer: bestellnummer,
        PersonenAnzahl: personenAnzahl,
        Status: status,
        Notizen: notizen,
        GesamtbetragNetto: gesamtbetragNetto,
        GesamtbetragBrutto: gesamtbetragBrutto,
        MwStGesamt: mwStGesamt,
        RestaurantBestellpositionen: positionen.length > 0 ? {
          create: positionen.map((p: any, index: number) => ({
            ProduktID: p.produktId || p.ProduktID,
            Menge: p.menge || p.Menge || 1,
            EinzelpreisNetto: p.einzelpreisNetto || p.EinzelpreisNetto || 0,
            GesamtpreisNetto: (p.einzelpreisNetto || p.EinzelpreisNetto || 0) * (p.menge || p.Menge || 1),
            MwStSatz: p.mwStSatz || p.MwStSatz || 19,
            MwStBetrag: ((p.einzelpreisNetto || p.EinzelpreisNetto || 0) * (p.menge || p.Menge || 1) * (p.mwStSatz || p.MwStSatz || 19)) / 100,
            Status: 'Bestellt',
            Notizen: p.notizen || p.Notizen || null
          }))
        } : undefined
      },
      include: {
        RestaurantTische: {
          include: {
            Tischbereiche: true
          }
        },
        Kunden: true,
        RestaurantBestellpositionen: {
          include: {
            Produkte: true
          }
        }
      }
    })

    // Update table status to Besetzt
    await prisma.restaurantTische.update({
      where: { TischID: tischId },
      data: { Status: 'Besetzt' }
    })

    return order
  } catch (error: any) {
    console.error('Error creating order:', error)
    throw createError({
      statusCode: error.statusCode || 500,
      message: error.message || 'Fehler beim Erstellen der Bestellung'
    })
  }
})
