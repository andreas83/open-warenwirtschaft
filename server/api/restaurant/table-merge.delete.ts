import prisma from '~/lib/prisma'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const id = parseInt(query.id as string)

  if (!id) {
    throw createError({
      statusCode: 400,
      statusMessage: 'ID ist erforderlich'
    })
  }

  // Get merge details
  const zusammenlegung = await prisma.tischZusammenlegung.findUnique({
    where: { ZusammenlegungID: id },
    include: {
      TischZusammenlegungDetails: true
    }
  })

  if (!zusammenlegung) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Zusammenlegung nicht gefunden'
    })
  }

  // Update timestamp
  await prisma.tischZusammenlegung.update({
    where: { ZusammenlegungID: id },
    data: {
      IstAktiv: false,
      AufgeloestAm: new Date()
    }
  })

  // Update table statuses back to available
  const tischIds = zusammenlegung.TischZusammenlegungDetails.map(d => d.TischID)
  await prisma.restaurantTische.updateMany({
    where: {
      TischID: {
        in: tischIds
      }
    },
    data: {
      Status: 'Verfuegbar'
    }
  })

  return { success: true }
})
