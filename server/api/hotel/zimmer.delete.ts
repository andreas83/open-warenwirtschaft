import prisma from '~/lib/prisma'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const id = parseInt(query.id as string)

  try {
    // Check if room has active bookings
    const activeBookingsCount = await prisma.hotelBuchungszimmer.count({
      where: {
        ZimmerID: id,
        HotelBuchungen: {
          Status: {
            notIn: ['Abgeschlossen', 'Storniert']
          }
        }
      }
    })

    if (activeBookingsCount > 0) {
      throw createError({
        statusCode: 400,
        message: 'Zimmer kann nicht gelöscht werden, da noch aktive Buchungen vorhanden sind'
      })
    }

    await prisma.zimmer.delete({
      where: { ZimmerID: id }
    })

    return { success: true }
  } catch (error: any) {
    console.error('Error deleting room:', error)
    throw createError({
      statusCode: error.statusCode || 500,
      message: error.message || 'Fehler beim Löschen des Zimmers'
    })
  }
})
