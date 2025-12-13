import prisma from '../../lib/prisma'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)

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
        return { status: 404, message: 'Preisvertrag nicht gefunden' }
      }
      return vertrag
    } else {
      const vertraege = await prisma.preisvertraege.findMany({
        include: {
          Kunden: true,
          Vertragspositionen: true
        },
        take: parseInt(query.limit as string) || 10,
        skip: parseInt(query.offset as string) || 0
      })
      return vertraege
    }
  } catch (error: any) {
    console.error(error)
    return { status: 500, message: 'Interner Serverfehler', error: error.message }
  }
})
