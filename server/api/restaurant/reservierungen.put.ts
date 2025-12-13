import prisma from '~/lib/prisma'

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    const id = body.ReservierungsID || parseInt(getQuery(event).id as string)

    if (!id) {
      throw createError({ statusCode: 400, message: 'Reservierungs-ID ist erforderlich' })
    }

    const reservation = await prisma.reservierungen.update({
      where: { ReservierungsID: id },
      data: {
        TischID: body.TischID,
        KundenID: body.KundenID || null,
        Gastname: body.Gastname,
        Telefon: body.Telefon || null,
        Email: body.Email || null,
        PersonenAnzahl: body.PersonenAnzahl,
        Reservierungsdatum: body.Reservierungsdatum ? new Date(body.Reservierungsdatum) : undefined,
        Dauer: body.Dauer,
        Status: body.Status,
        Notizen: body.Notizen || null,
        LetzteAenderung: new Date()
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

    return reservation
  } catch (error: any) {
    console.error('Error updating reservation:', error)
    throw createError({
      statusCode: error.statusCode || 500,
      message: error.message || 'Fehler beim Aktualisieren der Reservierung'
    })
  }
})
