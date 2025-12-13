import prisma from '../../lib/prisma'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)

  try {
    if (query.id) {
      const vertreter = await prisma.vertreter.findUnique({
        where: { VertreterID: parseInt(query.id as string) },
        include: {
          KundenVertreter: {
            include: {
              Kunden: true
            }
          },
          Provisionen: true
        }
      })
      if (!vertreter) {
        return { status: 404, message: 'Vertreter nicht gefunden' }
      }
      return vertreter
    } else {
      const vertreter = await prisma.vertreter.findMany({
        include: {
          KundenVertreter: true,
          Provisionen: true
        },
        take: parseInt(query.limit as string) || 10,
        skip: parseInt(query.offset as string) || 0
      })
      return vertreter
    }
  } catch (error: any) {
    console.error(error)
    return { status: 500, message: 'Interner Serverfehler', error: error.message }
  }
})
