import prisma from '~/lib/prisma'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)

  try {
    if (query.id) {
      // Get single booking with all relations
      const booking = await prisma.hotelBuchungen.findUnique({
        where: { BuchungsID: parseInt(query.id as string) },
        include: {
          Kunden: true,
          Rechnungen: true,
          Benutzer: true,
          HotelBuchungszimmer: {
            include: {
              Zimmer: {
                include: {
                  Zimmerkategorien: true,
                  Standorte: true
                }
              }
            }
          },
          HotelGaeste: {
            orderBy: {
              IstHauptgast: 'desc'
            }
          },
          HotelZusatzleistungen: {
            include: {
              Benutzer: true
            },
            orderBy: {
              Datum: 'desc'
            }
          }
        }
      })

      if (!booking) {
        throw createError({ statusCode: 404, message: 'Buchung nicht gefunden' })
      }

      return booking
    } else {
      // Get list of bookings with filters
      const limit = query.limit ? parseInt(query.limit as string) : 50
      const offset = query.offset ? parseInt(query.offset as string) : 0
      const kundenId = query.kundenId ? parseInt(query.kundenId as string) : undefined
      const status = query.status as string | undefined
      const checkInFrom = query.checkInFrom as string | undefined
      const checkInTo = query.checkInTo as string | undefined
      const checkOutFrom = query.checkOutFrom as string | undefined
      const checkOutTo = query.checkOutTo as string | undefined
      const search = query.search as string | undefined

      const where: any = {}

      if (kundenId) {
        where.KundenID = kundenId
      }

      if (status) {
        where.Status = status
      }

      if (checkInFrom || checkInTo) {
        where.CheckInDatum = {}
        if (checkInFrom) {
          where.CheckInDatum.gte = new Date(checkInFrom)
        }
        if (checkInTo) {
          where.CheckInDatum.lte = new Date(checkInTo)
        }
      }

      if (checkOutFrom || checkOutTo) {
        where.CheckOutDatum = {}
        if (checkOutFrom) {
          where.CheckOutDatum.gte = new Date(checkOutFrom)
        }
        if (checkOutTo) {
          where.CheckOutDatum.lte = new Date(checkOutTo)
        }
      }

      if (search) {
        where.OR = [
          { Buchungsnummer: { contains: search } },
          { Gastname: { contains: search } },
          { Email: { contains: search } },
          { Telefon: { contains: search } }
        ]
      }

      const [bookings, total] = await Promise.all([
        prisma.hotelBuchungen.findMany({
          where,
          include: {
            Kunden: true,
            HotelBuchungszimmer: {
              include: {
                Zimmer: {
                  include: {
                    Zimmerkategorien: true
                  }
                }
              }
            },
            HotelGaeste: {
              where: {
                IstHauptgast: true
              }
            },
            _count: {
              select: {
                HotelBuchungszimmer: true,
                HotelGaeste: true,
                HotelZusatzleistungen: true
              }
            }
          },
          orderBy: {
            CheckInDatum: 'desc'
          },
          skip: offset,
          take: limit
        }),
        prisma.hotelBuchungen.count({ where })
      ])

      return {
        bookings,
        total,
        limit,
        offset
      }
    }
  } catch (error: any) {
    console.error('Error fetching bookings:', error)
    throw createError({
      statusCode: error.statusCode || 500,
      message: error.message || 'Fehler beim Laden der Buchungen'
    })
  }
})
