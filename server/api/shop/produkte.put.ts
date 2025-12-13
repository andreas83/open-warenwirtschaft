import prisma from '~/lib/prisma'

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    const id = body.ShopProduktID

    if (!id) {
      throw createError({ statusCode: 400, message: 'ShopProduktID ist erforderlich' })
    }

    // Update slug if title changed
    const updateData: any = { ...body }
    if (body.Titel && !body.Slug) {
      updateData.Slug = body.Titel.toLowerCase()
        .replace(/[^a-z0-9äöüß]+/g, '-')
        .replace(/^-+|-+$/g, '')
    }

    // Handle JSON fields
    if (body.BilderJSON && typeof body.BilderJSON === 'object') {
      updateData.BilderJSON = JSON.stringify(body.BilderJSON)
    }
    if (body.AttributeJSON && typeof body.AttributeJSON === 'object') {
      updateData.AttributeJSON = JSON.stringify(body.AttributeJSON)
    }

    delete updateData.ShopProduktID

    const product = await prisma.shopProdukte.update({
      where: { ShopProduktID: id },
      data: updateData,
      include: {
        Produkte: {
          include: {
            Einheiten: true,
            Umsatzsteuersaetze: true
          }
        },
        ShopKategorien: true
      }
    })

    return product
  } catch (error: any) {
    console.error('Error updating shop product:', error)
    throw createError({
      statusCode: error.statusCode || 500,
      message: error.message || 'Fehler beim Aktualisieren des Shop-Produkts'
    })
  }
})
