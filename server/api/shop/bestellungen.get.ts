import prisma from '~/lib/prisma'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)

  try {
    if (query.id) {
      // Get single order with full details
      const order = await prisma.shopBestellungen.findUnique({
        where: { ShopBestellID: parseInt(query.id as string) },
        include: {
          Kunden: true,
          ShopBestellpositionen: {
            include: {
              ShopProdukte: {
                include: {
                  Produkte: true
                }
              }
            },
            orderBy: {
              ShopBestellpositionsID: 'asc'
            }
          },
          ShopZahlungen: {
            orderBy: {
              Erstelldatum: 'desc'
            }
          }
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
      const kundenId = query.kundenId ? parseInt(query.kundenId as string) : undefined
      const status = query.status as string | undefined
      const zahlungsstatus = query.zahlungsstatus as string | undefined
      const versandstatus = query.versandstatus as string | undefined
      const search = query.search as string | undefined

      const where: any = {}

      if (kundenId) {
        where.KundenID = kundenId
      }

      if (status) {
        where.Status = status
      }

      if (zahlungsstatus) {
        where.Zahlungsstatus = zahlungsstatus
      }

      if (versandstatus) {
        where.Versandstatus = versandstatus
      }

      if (search) {
        where.OR = [
          { Bestellnummer: { contains: search } },
          { RechnungsEmail: { contains: search } },
          { RechnungsNachname: { contains: search } }
        ]
      }

      const [orders, total] = await Promise.all([
        prisma.shopBestellungen.findMany({
          where,
          include: {
            Kunden: true,
            _count: {
              select: {
                ShopBestellpositionen: true
              }
            }
          },
          orderBy: {
            Bestelldatum: 'desc'
          },
          skip: offset,
          take: limit
        }),
        prisma.shopBestellungen.count({ where })
      ])

      return {
        orders,
        total,
        limit,
        offset
      }
    }
  } catch (error: any) {
    console.error('Error fetching shop orders:', error)
    throw createError({
      statusCode: error.statusCode || 500,
      message: error.message || 'Fehler beim Laden der Shop-Bestellungen'
    })
  }
})
