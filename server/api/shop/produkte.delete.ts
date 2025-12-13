import prisma from '~/lib/prisma'

export default defineEventHandler(async (event) => {
  try {
    const query = getQuery(event)
    const id = query.id ? parseInt(query.id as string) : null

    if (!id) {
      throw createError({ statusCode: 400, message: 'ID ist erforderlich' })
    }

    await prisma.shopProdukte.delete({
      where: { ShopProduktID: id }
    })

    return { success: true, message: 'Shop-Produkt erfolgreich gelöscht' }
  } catch (error: any) {
    console.error('Error deleting shop product:', error)
    throw createError({
      statusCode: error.statusCode || 500,
      message: error.message || 'Fehler beim Löschen des Shop-Produkts'
    })
  }
})
