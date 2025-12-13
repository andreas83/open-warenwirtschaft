import prisma from '~/lib/prisma'

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    const id = body.RestaurantBestellID || parseInt(getQuery(event).id as string)

    if (!id) {
      throw createError({ statusCode: 400, message: 'Bestellungs-ID ist erforderlich' })
    }

    // Calculate totals if positions are provided
    let totals: any = {}
    if (body.calculateTotals) {
      const positions = await prisma.restaurantBestellpositionen.findMany({
        where: { RestaurantBestellID: id }
      })

      const gesamtbetragNetto = positions.reduce((sum, pos) => sum + parseFloat(pos.GesamtpreisNetto.toString()), 0)
      const mwStGesamt = positions.reduce((sum, pos) => sum + parseFloat(pos.MwStBetrag.toString()), 0)
      const gesamtbetragBrutto = gesamtbetragNetto + mwStGesamt

      totals = {
        GesamtbetragNetto: gesamtbetragNetto,
        MwStGesamt: mwStGesamt,
        GesamtbetragBrutto: gesamtbetragBrutto
      }
    }

    const order = await prisma.restaurantBestellungen.update({
      where: { RestaurantBestellID: id },
      data: {
        Status: body.Status,
        PersonenAnzahl: body.PersonenAnzahl,
        Notizen: body.Notizen,
        Trinkgeld: body.Trinkgeld,
        Zahlungsart: body.Zahlungsart,
        RechnungsID: body.RechnungsID,
        AbgeschlossenAm: body.Status === 'Abgeschlossen' ? new Date() : null,
        LetzteAenderung: new Date(),
        ...totals
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

    // Update table status if order is completed
    if (body.Status === 'Abgeschlossen') {
      // Check if table has other active orders
      const activeOrders = await prisma.restaurantBestellungen.count({
        where: {
          TischID: order.TischID,
          Status: {
            notIn: ['Abgeschlossen', 'Storniert']
          },
          RestaurantBestellID: {
            not: id
          }
        }
      })

      if (activeOrders === 0) {
        await prisma.restaurantTische.update({
          where: { TischID: order.TischID },
          data: { Status: 'Verfuegbar' }
        })
      }
    }

    return order
  } catch (error: any) {
    console.error('Error updating order:', error)
    throw createError({
      statusCode: error.statusCode || 500,
      message: error.message || 'Fehler beim Aktualisieren der Bestellung'
    })
  }
})
