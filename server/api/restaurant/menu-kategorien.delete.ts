import prisma from '~/lib/prisma'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const id = parseInt(query.id as string)

  if (!id) {
    throw createError({
      statusCode: 400,
      statusMessage: 'ID ist erforderlich'
    })
  }

  // Check if category has children or menu items
  const kategorie = await prisma.menuKategorien.findUnique({
    where: { KategorieID: id },
    include: {
      Children: true,
      MenuItems: true
    }
  })

  if (!kategorie) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Kategorie nicht gefunden'
    })
  }

  if (kategorie.Children.length > 0 || kategorie.MenuItems.length > 0) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Kategorie kann nicht gelöscht werden, da sie Unterkategorien oder Menüpunkte enthält'
    })
  }

  await prisma.menuKategorien.delete({
    where: { KategorieID: id }
  })

  return { success: true }
})
