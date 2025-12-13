import prisma from '~/lib/prisma'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)

  try {
    if (query.id) {
      // Get single table with relations
      const table = await prisma.restaurantTische.findUnique({
        where: { TischID: parseInt(query.id as string) },
        include: {
          Tischbereiche: true,
          Reservierungen: {
            where: {
              Status: {
                in: ['Bestaetigt', 'Eingecheckt']
              }
            },
            orderBy: {
              Reservierungsdatum: 'desc'
            }
          },
          RestaurantBestellungen: {
            where: {
              Status: {
                notIn: ['Abgeschlossen', 'Storniert']
              }
            },
            orderBy: {
              Bestelldatum: 'desc'
            }
          }
        }
      })

      if (!table) {
        throw createError({ statusCode: 404, message: 'Tisch nicht gefunden' })
      }

      return table
    } else {
      // Get list of tables with filters
      const limit = query.limit ? parseInt(query.limit as string) : 50
      const offset = query.offset ? parseInt(query.offset as string) : 0
      const bereichId = query.bereichId ? parseInt(query.bereichId as string) : undefined
      const status = query.status as string | undefined
      const search = query.search as string | undefined

      const where: any = {}

      if (bereichId) {
        where.BereichID = bereichId
      }

      if (status) {
        where.Status = status
      }

      if (search) {
        where.Tischnummer = {
          contains: search
        }
      }

      const [tables, total] = await Promise.all([
        prisma.restaurantTische.findMany({
          where,
          include: {
            Tischbereiche: true,
            _count: {
              select: {
                Reservierungen: true,
                RestaurantBestellungen: true
              }
            }
          },
          orderBy: {
            Tischnummer: 'asc'
          },
          skip: offset,
          take: limit
        }),
        prisma.restaurantTische.count({ where })
      ])

      return {
        tables,
        total,
        limit,
        offset
      }
    }
  } catch (error: any) {
    console.error('Error fetching tables:', error)
    throw createError({
      statusCode: error.statusCode || 500,
      message: error.message || 'Fehler beim Laden der Tische'
    })
  }
})
