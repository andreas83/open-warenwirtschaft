import prisma from '~/lib/prisma'

export default defineEventHandler(async (event) => {
  try {
    const query = getQuery(event)
    const id = query.id ? parseInt(query.id as string) : null

    if (!id) {
      throw createError({ statusCode: 400, message: 'ID ist erforderlich' })
    }

    // Check if category has products or subcategories
    const category = await prisma.shopKategorien.findUnique({
      where: { ShopKategorieID: id },
      include: {
        _count: {
          select: {
            ShopProdukte: true,
            other_ShopKategorien: true
          }
        }
      }
    })

    if (category && (category._count.ShopProdukte > 0 || category._count.other_ShopKategorien > 0)) {
      throw createError({
        statusCode: 400,
        message: 'Kategorie kann nicht gelöscht werden, da sie Produkte oder Unterkategorien enthält'
      })
    }

    await prisma.shopKategorien.delete({
      where: { ShopKategorieID: id }
    })

    return { success: true, message: 'Shop-Kategorie erfolgreich gelöscht' }
  } catch (error: any) {
    console.error('Error deleting shop category:', error)
    throw createError({
      statusCode: error.statusCode || 500,
      message: error.message || 'Fehler beim Löschen der Shop-Kategorie'
    })
  }
})
