import prisma from '../../lib/prisma'

export default defineEventHandler(async (event) => {
  const method = event.node.req.method
  const query = getQuery(event)
  const id = query.id ? parseInt(query.id as string) : null

  try {
    if (method === 'GET') {
      if (id) {
        const retoure = await prisma.retouren.findUnique({
          where: { RetourenID: id },
          include: {
            Kunden: true,
            Bestellungen: true,
            Rechnungen: true,
            Benutzer: true,
            Retourenpositionen: {
              include: {
                Produkte: {
                  include: {
                    Einheiten: true
                  }
                }
              }
            }
          }
        })
        if (!retoure) {
          return { status: 404, message: 'Retoure nicht gefunden' }
        }
        return retoure
      } else {
        // List with optional filters
        const status = query.status as string | undefined
        const kundeId = query.kunde ? parseInt(query.kunde as string) : undefined
        const search = query.search as string | undefined
        const limit = query.limit ? parseInt(query.limit as string) : 100

        const where: any = {}
        if (status) where.Status = status
        if (kundeId) where.KundenID = kundeId
        if (search) {
          where.OR = [
            { Retourennummer: { contains: search } },
            { Kunden: { Firmenname: { contains: search } } },
            { Kunden: { Nachname: { contains: search } } }
          ]
        }

        const retouren = await prisma.retouren.findMany({
          where,
          include: {
            Kunden: true,
            Bestellungen: true,
            _count: {
              select: { Retourenpositionen: true }
            }
          },
          orderBy: { Retourendatum: 'desc' },
          take: limit
        })
        return retouren
      }
    } else if (method === 'POST') {
      const body = await readBody(event)

      // Generate Retourennummer
      const lastRetoure = await prisma.retouren.findFirst({
        orderBy: { RetourenID: 'desc' },
        select: { Retourennummer: true }
      })
      const nextNum = lastRetoure?.Retourennummer
        ? parseInt(lastRetoure.Retourennummer.replace('R-', '')) + 1
        : 1
      const retourennummer = `R-${String(nextNum).padStart(6, '0')}`

      const retoure = await prisma.retouren.create({
        data: {
          Retourennummer: retourennummer,
          KundenID: body.KundenID,
          BestellID: body.BestellID || null,
          RechnungsID: body.RechnungsID || null,
          AngelegtVonBenutzerID: body.AngelegtVonBenutzerID || null,
          Status: body.Status || 'Offen',
          Ruecksendegrund: body.Ruecksendegrund || null,
          GesamtbetragGutschrift: body.GesamtbetragGutschrift || 0,
          Retourenpositionen: body.Positionen?.length ? {
            create: body.Positionen.map((pos: any) => ({
              ProduktID: pos.ProduktID,
              Menge: pos.Menge,
              EinzelpreisNetto: pos.EinzelpreisNetto,
              GesamtpreisNetto: pos.Menge * pos.EinzelpreisNetto,
              MwSt_Satz: pos.MwSt_Satz || 19,
              MwSt_Betrag: (pos.Menge * pos.EinzelpreisNetto) * ((pos.MwSt_Satz || 19) / 100),
              Beschreibung: pos.Beschreibung || null,
              Status: 'Erwartet'
            }))
          } : undefined
        },
        include: {
          Kunden: true,
          Retourenpositionen: true
        }
      })
      return { status: 201, data: retoure }
    } else if (method === 'PUT' && id) {
      const body = await readBody(event)

      const retoure = await prisma.retouren.update({
        where: { RetourenID: id },
        data: {
          Status: body.Status,
          Ruecksendegrund: body.Ruecksendegrund || null,
          GesamtbetragGutschrift: body.GesamtbetragGutschrift || 0,
          LetzteAenderung: new Date()
        }
      })
      return { status: 200, data: retoure }
    } else if (method === 'DELETE' && id) {
      // Delete positions first
      await prisma.retourenpositionen.deleteMany({
        where: { RetourenID: id }
      })
      await prisma.retouren.delete({
        where: { RetourenID: id }
      })
      return { status: 204, message: 'Retoure geloscht' }
    } else {
      return { status: 405, message: 'Methode nicht erlaubt' }
    }
  } catch (error: any) {
    console.error('Retouren API Error:', error)
    return { status: 500, message: 'Interner Serverfehler', error: error.message }
  }
})
