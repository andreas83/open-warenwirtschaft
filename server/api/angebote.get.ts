import prisma from '../../lib/prisma'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)

  try {
    if (query.id) {
      const angebot = await prisma.angebote.findUnique({
        where: { AngebotID: parseInt(query.id as string) },
        include: {
          Kunden: true,
          Benutzer: true,
          Bestellungen: true,
          Angebotspositionen: {
            include: {
              Produkte: true
            }
          }
        }
      })
      if (!angebot) {
        return { status: 404, message: 'Angebot nicht gefunden' }
      }
      return angebot
    } else {
      const angebote = await prisma.angebote.findMany({
        include: {
          Kunden: true,
          Angebotspositionen: true
        },
        take: parseInt(query.limit as string) || 10,
        skip: parseInt(query.offset as string) || 0
      })
      return angebote
    }
  } catch (error: any) {
    console.error(error)
    return { status: 500, message: 'Interner Serverfehler', error: error.message }
  }
})
