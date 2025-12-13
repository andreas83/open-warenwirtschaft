import prisma from '../../lib/prisma'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)

  try {
    if (query.id) {
      const buchung = await prisma.kassenbuchungen.findUnique({
        where: { BuchungsID: parseInt(query.id as string) },
        include: {
          Kassen: true,
          Benutzer: true,
          Kunden: true,
          Rechnungen: true
        }
      })
      if (!buchung) {
        return { status: 404, message: 'Kassenbuchung nicht gefunden' }
      }
      return buchung
    } else {
      const where: any = {};

      if (query.kasse) {
        where.KassenID = parseInt(query.kasse as string);
      }
      if (query.typ) {
        where.Buchungstyp = query.typ as string;
      }
      if (query.zahlungsart) {
        where.Zahlungsart = query.zahlungsart as string;
      }
      if (query.startDate && query.endDate) {
        where.Buchungsdatum = {
          gte: new Date(query.startDate as string),
          lte: new Date(query.endDate as string)
        };
      }
      if (query.search) {
        const search = query.search as string;
        where.OR = [
          { Beschreibung: { contains: search } },
          { Belegnummer: { contains: search } }
        ];
      }

      const buchungen = await prisma.kassenbuchungen.findMany({
        where,
        take: parseInt(query.limit as string) || 50,
        skip: parseInt(query.offset as string) || 0,
        include: {
          Kassen: true,
          Benutzer: true,
          Kunden: true,
          Rechnungen: true
        },
        orderBy: { Buchungsdatum: 'desc' }
      })
      return buchungen
    }
  } catch (error: any) {
    console.error(error)
    return { status: 500, message: 'Interner Serverfehler', error: error.message }
  }
})
