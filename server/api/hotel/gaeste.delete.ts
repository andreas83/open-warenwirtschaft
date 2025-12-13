import prisma from '~/lib/prisma'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const id = parseInt(query.id as string)

  try {
    await prisma.hotelGaeste.delete({
      where: { GastID: id }
    })

    return { success: true }
  } catch (error: any) {
    console.error('Error deleting guest:', error)
    throw createError({
      statusCode: error.statusCode || 500,
      message: error.message || 'Fehler beim Löschen des Gastes'
    })
  }
})
