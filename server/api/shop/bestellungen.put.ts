import prisma from '~/lib/prisma'

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    const id = body.ShopBestellID

    if (!id) {
      throw createError({ statusCode: 400, message: 'ShopBestellID ist erforderlich' })
    }

    const updateData: any = { ...body }
    delete updateData.ShopBestellID
    delete updateData.ShopBestellpositionen

    const order = await prisma.shopBestellungen.update({
      where: { ShopBestellID: id },
      data: updateData,
      include: {
        Kunden: true,
        ShopBestellpositionen: {
          include: {
            ShopProdukte: true
          }
        },
        ShopZahlungen: true
      }
    })

    return order
  } catch (error: any) {
    console.error('Error updating shop order:', error)
    throw createError({
      statusCode: error.statusCode || 500,
      message: error.message || 'Fehler beim Aktualisieren der Shop-Bestellung'
    })
  }
})
