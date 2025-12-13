import prisma from '../../lib/prisma'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)

  try {
    if (query.id) {
      const kasse = await prisma.kassen.findUnique({
        where: { KassenID: parseInt(query.id as string) },
        include: {
          Standorte: true,
          Kassenbuchungen: {
            take: 10,
            orderBy: { Buchungsdatum: 'desc' },
            include: {
              Benutzer: true,
              Kunden: true,
              Rechnungen: true
            }
          }
        }
      })
      if (!kasse) {
        return { status: 404, message: 'Kasse nicht gefunden' }
      }
      return kasse
    } else {
      const where: any = {};
      if (query.status) {
        where.Status = query.status as string;
      }
      if (query.standort) {
        where.StandortID = parseInt(query.standort as string);
      }
      if (query.search) {
        const search = query.search as string;
        where.OR = [
          { Kassenbezeichnung: { contains: search } },
          { Kassennummer: { contains: search } }
        ];
      }

      const kassen = await prisma.kassen.findMany({
        where,
        take: parseInt(query.limit as string) || 100,
        skip: parseInt(query.offset as string) || 0,
        include: {
          Standorte: true
        },
        orderBy: { Erstelldatum: 'desc' }
      })
      return kassen
    }
  } catch (error: any) {
    console.error(error)
    return { status: 500, message: 'Interner Serverfehler', error: error.message }
  }
})
