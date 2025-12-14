import prisma from '../../lib/prisma'

export default defineEventHandler(async (event) => {
  const method = event.node.req.method
  const query = getQuery(event)
  const id = query.id ? parseInt(query.id as string) : null

  try {
    if (method === 'GET') {
      if (id) {
        const angebot = await prisma.angebote.findUnique({
          where: { AngebotID: id },
          include: {
            Kunden: true,
            Benutzer: true,
            Angebotspositionen: {
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
        if (!angebot) {
          return { status: 404, message: 'Angebot nicht gefunden' }
        }
        return angebot
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
            { Angebotsnummer: { contains: search } },
            { Angebotstitel: { contains: search } },
            { Kunden: { Firmenname: { contains: search } } },
            { Kunden: { Nachname: { contains: search } } }
          ]
        }

        const angebote = await prisma.angebote.findMany({
          where,
          include: {
            Kunden: true,
            _count: {
              select: { Angebotspositionen: true }
            }
          },
          orderBy: { Angebotsdatum: 'desc' },
          take: limit
        })
        return angebote
      }
    } else if (method === 'POST') {
      const body = await readBody(event)

      // Generate Angebotsnummer
      const lastAngebot = await prisma.angebote.findFirst({
        orderBy: { AngebotID: 'desc' },
        select: { Angebotsnummer: true }
      })
      const nextNum = lastAngebot?.Angebotsnummer
        ? parseInt(lastAngebot.Angebotsnummer.replace('A-', '')) + 1
        : 1
      const angebotsnummer = `A-${String(nextNum).padStart(6, '0')}`

      const angebot = await prisma.angebote.create({
        data: {
          Angebotsnummer: angebotsnummer,
          KundenID: body.KundenID,
          ErstelltVonBenutzerID: body.ErstelltVonBenutzerID || null,
          Angebotstitel: body.Angebotstitel,
          Angebotsdatum: new Date(body.Angebotsdatum || new Date()),
          Gueltigkeitsdatum: new Date(body.Gueltigkeitsdatum),
          Status: body.Status || 'Entwurf',
          GesamtsummeNetto: body.GesamtsummeNetto || 0,
          MwSt_Gesamt: body.MwSt_Gesamt || 0,
          GesamtsummeBrutto: body.GesamtsummeBrutto || 0,
          Zahlungsbedingungen: body.Zahlungsbedingungen || null,
          Lieferbedingungen: body.Lieferbedingungen || null,
          Kommentare: body.Kommentare || null,
          Angebotspositionen: body.Positionen?.length ? {
            create: body.Positionen.map((pos: any, idx: number) => ({
              ProduktID: pos.ProduktID,
              Positionsnummer: idx + 1,
              Menge: pos.Menge,
              EinzelpreisNetto: pos.EinzelpreisNetto,
              GesamtpreisNetto: pos.Menge * pos.EinzelpreisNetto,
              MwSt_Satz: pos.MwSt_Satz || 19,
              MwSt_Betrag: (pos.Menge * pos.EinzelpreisNetto) * ((pos.MwSt_Satz || 19) / 100),
              Beschreibung: pos.Beschreibung || null
            }))
          } : undefined
        },
        include: {
          Kunden: true,
          Angebotspositionen: true
        }
      })
      return { status: 201, data: angebot }
    } else if (method === 'PUT' && id) {
      const body = await readBody(event)

      const angebot = await prisma.angebote.update({
        where: { AngebotID: id },
        data: {
          Angebotstitel: body.Angebotstitel,
          Gueltigkeitsdatum: body.Gueltigkeitsdatum ? new Date(body.Gueltigkeitsdatum) : undefined,
          Status: body.Status,
          GesamtsummeNetto: body.GesamtsummeNetto || 0,
          MwSt_Gesamt: body.MwSt_Gesamt || 0,
          GesamtsummeBrutto: body.GesamtsummeBrutto || 0,
          Zahlungsbedingungen: body.Zahlungsbedingungen || null,
          Lieferbedingungen: body.Lieferbedingungen || null,
          Kommentare: body.Kommentare || null,
          LetzteAenderung: new Date()
        }
      })

      // Update positions if provided
      if (body.Positionen) {
        await prisma.angebotspositionen.deleteMany({
          where: { AngebotID: id }
        })
        await prisma.angebotspositionen.createMany({
          data: body.Positionen.map((pos: any, idx: number) => ({
            AngebotID: id,
            ProduktID: pos.ProduktID,
            Positionsnummer: idx + 1,
            Menge: pos.Menge,
            EinzelpreisNetto: pos.EinzelpreisNetto,
            GesamtpreisNetto: pos.Menge * pos.EinzelpreisNetto,
            MwSt_Satz: pos.MwSt_Satz || 19,
            MwSt_Betrag: (pos.Menge * pos.EinzelpreisNetto) * ((pos.MwSt_Satz || 19) / 100),
            Beschreibung: pos.Beschreibung || null
          }))
        })
      }

      return { status: 200, data: angebot }
    } else if (method === 'DELETE' && id) {
      await prisma.angebotspositionen.deleteMany({
        where: { AngebotID: id }
      })
      await prisma.angebote.delete({
        where: { AngebotID: id }
      })
      return { status: 204, message: 'Angebot geloscht' }
    } else {
      return { status: 405, message: 'Methode nicht erlaubt' }
    }
  } catch (error: any) {
    console.error('Angebote API Error:', error)
    return { status: 500, message: 'Interner Serverfehler', error: error.message }
  }
})
