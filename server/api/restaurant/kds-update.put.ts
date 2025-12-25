import prisma from '~/lib/prisma'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { PositionID, Status } = body

  if (!PositionID || !Status) {
    throw createError({
      statusCode: 400,
      statusMessage: 'PositionID und Status sind erforderlich'
    })
  }

  const updateData: any = { Status }

  // Set timestamps based on status
  if (Status === 'In_Zubereitung') {
    // No specific timestamp for this status
  } else if (Status === 'Bereit') {
    updateData.ZubereitetUm = new Date()
  } else if (Status === 'Serviert') {
    updateData.ServiertUm = new Date()
  }

  const position = await prisma.restaurantBestellpositionen.update({
    where: { PositionID },
    data: updateData,
    include: {
      RestaurantBestellungen: {
        include: {
          RestaurantTische: true
        }
      },
      Produkte: true,
      MenuItem: true
    }
  })

  // Check if all positions of the order are ready/served
  const allPositions = await prisma.restaurantBestellpositionen.findMany({
    where: { RestaurantBestellID: position.RestaurantBestellID }
  })

  const allReady = allPositions.every(p => p.Status === 'Bereit' || p.Status === 'Serviert')
  const allServiert = allPositions.every(p => p.Status === 'Serviert')

  if (allServiert) {
    await prisma.restaurantBestellungen.update({
      where: { RestaurantBestellID: position.RestaurantBestellID },
      data: { Status: 'Serviert' }
    })
  } else if (allReady) {
    await prisma.restaurantBestellungen.update({
      where: { RestaurantBestellID: position.RestaurantBestellID },
      data: { Status: 'Serviert' }
    })
  }

  return position
})
