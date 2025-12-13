import prisma from '~/lib/prisma'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)

  try {
    if (query.id) {
      // Get single room with relations
      const room = await prisma.zimmer.findUnique({
        where: { ZimmerID: parseInt(query.id as string) },
        include: {
          Zimmerkategorien: true,
          Standorte: true,
          HotelBuchungszimmer: {
            include: {
              HotelBuchungen: true
            },
            orderBy: {
              CheckInDatum: 'desc'
            }
          }
        }
      })

      if (!room) {
        throw createError({ statusCode: 404, message: 'Zimmer nicht gefunden' })
      }

      return room
    } else {
      // Get list of rooms with filters
      const limit = query.limit ? parseInt(query.limit as string) : 50
      const offset = query.offset ? parseInt(query.offset as string) : 0
      const kategorieId = query.kategorieId ? parseInt(query.kategorieId as string) : undefined
      const standortId = query.standortId ? parseInt(query.standortId as string) : undefined
      const status = query.status as string | undefined
      const search = query.search as string | undefined
      const istAktiv = query.istAktiv !== undefined ? query.istAktiv === 'true' : undefined

      const where: any = {}

      if (kategorieId) {
        where.ZimmerkategorieID = kategorieId
      }

      if (standortId) {
        where.StandortID = standortId
      }

      if (status) {
        where.Status = status
      }

      if (istAktiv !== undefined) {
        where.IstAktiv = istAktiv
      }

      if (search) {
        where.OR = [
          { Zimmernummer: { contains: search } },
          { Beschreibung: { contains: search } }
        ]
      }

      const [rooms, total] = await Promise.all([
        prisma.zimmer.findMany({
          where,
          include: {
            Zimmerkategorien: true,
            Standorte: true,
            _count: {
              select: {
                HotelBuchungszimmer: true
              }
            }
          },
          orderBy: {
            Zimmernummer: 'asc'
          },
          skip: offset,
          take: limit
        }),
        prisma.zimmer.count({ where })
      ])

      return {
        rooms,
        total,
        limit,
        offset
      }
    }
  } catch (error: any) {
    console.error('Error fetching rooms:', error)
    throw createError({
      statusCode: error.statusCode || 500,
      message: error.message || 'Fehler beim Laden der Zimmer'
    })
  }
})
