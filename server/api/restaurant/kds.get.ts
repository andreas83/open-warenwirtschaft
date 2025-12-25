import prisma from '~/lib/prisma'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)

  // Kitchen Display System - shows all active order items grouped by status
  const where: any = {
    Status: {
      in: ['Bestellt', 'In_Zubereitung', 'Bereit']
    }
  }

  if (query.status) {
    where.Status = query.status
  }

  if (query.gang) {
    where.Gang = parseInt(query.gang as string)
  }

  const positionen = await prisma.restaurantBestellpositionen.findMany({
    where,
    include: {
      RestaurantBestellungen: {
        include: {
          RestaurantTische: true
        }
      },
      Produkte: true,
      MenuItem: {
        include: {
          MenuKategorien: true
        }
      },
      BestellpositionModifiers: {
        include: {
          Modifier: true
        }
      }
    },
    orderBy: [
      { Gang: 'asc' },
      { BestelltUm: 'asc' }
    ]
  })

  // Group by order
  const groupedByOrder = positionen.reduce((acc, position) => {
    const bestellId = position.RestaurantBestellID
    if (!acc[bestellId]) {
      acc[bestellId] = {
        bestellung: position.RestaurantBestellungen,
        positionen: []
      }
    }
    acc[bestellId].positionen.push(position)
    return acc
  }, {} as any)

  return {
    positionen,
    groupedByOrder: Object.values(groupedByOrder)
  }
})
