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

  // Check if menu item is being used in orders
  const orderCount = await prisma.restaurantBestellpositionen.count({
    where: { MenuItemID: id }
  })

  if (orderCount > 0) {
    // Soft delete by setting IstAktiv to false
    await prisma.menuItem.update({
      where: { MenuItemID: id },
      data: { IstAktiv: false }
    })
  } else {
    // Hard delete if not used
    await prisma.menuItem.delete({
      where: { MenuItemID: id }
    })
  }

  return { success: true }
})
