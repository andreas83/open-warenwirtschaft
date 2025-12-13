import prisma from '~/lib/prisma'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const id = parseInt(query.id as string)

  try {
    // Check if category has rooms
    const roomCount = await prisma.zimmer.count({
      where: { ZimmerkategorieID: id }
    })

    if (roomCount > 0) {
      throw createError({
        statusCode: 400,
        message: 'Zimmerkategorie kann nicht gelöscht werden, da noch Zimmer zugeordnet sind'
      })
    }

    await prisma.zimmerkategorien.delete({
      where: { ZimmerkategorieID: id }
    })

    return { success: true }
  } catch (error: any) {
    console.error('Error deleting room category:', error)
    throw createError({
      statusCode: error.statusCode || 500,
      message: error.message || 'Fehler beim Löschen der Zimmerkategorie'
    })
  }
})
