import prisma from '~/lib/prisma'

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)

    // Get product with price information
    const product = await prisma.produkte.findUnique({
      where: { ProduktID: body.ProduktID },
      include: {
        Preise: {
          where: {
            GueltigAb: {
              lte: new Date()
            },
            OR: [
              { GueltigBis: null },
              { GueltigBis: { gte: new Date() } }
            ]
          },
          orderBy: {
            GueltigAb: 'desc'
          },
          take: 1
        },
        Umsatzsteuersaetze: true
      }
    })

    if (!product) {
      throw createError({ statusCode: 404, message: 'Produkt nicht gefunden' })
    }

    const price = product.Preise[0]
    if (!price) {
      throw createError({ statusCode: 400, message: 'Kein gültiger Preis für das Produkt gefunden' })
    }

    const einzelpreisNetto = parseFloat(price.Preis.toString())
    const menge = body.Menge || 1
    const gesamtpreisNetto = einzelpreisNetto * menge
    const mwStSatz = parseFloat(product.Umsatzsteuersaetze.Steuersatz.toString())
    const mwStBetrag = gesamtpreisNetto * (mwStSatz / 100)

    const position = await prisma.restaurantBestellpositionen.create({
      data: {
        RestaurantBestellID: body.RestaurantBestellID,
        ProduktID: body.ProduktID,
        Menge: menge,
        EinzelpreisNetto: einzelpreisNetto,
        GesamtpreisNetto: gesamtpreisNetto,
        MwStSatz: mwStSatz,
        MwStBetrag: mwStBetrag,
        Status: body.Status || 'Bestellt',
        Notizen: body.Notizen || null,
        KuecheNotizen: body.KuecheNotizen || null
      },
      include: {
        Produkte: {
          include: {
            Einheiten: true
          }
        }
      }
    })

    // Update order totals
    const positions = await prisma.restaurantBestellpositionen.findMany({
      where: { RestaurantBestellID: body.RestaurantBestellID }
    })

    const gesamtbetragNetto = positions.reduce((sum, pos) => sum + parseFloat(pos.GesamtpreisNetto.toString()), 0)
    const mwStGesamt = positions.reduce((sum, pos) => sum + parseFloat(pos.MwStBetrag.toString()), 0)
    const gesamtbetragBrutto = gesamtbetragNetto + mwStGesamt

    await prisma.restaurantBestellungen.update({
      where: { RestaurantBestellID: body.RestaurantBestellID },
      data: {
        GesamtbetragNetto: gesamtbetragNetto,
        MwStGesamt: mwStGesamt,
        GesamtbetragBrutto: gesamtbetragBrutto,
        LetzteAenderung: new Date()
      }
    })

    return position
  } catch (error: any) {
    console.error('Error creating order position:', error)
    throw createError({
      statusCode: error.statusCode || 500,
      message: error.message || 'Fehler beim Erstellen der Bestellposition'
    })
  }
})
