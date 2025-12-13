import prisma from '~/lib/prisma'

export default defineEventHandler(async (event) => {
  try {
    const query = getQuery(event)
    const id = parseInt(query.id as string)

    if (!id) {
      throw createError({ statusCode: 400, message: 'Reservierungs-ID ist erforderlich' })
    }

    const reservation = await prisma.reservierungen.findUnique({
      where: { ReservierungsID: id }
    })

    if (!reservation) {
      throw createError({ statusCode: 404, message: 'Reservierung nicht gefunden' })
    }

    const deletedReservation = await prisma.reservierungen.delete({
      where: { ReservierungsID: id }
    })

    // Check if table has other active reservations, if not, update status to Verfuegbar
    const activeReservations = await prisma.reservierungen.count({
      where: {
        TischID: reservation.TischID,
        Status: {
          in: ['Bestaetigt', 'Eingecheckt']
        }
      }
    })

    if (activeReservations === 0) {
      await prisma.restaurantTische.update({
        where: { TischID: reservation.TischID },
        data: { Status: 'Verfuegbar' }
      })
    }

    return deletedReservation
  } catch (error: any) {
    console.error('Error deleting reservation:', error)
    throw createError({
      statusCode: error.statusCode || 500,
      message: error.message || 'Fehler beim Löschen der Reservierung'
    })
  }
})
