import prisma from '../../lib/prisma'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)

  try {
    if (query.id) {
      const kunde = await prisma.kunden.findUnique({
        where: { KundenID: parseInt(query.id as string) }
      })
      if (!kunde) {
        return { status: 404, message: 'Kunde nicht gefunden' }
      }
      return kunde
    } else {
      const kunden = await prisma.kunden.findMany({
        take: parseInt(query.limit as string) || 10,
        skip: parseInt(query.offset as string) || 0
      })
      return kunden
    }
  } catch (error: any) {
    console.error(error)
    return { status: 500, message: 'Interner Serverfehler', error: error.message }
  }
})
