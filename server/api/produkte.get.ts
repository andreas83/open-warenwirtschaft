import prisma from '../../lib/prisma'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)

  try {
    const currentDate = new Date();
    if (query.id) {
      const produkt = await prisma.produkte.findUnique({
        where: { ProduktID: parseInt(query.id as string) },
        include: {
          Preise: {
            where: {
              GueltigAb: { lte: currentDate },
              OR: [
                { GueltigBis: { gte: currentDate } },
                { GueltigBis: null }
              ]
            }
          },
          ProduktZuKategorie: {
            include: {
              Produktkategorien: true
            }
          },
          ProduktBilder: true,
          ProduktLieferanten: {
            include: {
              Lieferanten: true
            }
          }
        }
      })
      if (!produkt) {
        return { status: 404, message: 'Produkt nicht gefunden' }
      }
      return produkt
    } else {
      const limit = parseInt(query.limit as string) || 10;
      const offset = parseInt(query.offset as string) || 0;
      const search = query.search as string | undefined;

      if (search) {
        const produkte = await prisma.produkte.findMany({
          where: {
            OR: [
              { Produktname: { contains: search } },
              { Beschreibung: { contains: search } }
            ]
          },
          include: {
            Preise: {
              where: {
                GueltigAb: { lte: currentDate },
                OR: [
                  { GueltigBis: { gte: currentDate } },
                  { GueltigBis: null }
                ]
              }
            },
            ProduktZuKategorie: {
              include: {
                Produktkategorien: true
              }
            },
            ProduktBilder: true,
            ProduktLieferanten: {
              include: {
                Lieferanten: true
              }
            }
          },
          take: limit,
          skip: offset
        });
        const totalCount = await prisma.produkte.count({
          where: {
            OR: [
              { Produktname: { contains: search } },
              { Beschreibung: { contains: search } }
            ]
          }
        });
        return { data: produkte, total: totalCount };
      } else {
        const produkte = await prisma.produkte.findMany({
        include: {
          Preise: {
            where: {
              GueltigAb: { lte: currentDate },
              OR: [
                { GueltigBis: { gte: currentDate } },
                { GueltigBis: null }
              ]
            }
          },
          ProduktZuKategorie: {
            include: {
              Produktkategorien: true
            }
          },
          ProduktBilder: true,
          ProduktLieferanten: {
            include: {
              Lieferanten: true
            }
          }
        },
          take: limit,
          skip: offset
        });
        const totalCount = await prisma.produkte.count();
        return { data: produkte, total: totalCount };
      }
    }
  } catch (error: any) {
    console.error(error)
    return { status: 500, message: 'Interner Serverfehler', error: error.message }
  }
})
