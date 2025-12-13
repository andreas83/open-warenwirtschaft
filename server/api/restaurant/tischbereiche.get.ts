import prisma from '~/lib/prisma'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)

  try {
    if (query.id) {
      const section = await prisma.tischbereiche.findUnique({
        where: { BereichID: parseInt(query.id as string) },
        include: {
          Standorte: true,
          RestaurantTische: {
            include: {
              _count: {
                select: {
                  Reservierungen: true,
                  RestaurantBestellungen: true
                }
              }
            }
          }
        }
      })

      if (!section) {
        throw createError({ statusCode: 404, message: 'Tischbereich nicht gefunden' })
      }

      return section
    } else {
      const standortId = query.standortId ? parseInt(query.standortId as string) : undefined
      const where: any = { IstAktiv: true }

      if (standortId) {
        where.StandortID = standortId
      }

      const sections = await prisma.tischbereiche.findMany({
        where,
        include: {
          Standorte: true,
          _count: {
            select: {
              RestaurantTische: true
            }
          }
        },
        orderBy: {
          SortOrder: 'asc'
        }
      })

      return { sections, total: sections.length }
    }
  } catch (error: any) {
    console.error('Error fetching table sections:', error)
    throw createError({
      statusCode: error.statusCode || 500,
      message: error.message || 'Fehler beim Laden der Tischbereiche'
    })
  }
})
