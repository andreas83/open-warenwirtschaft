import prisma from '~/lib/prisma'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)

  try {
    if (query.id) {
      // Get single reservation with relations
      const reservation = await prisma.reservierungen.findUnique({
        where: { ReservierungsID: parseInt(query.id as string) },
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
          }
        }
      })

      if (!reservation) {
        throw createError({ statusCode: 404, message: 'Reservierung nicht gefunden' })
      }

      return reservation
    } else {
      // Get list of reservations with filters
      const limit = query.limit ? parseInt(query.limit as string) : 50
      const offset = query.offset ? parseInt(query.offset as string) : 0
      const status = query.status as string | undefined
      const tischId = query.tischId ? parseInt(query.tischId as string) : undefined
      const datum = query.datum as string | undefined
      const search = query.search as string | undefined

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

        where.Reservierungsdatum = {
          gte: date,
          lt: nextDate
        }
      }

      if (search) {
        where.OR = [
          { Gastname: { contains: search } },
          { Telefon: { contains: search } },
          { Email: { contains: search } }
        ]
      }

      const [reservations, total] = await Promise.all([
        prisma.reservierungen.findMany({
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
            }
          },
          orderBy: {
            Reservierungsdatum: 'asc'
          },
          skip: offset,
          take: limit
        }),
        prisma.reservierungen.count({ where })
      ])

      return {
        reservations,
        total,
        limit,
        offset
      }
    }
  } catch (error: any) {
    console.error('Error fetching reservations:', error)
    throw createError({
      statusCode: error.statusCode || 500,
      message: error.message || 'Fehler beim Laden der Reservierungen'
    })
  }
})
