import prisma from '~/lib/prisma'

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)

    // Check if table is available at the requested time
    const reservierungsdatum = new Date(body.Reservierungsdatum)
    const dauer = body.Dauer || 120
    const endzeit = new Date(reservierungsdatum.getTime() + dauer * 60000)

    const conflictingReservations = await prisma.reservierungen.findMany({
      where: {
        TischID: body.TischID,
        Status: {
          in: ['Bestaetigt', 'Eingecheckt']
        },
        Reservierungsdatum: {
          lt: endzeit
        },
        AND: {
          Reservierungsdatum: {
            gte: new Date(reservierungsdatum.getTime() - 120 * 60000) // Default 2 hours before
          }
        }
      }
    })

    if (conflictingReservations.length > 0) {
      throw createError({
        statusCode: 409,
        message: 'Tisch ist zur gewünschten Zeit bereits reserviert'
      })
    }

    const reservation = await prisma.reservierungen.create({
      data: {
        TischID: body.TischID,
        KundenID: body.KundenID || null,
        Gastname: body.Gastname,
        Telefon: body.Telefon || null,
        Email: body.Email || null,
        PersonenAnzahl: body.PersonenAnzahl,
        Reservierungsdatum: reservierungsdatum,
        Dauer: dauer,
        Status: body.Status || 'Bestaetigt',
        Notizen: body.Notizen || null,
        ErfasstVonBenutzerID: body.ErfasstVonBenutzerID || null
      },
      include: {
        RestaurantTische: {
          include: {
            Tischbereiche: true
          }
        },
        Kunden: true
      }
    })

    // Update table status to Reserviert if reservation is confirmed
    if (reservation.Status === 'Bestaetigt') {
      await prisma.restaurantTische.update({
        where: { TischID: body.TischID },
        data: { Status: 'Reserviert' }
      })
    }

    return reservation
  } catch (error: any) {
    console.error('Error creating reservation:', error)
    throw createError({
      statusCode: error.statusCode || 500,
      message: error.message || 'Fehler beim Erstellen der Reservierung'
    })
  }
})
