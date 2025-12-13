import prisma from '~/lib/prisma'

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    const id = body.ShopKategorieID

    if (!id) {
      throw createError({ statusCode: 400, message: 'ShopKategorieID ist erforderlich' })
    }

    // Update slug if name changed
    const updateData: any = { ...body }
    if (body.Name && !body.Slug) {
      updateData.Slug = body.Name.toLowerCase()
        .replace(/[^a-z0-9äöüß]+/g, '-')
        .replace(/^-+|-+$/g, '')
    }

    delete updateData.ShopKategorieID

    const category = await prisma.shopKategorien.update({
      where: { ShopKategorieID: id },
      data: updateData,
      include: {
        ShopKategorien: true,
        other_ShopKategorien: true,
        _count: {
          select: {
            ShopProdukte: true
          }
        }
      }
    })

    return category
  } catch (error: any) {
    console.error('Error updating shop category:', error)
    throw createError({
      statusCode: error.statusCode || 500,
      message: error.message || 'Fehler beim Aktualisieren der Shop-Kategorie'
    })
  }
})
