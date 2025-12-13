import prisma from '~/lib/prisma'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)

  try {
    const booking = await prisma.hotelBuchungen.update({
      where: { BuchungsID: body.id },
      data: {
        KundenID: body.kundenID,
        Gastname: body.gastname,
        Email: body.email,
        Telefon: body.telefon,
        CheckInDatum: body.checkInDatum ? new Date(body.checkInDatum) : undefined,
        CheckOutDatum: body.checkOutDatum ? new Date(body.checkOutDatum) : undefined,
        AnzahlErwachsene: body.anzahlErwachsene,
        AnzahlKinder: body.anzahlKinder,
        Status: body.status,
        GesamtpreisNetto: body.gesamtpreisNetto,
        GesamtpreisBrutto: body.gesamtpreisBrutto,
        MwStGesamt: body.mwStGesamt,
        Anzahlung: body.anzahlung,
        RechnungsID: body.rechnungsID,
        Zahlungsart: body.zahlungsart,
        Zahlungsstatus: body.zahlungsstatus,
        BesondereWuensche: body.besondereWuensche,
        InterneNotizen: body.interneNotizen,
        CheckInZeit: body.checkInZeit ? new Date(body.checkInZeit) : undefined,
        CheckOutZeit: body.checkOutZeit ? new Date(body.checkOutZeit) : undefined
      },
      include: {
        HotelBuchungszimmer: {
          include: {
            Zimmer: {
              include: {
                Zimmerkategorien: true
              }
            }
          }
        },
        HotelGaeste: true,
        HotelZusatzleistungen: true
      }
    })

    return booking
  } catch (error: any) {
    console.error('Error updating booking:', error)
    throw createError({
      statusCode: 500,
      message: error.message || 'Fehler beim Aktualisieren der Buchung'
    })
  }
})
