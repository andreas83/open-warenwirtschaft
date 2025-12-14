import prisma from '../../lib/prisma'

export default defineEventHandler(async (event) => {
  const method = event.node.req.method
  const query = getQuery(event)
  const id = query.id ? parseInt(query.id as string) : null

  try {
    if (method === 'GET') {
      if (id) {
        const bestellung = await prisma.bestellungen.findUnique({
          where: { BestellID: id },
          include: {
            Kunden: true,
            Standorte: true,
            Benutzer: true,
            Bestellpositionen: {
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
        if (!bestellung) {
          return { status: 404, message: 'Bestellung nicht gefunden' }
        }
        return bestellung
      } else {
        // List with optional filters
        const status = query.status as string | undefined
        const kundeId = query.kunde ? parseInt(query.kunde as string) : undefined
        const search = query.search as string | undefined
        const limit = query.limit ? parseInt(query.limit as string) : 100

        const where: any = {}
        if (status) where.Bestellstatus = status
        if (kundeId) where.KundenID = kundeId
        if (search) {
          where.OR = [
            { Bestellnummer: { contains: search } },
            { Kunden: { Firmenname: { contains: search } } },
            { Kunden: { Nachname: { contains: search } } }
          ]
        }

        const bestellungen = await prisma.bestellungen.findMany({
          where,
          include: {
            Kunden: true,
            Standorte: true,
            _count: {
              select: { Bestellpositionen: true }
            }
          },
          orderBy: { Bestelldatum: 'desc' },
          take: limit
        })
        return bestellungen
      }
    } else if (method === 'POST') {
      const body = await readBody(event)

      // Generate Bestellnummer
      const lastBestellung = await prisma.bestellungen.findFirst({
        orderBy: { BestellID: 'desc' },
        select: { Bestellnummer: true }
      })
      const nextNum = lastBestellung?.Bestellnummer
        ? parseInt(lastBestellung.Bestellnummer.replace('B-', '')) + 1
        : 1
      const bestellnummer = `B-${String(nextNum).padStart(6, '0')}`

      const bestellung = await prisma.bestellungen.create({
        data: {
          Bestellnummer: bestellnummer,
          KundenID: body.KundenID,
          StandortID: body.StandortID || null,
          ErfasstVonBenutzerID: body.ErfasstVonBenutzerID || null,
          Lieferdatum: body.Lieferdatum ? new Date(body.Lieferdatum) : null,
          Bestellstatus: body.Bestellstatus || 'Offen',
          Lieferadresse: body.Lieferadresse || null,
          Versandkosten: body.Versandkosten || 0,
          GesamtsummeNetto: body.GesamtsummeNetto || 0,
          GesamtsummeBrutto: body.GesamtsummeBrutto || 0,
          Kommentare: body.Kommentare || null,
          Bestellpositionen: body.Positionen?.length ? {
            create: body.Positionen.map((pos: any) => ({
              ProduktID: pos.ProduktID,
              Menge: pos.Menge,
              EinzelpreisNetto: pos.EinzelpreisNetto,
              GesamtpreisNettoPosition: pos.Menge * pos.EinzelpreisNetto,
              MwSt_Satz: pos.MwSt_Satz || 19,
              MwSt_Betrag: (pos.Menge * pos.EinzelpreisNetto) * ((pos.MwSt_Satz || 19) / 100),
              Beschreibung: pos.Beschreibung || null
            }))
          } : undefined
        },
        include: {
          Kunden: true,
          Bestellpositionen: true
        }
      })
      return { status: 201, data: bestellung }
    } else if (method === 'PUT' && id) {
      const body = await readBody(event)

      const bestellung = await prisma.bestellungen.update({
        where: { BestellID: id },
        data: {
          KundenID: body.KundenID,
          StandortID: body.StandortID || null,
          Lieferdatum: body.Lieferdatum ? new Date(body.Lieferdatum) : null,
          Bestellstatus: body.Bestellstatus,
          Lieferadresse: body.Lieferadresse || null,
          Versandkosten: body.Versandkosten || 0,
          GesamtsummeNetto: body.GesamtsummeNetto || 0,
          GesamtsummeBrutto: body.GesamtsummeBrutto || 0,
          Kommentare: body.Kommentare || null,
          LetzteAenderung: new Date()
        }
      })

      // Update positions if provided
      if (body.Positionen) {
        // Delete existing positions
        await prisma.bestellpositionen.deleteMany({
          where: { BestellID: id }
        })
        // Create new positions
        await prisma.bestellpositionen.createMany({
          data: body.Positionen.map((pos: any) => ({
            BestellID: id,
            ProduktID: pos.ProduktID,
            Menge: pos.Menge,
            EinzelpreisNetto: pos.EinzelpreisNetto,
            GesamtpreisNettoPosition: pos.Menge * pos.EinzelpreisNetto,
            MwSt_Satz: pos.MwSt_Satz || 19,
            MwSt_Betrag: (pos.Menge * pos.EinzelpreisNetto) * ((pos.MwSt_Satz || 19) / 100),
            Beschreibung: pos.Beschreibung || null
          }))
        })
      }

      return { status: 200, data: bestellung }
    } else if (method === 'DELETE' && id) {
      // Delete positions first
      await prisma.bestellpositionen.deleteMany({
        where: { BestellID: id }
      })
      // Then delete the order
      await prisma.bestellungen.delete({
        where: { BestellID: id }
      })
      return { status: 204, message: 'Bestellung gelöscht' }
    } else {
      return { status: 405, message: 'Methode nicht erlaubt' }
    }
  } catch (error: any) {
    console.error('Bestellungen API Error:', error)
    return { status: 500, message: 'Interner Serverfehler', error: error.message }
  }
})
