import prisma from '../../lib/prisma'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)

  try {
    if (query.id) {
      const standort = await prisma.standorte.findUnique({
        where: { StandortID: parseInt(query.id as string) }
      })
      if (!standort) {
        return { status: 404, message: 'Standort nicht gefunden' }
      }
      return standort
    } else {
      const limit = parseInt(query.limit as string) || 10;
      const offset = parseInt(query.offset as string) || 0;
      const search = query.search as string | undefined;

      if (search) {
        const standorte = await prisma.standorte.findMany({
          where: {
            OR: [
              { Name: { contains: search } },
              { Ort: { contains: search } },
              { Adresse: { contains: search } }
            ]
          },
          take: limit,
          skip: offset
        });
        return standorte;
      } else {
        const standorte = await prisma.standorte.findMany({
          take: limit,
          skip: offset
        });
        return standorte;
      }
    }
  } catch (error: any) {
    console.error(error)
    return { status: 500, message: 'Interner Serverfehler', error: error.message }
  }
})
