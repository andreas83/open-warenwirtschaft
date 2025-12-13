import prisma from '~/lib/prisma'

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)

    // Generate order number
    const count = await prisma.restaurantBestellungen.count()
    const bestellnummer = `RB-${new Date().getFullYear()}-${String(count + 1).padStart(6, '0')}`

    const order = await prisma.restaurantBestellungen.create({
      data: {
        TischID: body.TischID,
        KundenID: body.KundenID || null,
        BenutzerID: body.BenutzerID || null,
        Bestellnummer: bestellnummer,
        PersonenAnzahl: body.PersonenAnzahl || 1,
        Status: body.Status || 'Offen',
        Notizen: body.Notizen || null
      },
      include: {
        RestaurantTische: {
          include: {
            Tischbereiche: true
          }
        },
        Kunden: true
      }
    })

    // Update table status to Besetzt
    await prisma.restaurantTische.update({
      where: { TischID: body.TischID },
      data: { Status: 'Besetzt' }
    })

    return order
  } catch (error: any) {
    console.error('Error creating order:', error)
    throw createError({
      statusCode: error.statusCode || 500,
      message: error.message || 'Fehler beim Erstellen der Bestellung'
    })
  }
})
