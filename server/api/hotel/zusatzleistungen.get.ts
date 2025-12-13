import prisma from '~/lib/prisma'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)

  try {
    const buchungsId = query.buchungsId ? parseInt(query.buchungsId as string) : undefined

    if (!buchungsId) {
      throw createError({ statusCode: 400, message: 'Buchungs-ID erforderlich' })
    }

    const services = await prisma.hotelZusatzleistungen.findMany({
      where: {
        BuchungsID: buchungsId
      },
      include: {
        Benutzer: true
      },
      orderBy: {
        Datum: 'desc'
      }
    })

    return services
  } catch (error: any) {
    console.error('Error fetching additional services:', error)
    throw createError({
      statusCode: error.statusCode || 500,
      message: error.message || 'Fehler beim Laden der Zusatzleistungen'
    })
  }
})
