import prisma from '~/lib/prisma'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const id = parseInt(query.id as string)

  try {
    // Check booking status
    const booking = await prisma.hotelBuchungen.findUnique({
      where: { BuchungsID: id },
      select: { Status: true, RechnungsID: true }
    })

    if (!booking) {
      throw createError({ statusCode: 404, message: 'Buchung nicht gefunden' })
    }

    if (booking.Status === 'Eingecheckt') {
      throw createError({
        statusCode: 400,
        message: 'Eingecheckte Buchungen können nicht gelöscht werden. Bitte zuerst auschecken oder stornieren.'
      })
    }

    if (booking.RechnungsID) {
      throw createError({
        statusCode: 400,
        message: 'Buchung kann nicht gelöscht werden, da bereits eine Rechnung erstellt wurde'
      })
    }

    // Delete booking (cascade will delete related records)
    await prisma.hotelBuchungen.delete({
      where: { BuchungsID: id }
    })

    return { success: true }
  } catch (error: any) {
    console.error('Error deleting booking:', error)
    throw createError({
      statusCode: error.statusCode || 500,
      message: error.message || 'Fehler beim Löschen der Buchung'
    })
  }
})
