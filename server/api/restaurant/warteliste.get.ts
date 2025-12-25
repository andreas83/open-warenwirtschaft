import prisma from '~/lib/prisma'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)

  const where: any = {}

  if (query.status) {
    where.Status = query.status
  } else {
    // By default, show only active waiting list entries
    where.Status = {
      in: ['Wartend', 'Benachrichtigt']
    }
  }

  const warteliste = await prisma.warteliste.findMany({
    where,
    include: {
      RestaurantTische: true
    },
    orderBy: { Ankunftszeit: 'asc' }
  })

  return warteliste
})
