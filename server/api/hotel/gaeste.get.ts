import prisma from '~/lib/prisma'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)

  try {
    const buchungsId = query.buchungsId ? parseInt(query.buchungsId as string) : undefined

    if (!buchungsId) {
      throw createError({ statusCode: 400, message: 'Buchungs-ID erforderlich' })
    }

    const guests = await prisma.hotelGaeste.findMany({
      where: {
        BuchungsID: buchungsId
      },
      orderBy: [
        { IstHauptgast: 'desc' },
        { Nachname: 'asc' }
      ]
    })

    return guests
  } catch (error: any) {
    console.error('Error fetching guests:', error)
    throw createError({
      statusCode: error.statusCode || 500,
      message: error.message || 'Fehler beim Laden der Gäste'
    })
  }
})
