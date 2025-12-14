import prisma from '../../lib/prisma'

export default defineEventHandler(async (event) => {
  const method = event.node.req.method
  const query = getQuery(event)
  const id = query.id ? parseInt(query.id as string) : null

  try {
    if (method === 'GET') {
      const bestandId = query.bestand ? parseInt(query.bestand as string) : undefined
      const bewegungstyp = query.typ as string | undefined
      const limit = query.limit ? parseInt(query.limit as string) : 100

      const where: any = {}
      if (bestandId) where.BestandID = bestandId
      if (bewegungstyp) where.Bewegungstyp = bewegungstyp

      const bewegungen = await prisma.lagerbewegungen.findMany({
        where,
        include: {
          Bestand: {
            include: {
              Produkte: true,
              Standorte: true
            }
          },
          Benutzer: true
        },
        orderBy: { Bewegungsdatum: 'desc' },
        take: limit
      })
      return bewegungen
    } else if (method === 'POST') {
      const body = await readBody(event)

      // Create the movement
      const bewegung = await prisma.lagerbewegungen.create({
        data: {
          BestandID: body.BestandID,
          BenutzerID: body.BenutzerID || null,
          Bewegungstyp: body.Bewegungstyp,
          Menge: body.Menge,
          Referenznummer: body.Referenznummer || null,
          Referenztyp: body.Referenztyp || null,
          Kommentar: body.Kommentar || null
        }
      })

      // Update the stock level
      const bestand = await prisma.bestand.findUnique({
        where: { BestandID: body.BestandID }
      })

      if (bestand) {
        let newMenge = Number(bestand.Menge)
        if (body.Bewegungstyp === 'Eingang' || body.Bewegungstyp === 'Zugang' || body.Bewegungstyp === 'Korrektur_Plus') {
          newMenge += Number(body.Menge)
        } else if (body.Bewegungstyp === 'Ausgang' || body.Bewegungstyp === 'Abgang' || body.Bewegungstyp === 'Korrektur_Minus') {
          newMenge -= Number(body.Menge)
        }

        await prisma.bestand.update({
          where: { BestandID: body.BestandID },
          data: { Menge: Math.max(0, newMenge) }
        })
      }

      return { status: 201, data: bewegung }
    } else {
      return { status: 405, message: 'Methode nicht erlaubt' }
    }
  } catch (error: any) {
    console.error('Lagerbewegungen API Error:', error)
    return { status: 500, message: 'Interner Serverfehler', error: error.message }
  }
})
