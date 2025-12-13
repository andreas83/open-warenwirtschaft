import prisma from '~/lib/prisma'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const id = parseInt(query.id as string)

  try {
    await prisma.hotelZusatzleistungen.delete({
      where: { ZusatzleistungID: id }
    })

    return { success: true }
  } catch (error: any) {
    console.error('Error deleting additional service:', error)
    throw createError({
      statusCode: error.statusCode || 500,
      message: error.message || 'Fehler beim Löschen der Zusatzleistung'
    })
  }
})
