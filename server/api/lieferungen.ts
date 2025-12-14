import prisma from '~/lib/prisma'

export default defineEventHandler(async (event) => {
  const method = getMethod(event)
  const query = getQuery(event)

  // GET - List deliveries or single
  if (method === 'GET') {
    try {
      // Get tours
      if (query.type === 'touren') {
        const touren = await prisma.touren.findMany({
          include: {
            Lieferungen: true
          },
          orderBy: { Tourdatum: 'desc' },
          take: parseInt(query.limit as string) || 100
        })
        return { tours: touren }
      }

      // Get single delivery
      if (query.id) {
        const lieferung = await prisma.lieferungen.findUnique({
          where: { LieferungID: parseInt(query.id as string) },
          include: {
            Bestellungen: {
              include: {
                Kunden: true
              }
            },
            Touren: true,
            Liefernachweise: true
          }
        })
        if (!lieferung) {
          return { status: 404, error: 'Lieferung nicht gefunden' }
        }
        return lieferung
      }

      // List all deliveries
      const status = query.status as string
      const where: any = {}
      if (status) {
        where.Status = status
      }

      const [lieferungen, total] = await Promise.all([
        prisma.lieferungen.findMany({
          where,
          include: {
            Bestellungen: {
              include: {
                Kunden: true
              }
            },
            Touren: true
          },
          orderBy: { Erstelldatum: 'desc' },
          take: parseInt(query.limit as string) || 100
        }),
        prisma.lieferungen.count({ where })
      ])

      // Calculate statistics
      const allDeliveries = await prisma.lieferungen.groupBy({
        by: ['Status'],
        _count: { LieferungID: true }
      })

      const stats = {
        total: lieferungen.length,
        planned: allDeliveries.find(d => d.Status === 'Geplant')?._count.LieferungID || 0,
        inProgress: allDeliveries.find(d => d.Status === 'In_Auslieferung')?._count.LieferungID || 0,
        delivered: allDeliveries.find(d => d.Status === 'Geliefert')?._count.LieferungID || 0
      }

      return { deliveries: lieferungen, stats, total }
    } catch (error: any) {
      console.error('GET Lieferungen Error:', error)
      return { status: 500, error: error.message }
    }
  }

  // POST - Create delivery
  if (method === 'POST') {
    try {
      const body = await readBody(event)

      // Generate delivery number
      const lastLieferung = await prisma.lieferungen.findFirst({
        orderBy: { LieferungID: 'desc' },
        select: { Liefernummer: true }
      })

      let nextNumber = 1
      if (lastLieferung?.Liefernummer) {
        const match = lastLieferung.Liefernummer.match(/L-(\d+)/)
        if (match) {
          nextNumber = parseInt(match[1]) + 1
        }
      }
      const liefernummer = `L-${String(nextNumber).padStart(6, '0')}`

      const lieferung = await prisma.lieferungen.create({
        data: {
          BestellID: body.bestellId,
          Liefernummer: liefernummer,
          Lieferdatum: body.lieferdatum ? new Date(body.lieferdatum) : null,
          GeplantesLieferdatum: body.geplantesLieferdatum ? new Date(body.geplantesLieferdatum) : null,
          TourID: body.tourId || null,
          Status: body.status || 'Geplant',
          TrackingNummer: body.trackingNummer || null,
          Lieferant: body.lieferant || null,
          Kommentare: body.kommentare || null
        },
        include: {
          Bestellungen: {
            include: {
              Kunden: true
            }
          },
          Touren: true
        }
      })

      return { status: 201, delivery: lieferung }
    } catch (error: any) {
      console.error('POST Lieferungen Error:', error)
      return { status: 500, error: error.message }
    }
  }

  // PUT - Update delivery
  if (method === 'PUT') {
    try {
      const id = parseInt(query.id as string)
      if (!id) {
        return { status: 400, error: 'ID erforderlich' }
      }

      const body = await readBody(event)

      const lieferung = await prisma.lieferungen.update({
        where: { LieferungID: id },
        data: {
          Lieferdatum: body.lieferdatum ? new Date(body.lieferdatum) : undefined,
          GeplantesLieferdatum: body.geplantesLieferdatum ? new Date(body.geplantesLieferdatum) : undefined,
          TourID: body.tourId,
          Status: body.status,
          TrackingNummer: body.trackingNummer,
          Lieferant: body.lieferant,
          Kommentare: body.kommentare,
          LetzteAenderung: new Date()
        },
        include: {
          Bestellungen: {
            include: {
              Kunden: true
            }
          },
          Touren: true
        }
      })

      return { status: 200, delivery: lieferung }
    } catch (error: any) {
      console.error('PUT Lieferungen Error:', error)
      return { status: 500, error: error.message }
    }
  }

  // DELETE - Delete delivery
  if (method === 'DELETE') {
    try {
      const id = parseInt(query.id as string)
      if (!id) {
        return { status: 400, error: 'ID erforderlich' }
      }

      // Check for proof of delivery
      const proofs = await prisma.liefernachweise.count({
        where: { LieferungID: id }
      })

      if (proofs > 0) {
        return { status: 400, error: 'Liefernachweise vorhanden' }
      }

      await prisma.lieferungen.delete({
        where: { LieferungID: id }
      })

      return { status: 200, message: 'Lieferung geloscht' }
    } catch (error: any) {
      console.error('DELETE Lieferungen Error:', error)
      return { status: 500, error: error.message }
    }
  }

  return { status: 405, error: 'Methode nicht erlaubt' }
})
