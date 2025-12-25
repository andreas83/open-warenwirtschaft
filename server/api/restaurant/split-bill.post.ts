import prisma from '~/lib/prisma'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { RestaurantBestellID, Anzahl, Aufteilung } = body

  if (!RestaurantBestellID || !Anzahl) {
    throw createError({
      statusCode: 400,
      statusMessage: 'RestaurantBestellID und Anzahl sind erforderlich'
    })
  }

  // Get the order with positions
  const bestellung = await prisma.restaurantBestellungen.findUnique({
    where: { RestaurantBestellID },
    include: {
      RestaurantBestellpositionen: true
    }
  })

  if (!bestellung) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Bestellung nicht gefunden'
    })
  }

  // Create split bill record
  const aufteilung = await prisma.rechnungsAufteilung.create({
    data: {
      RestaurantBestellID,
      Anzahl
    }
  })

  // Create sub-bills
  const teilrechnungen = []

  if (Aufteilung && Array.isArray(Aufteilung)) {
    // Custom split with specific items per bill
    for (let i = 0; i < Aufteilung.length; i++) {
      const items = Aufteilung[i]
      let netto = 0
      let mwst = 0

      // Calculate totals for this sub-bill
      for (const positionId of items) {
        const position = bestellung.RestaurantBestellpositionen.find(p => p.PositionID === positionId)
        if (position) {
          netto += parseFloat(position.GesamtpreisNetto.toString())
          mwst += parseFloat(position.MwStBetrag.toString())
        }
      }

      const teilrechnung = await prisma.teilrechnung.create({
        data: {
          AufteilungID: aufteilung.AufteilungID,
          Nummer: i + 1,
          BetragNetto: netto,
          BetragBrutto: netto + mwst,
          MwStBetrag: mwst
        }
      })

      // Link positions to sub-bill
      for (const positionId of items) {
        await prisma.teilrechnungPosition.create({
          data: {
            TeilrechnungID: teilrechnung.TeilrechnungID,
            PositionID: positionId
          }
        })
      }

      teilrechnungen.push(teilrechnung)
    }
  } else {
    // Equal split
    const betragProPerson = parseFloat(bestellung.GesamtbetragBrutto.toString()) / Anzahl
    const nettoProPerson = parseFloat(bestellung.GesamtbetragNetto.toString()) / Anzahl
    const mwstProPerson = parseFloat(bestellung.MwStGesamt.toString()) / Anzahl

    for (let i = 0; i < Anzahl; i++) {
      const teilrechnung = await prisma.teilrechnung.create({
        data: {
          AufteilungID: aufteilung.AufteilungID,
          Nummer: i + 1,
          BetragNetto: nettoProPerson,
          BetragBrutto: betragProPerson,
          MwStBetrag: mwstProPerson
        }
      })

      teilrechnungen.push(teilrechnung)
    }
  }

  return {
    aufteilung,
    teilrechnungen
  }
})
