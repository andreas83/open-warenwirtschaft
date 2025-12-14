import prisma from '~/lib/prisma'

export default defineEventHandler(async (event) => {
  const method = getMethod(event)
  const query = getQuery(event)

  // GET - List or single contract
  if (method === 'GET') {
    try {
      if (query.id) {
        const vertrag = await prisma.preisvertraege.findUnique({
          where: { VertragsID: parseInt(query.id as string) },
          include: {
            Kunden: true,
            Vertragspositionen: {
              include: {
                Produkte: true
              }
            }
          }
        })
        if (!vertrag) {
          return { status: 404, error: 'Preisvertrag nicht gefunden' }
        }
        return vertrag
      } else {
        const limit = parseInt(query.limit as string) || 100
        const offset = parseInt(query.offset as string) || 0
        const status = query.status as string

        const where: any = {}
        if (status) {
          where.Status = status
        }

        const [vertraege, total] = await Promise.all([
          prisma.preisvertraege.findMany({
            where,
            include: {
              Kunden: true,
              Vertragspositionen: true
            },
            orderBy: { Erstelldatum: 'desc' },
            take: limit,
            skip: offset
          }),
          prisma.preisvertraege.count({ where })
        ])

        return { contracts: vertraege, total }
      }
    } catch (error: any) {
      console.error('GET Preisvertraege Error:', error)
      return { status: 500, error: error.message }
    }
  }

  // POST - Create contract
  if (method === 'POST') {
    try {
      const body = await readBody(event)

      // Generate contract number
      const lastVertrag = await prisma.preisvertraege.findFirst({
        orderBy: { VertragsID: 'desc' },
        select: { Vertragsnummer: true }
      })

      let nextNumber = 1
      if (lastVertrag?.Vertragsnummer) {
        const match = lastVertrag.Vertragsnummer.match(/V-(\d+)/)
        if (match) {
          nextNumber = parseInt(match[1]) + 1
        }
      }
      const vertragsnummer = `V-${String(nextNumber).padStart(6, '0')}`

      const vertrag = await prisma.preisvertraege.create({
        data: {
          KundenID: body.kundenId,
          Vertragsnummer: vertragsnummer,
          Vertragsbezeichnung: body.vertragsbezeichnung,
          Beschreibung: body.beschreibung || null,
          GueltigAb: new Date(body.gueltigAb),
          GueltigBis: body.gueltigBis ? new Date(body.gueltigBis) : null,
          Status: body.status || 'Aktiv',
          Zahlungsbedingungen: body.zahlungsbedingungen || null,
          Mindestabnahme: body.mindestabnahme || null,
          Waehrung: body.waehrung || 'EUR',
          Kommentare: body.kommentare || null,
          Vertragspositionen: body.positionen?.length ? {
            create: body.positionen.map((pos: any) => ({
              ProduktID: pos.produktId,
              MengeAb: pos.mengeAb,
              MengeBis: pos.mengeBis || null,
              Vertragspreis: pos.vertragspreis,
              Waehrung: body.waehrung || 'EUR'
            }))
          } : undefined
        },
        include: {
          Kunden: true,
          Vertragspositionen: {
            include: {
              Produkte: true
            }
          }
        }
      })

      return { status: 201, contract: vertrag }
    } catch (error: any) {
      console.error('POST Preisvertraege Error:', error)
      return { status: 500, error: error.message }
    }
  }

  // PUT - Update contract
  if (method === 'PUT') {
    try {
      const id = parseInt(query.id as string)
      if (!id) {
        return { status: 400, error: 'ID erforderlich' }
      }

      const body = await readBody(event)

      // Update contract
      const vertrag = await prisma.preisvertraege.update({
        where: { VertragsID: id },
        data: {
          KundenID: body.kundenId,
          Vertragsbezeichnung: body.vertragsbezeichnung,
          Beschreibung: body.beschreibung,
          GueltigAb: body.gueltigAb ? new Date(body.gueltigAb) : undefined,
          GueltigBis: body.gueltigBis ? new Date(body.gueltigBis) : null,
          Status: body.status,
          Zahlungsbedingungen: body.zahlungsbedingungen,
          Mindestabnahme: body.mindestabnahme,
          Kommentare: body.kommentare,
          LetzteAenderung: new Date()
        },
        include: {
          Kunden: true,
          Vertragspositionen: {
            include: {
              Produkte: true
            }
          }
        }
      })

      return { status: 200, contract: vertrag }
    } catch (error: any) {
      console.error('PUT Preisvertraege Error:', error)
      return { status: 500, error: error.message }
    }
  }

  // DELETE - Delete contract
  if (method === 'DELETE') {
    try {
      const id = parseInt(query.id as string)
      if (!id) {
        return { status: 400, error: 'ID erforderlich' }
      }

      // Delete positions first (cascade should handle this, but being explicit)
      await prisma.vertragspositionen.deleteMany({
        where: { VertragsID: id }
      })

      await prisma.preisvertraege.delete({
        where: { VertragsID: id }
      })

      return { status: 200, message: 'Preisvertrag geloscht' }
    } catch (error: any) {
      console.error('DELETE Preisvertraege Error:', error)
      return { status: 500, error: error.message }
    }
  }

  return { status: 405, error: 'Methode nicht erlaubt' }
})
