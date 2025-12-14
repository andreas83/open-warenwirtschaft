import prisma from '~/lib/prisma'

export default defineEventHandler(async (event) => {
  const method = getMethod(event)
  const query = getQuery(event)

  // GET - List or single sales rep
  if (method === 'GET') {
    try {
      if (query.id) {
        const vertreter = await prisma.vertreter.findUnique({
          where: { VertreterID: parseInt(query.id as string) },
          include: {
            KundenVertreter: {
              include: {
                Kunden: true
              }
            },
            Provisionen: {
              orderBy: { Berechnungsdatum: 'desc' },
              take: 10
            }
          }
        })
        if (!vertreter) {
          return { status: 404, error: 'Vertreter nicht gefunden' }
        }
        return vertreter
      } else {
        const limit = parseInt(query.limit as string) || 100
        const offset = parseInt(query.offset as string) || 0
        const status = query.status as string

        const where: any = {}
        if (status) {
          where.Status = status
        }

        const [vertreterList, total] = await Promise.all([
          prisma.vertreter.findMany({
            where,
            include: {
              KundenVertreter: true,
              Provisionen: {
                where: {
                  Status: 'Offen'
                }
              }
            },
            orderBy: { Nachname: 'asc' },
            take: limit,
            skip: offset
          }),
          prisma.vertreter.count({ where })
        ])

        return { representatives: vertreterList, total }
      }
    } catch (error: any) {
      console.error('GET Vertreter Error:', error)
      return { status: 500, error: error.message }
    }
  }

  // POST - Create sales rep
  if (method === 'POST') {
    try {
      const body = await readBody(event)

      // Generate rep number
      const lastVertreter = await prisma.vertreter.findFirst({
        orderBy: { VertreterID: 'desc' },
        select: { Vertreternummer: true }
      })

      let nextNumber = 1
      if (lastVertreter?.Vertreternummer) {
        const match = lastVertreter.Vertreternummer.match(/VT-(\d+)/)
        if (match) {
          nextNumber = parseInt(match[1]) + 1
        }
      }
      const vertreternummer = `VT-${String(nextNumber).padStart(4, '0')}`

      const vertreter = await prisma.vertreter.create({
        data: {
          Vertreternummer: vertreternummer,
          Vorname: body.vorname,
          Nachname: body.nachname,
          Email: body.email,
          Telefon: body.telefon || null,
          Gebiet: body.gebiet || null,
          Provisionssatz: body.provisionssatz || null,
          Status: body.status || 'Aktiv',
          Einstellungsdatum: body.einstellungsdatum ? new Date(body.einstellungsdatum) : null
        }
      })

      return { status: 201, representative: vertreter }
    } catch (error: any) {
      console.error('POST Vertreter Error:', error)
      return { status: 500, error: error.message }
    }
  }

  // PUT - Update sales rep
  if (method === 'PUT') {
    try {
      const id = parseInt(query.id as string)
      if (!id) {
        return { status: 400, error: 'ID erforderlich' }
      }

      const body = await readBody(event)

      const vertreter = await prisma.vertreter.update({
        where: { VertreterID: id },
        data: {
          Vorname: body.vorname,
          Nachname: body.nachname,
          Email: body.email,
          Telefon: body.telefon,
          Gebiet: body.gebiet,
          Provisionssatz: body.provisionssatz,
          Status: body.status,
          Einstellungsdatum: body.einstellungsdatum ? new Date(body.einstellungsdatum) : undefined,
          LetzteAenderung: new Date()
        }
      })

      return { status: 200, representative: vertreter }
    } catch (error: any) {
      console.error('PUT Vertreter Error:', error)
      return { status: 500, error: error.message }
    }
  }

  // DELETE - Delete sales rep
  if (method === 'DELETE') {
    try {
      const id = parseInt(query.id as string)
      if (!id) {
        return { status: 400, error: 'ID erforderlich' }
      }

      // Check for linked customers
      const linkedCustomers = await prisma.kundenVertreter.count({
        where: { VertreterID: id }
      })

      if (linkedCustomers > 0) {
        return { status: 400, error: 'Vertreter hat zugewiesene Kunden und kann nicht geloscht werden' }
      }

      await prisma.vertreter.delete({
        where: { VertreterID: id }
      })

      return { status: 200, message: 'Vertreter geloscht' }
    } catch (error: any) {
      console.error('DELETE Vertreter Error:', error)
      return { status: 500, error: error.message }
    }
  }

  return { status: 405, error: 'Methode nicht erlaubt' }
})
