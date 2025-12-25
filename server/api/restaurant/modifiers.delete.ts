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

  // Check if modifier is being used
  const usageCount = await prisma.menuItemModifier.count({
    where: { ModifierID: id }
  })

  if (usageCount > 0) {
    // Soft delete
    await prisma.modifier.update({
      where: { ModifierID: id },
      data: { IstAktiv: false }
    })
  } else {
    // Hard delete
    await prisma.modifier.delete({
      where: { ModifierID: id }
    })
  }

  return { success: true }
})
