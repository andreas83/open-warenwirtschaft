import prisma from '../../lib/prisma'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)

  try {
    if (query.kundenid) {
      const kreditlimit = await prisma.kreditlimits.findUnique({
        where: { KundenID: parseInt(query.kundenid as string) },
        include: {
          Kunden: true,
          Mahnungen: true
        }
      })
      if (!kreditlimit) {
        return { status: 404, message: 'Kreditlimit nicht gefunden' }
      }
      return kreditlimit
    } else {
      const kreditlimits = await prisma.kreditlimits.findMany({
        include: {
          Kunden: true,
          Mahnungen: true
        },
        take: parseInt(query.limit as string) || 10,
        skip: parseInt(query.offset as string) || 0
      })
      return kreditlimits
    }
  } catch (error: any) {
    console.error(error)
    return { status: 500, message: 'Interner Serverfehler', error: error.message }
  }
})
