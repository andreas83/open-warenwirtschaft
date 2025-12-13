import prisma from '~/lib/prisma'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)

  try {
    if (query.id) {
      // Get single order with relations
      const order = await prisma.restaurantBestellungen.findUnique({
        where: { RestaurantBestellID: parseInt(query.id as string) },
        include: {
          RestaurantTische: {
            include: {
              Tischbereiche: true
            }
          },
          Kunden: true,
          Benutzer: {
            select: {
              BenutzerID: true,
              Vorname: true,
              Nachname: true,
              Benutzername: true
            }
          },
          RestaurantBestellpositionen: {
            include: {
              Produkte: {
                include: {
                  Einheiten: true,
                  Umsatzsteuersaetze: true
                }
              }
            },
            orderBy: {
              BestelltUm: 'asc'
            }
          },
          Rechnungen: true
        }
      })

      if (!order) {
        throw createError({ statusCode: 404, message: 'Bestellung nicht gefunden' })
      }

      return order
    } else {
      // Get list of orders with filters
      const limit = query.limit ? parseInt(query.limit as string) : 50
      const offset = query.offset ? parseInt(query.offset as string) : 0
      const status = query.status as string | undefined
      const tischId = query.tischId ? parseInt(query.tischId as string) : undefined
      const datum = query.datum as string | undefined

      const where: any = {}

      if (status) {
        where.Status = status
      }

      if (tischId) {
        where.TischID = tischId
      }

      if (datum) {
        const date = new Date(datum)
        const nextDate = new Date(date)
        nextDate.setDate(nextDate.getDate() + 1)

        where.Bestelldatum = {
          gte: date,
          lt: nextDate
        }
      }

      const [orders, total] = await Promise.all([
        prisma.restaurantBestellungen.findMany({
          where,
          include: {
            RestaurantTische: {
              include: {
                Tischbereiche: true
              }
            },
            Kunden: {
              select: {
                KundenID: true,
                Vorname: true,
                Nachname: true,
                Firmenname: true
              }
            },
            Benutzer: {
              select: {
                BenutzerID: true,
                Vorname: true,
                Nachname: true
              }
            },
            _count: {
              select: {
                RestaurantBestellpositionen: true
              }
            }
          },
          orderBy: {
            Bestelldatum: 'desc'
          },
          skip: offset,
          take: limit
        }),
        prisma.restaurantBestellungen.count({ where })
      ])

      return {
        orders,
        total,
        limit,
        offset
      }
    }
  } catch (error: any) {
    console.error('Error fetching orders:', error)
    throw createError({
      statusCode: error.statusCode || 500,
      message: error.message || 'Fehler beim Laden der Bestellungen'
    })
  }
})
