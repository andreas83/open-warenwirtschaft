import prisma from '../../lib/prisma'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)

  try {
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
        return { status: 404, message: 'Lieferung nicht gefunden' }
      }
      return lieferung
    } else {
      const lieferungen = await prisma.lieferungen.findMany({
        include: {
          Bestellungen: true,
          Touren: true
        },
        take: parseInt(query.limit as string) || 10,
        skip: parseInt(query.offset as string) || 0
      })
      return lieferungen
    }
  } catch (error: any) {
    console.error(error)
    return { status: 500, message: 'Interner Serverfehler', error: error.message }
  }
})
