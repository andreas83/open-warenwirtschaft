import prisma from '../../lib/prisma'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)

  try {
    if (query.id) {
      const umsatzsteuersatz = await prisma.umsatzsteuersaetze.findUnique({
        where: { UmsatzsteuersatzID: parseInt(query.id as string) }
      })
      if (!umsatzsteuersatz) {
        return { status: 404, message: 'Umsatzsteuersatz nicht gefunden' }
      }
      return umsatzsteuersatz
    } else {
      const umsatzsteuersaetze = await prisma.umsatzsteuersaetze.findMany({
        take: parseInt(query.limit as string) || 10,
        skip: parseInt(query.offset as string) || 0
      })
      return umsatzsteuersaetze
    }
  } catch (error: any) {
    console.error(error)
    return { status: 500, message: 'Interner Serverfehler', error: error.message }
  }
})
