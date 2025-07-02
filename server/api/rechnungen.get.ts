import prisma from '../../lib/prisma'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)

  try {
    if (query.id) {
      const rechnung = await prisma.rechnungen.findUnique({
        where: { RechnungsID: parseInt(query.id as string) },
        include: {
          Kunden: true,
          Bestellungen: true,
          Benutzer: true,
          Rechnungspositionen: {
            include: {
              Produkte: true,
              Rabatte: true
            }
          },
          RechnungsRabatte: {
            include: {
              Rabatte: true
            }
          }
        }
      })
      if (!rechnung) {
        return { status: 404, message: 'Rechnung nicht gefunden' }
      }
      return rechnung
    } else {
      const where: any = {};
      if (query.status) {
        where.Zahlungsstatus = query.status as string;
      }
      if (query.kunde) {
        where.KundenID = parseInt(query.kunde as string);
      }
      if (query.startDate && query.endDate) {
        where.Rechnungsdatum = {
          gte: new Date(query.startDate as string),
          lte: new Date(query.endDate as string)
        };
      }
      if (query.search) {
        const search = query.search as string;
        where.OR = [
          { Rechnungsnummer: { contains: search } },
          { Kunden: { Firmenname: { contains: search } } },
          { Kunden: { Vorname: { contains: search } } },
          { Kunden: { Nachname: { contains: search } } }
        ];
      }

      const rechnungen = await prisma.rechnungen.findMany({
        where,
        take: parseInt(query.limit as string) || 10,
        skip: parseInt(query.offset as string) || 0,
        include: {
          Kunden: true,
          Rechnungspositionen: {
            include: {
              Produkte: true,
              Rabatte: true
            }
          },
          RechnungsRabatte: {
            include: {
              Rabatte: true
            }
          }
        }
      })
      return rechnungen
    }
  } catch (error: any) {
    console.error(error)
    return { status: 500, message: 'Interner Serverfehler', error: error.message }
  }
})
