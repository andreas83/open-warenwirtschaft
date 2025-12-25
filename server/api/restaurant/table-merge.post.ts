import prisma from '~/lib/prisma'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { HauptTischID, TischIDs } = body

  if (!HauptTischID || !TischIDs || !Array.isArray(TischIDs) || TischIDs.length === 0) {
    throw createError({
      statusCode: 400,
      statusMessage: 'HauptTischID und TischIDs (Array) sind erforderlich'
    })
  }

  // Check if all tables are available or already part of a merge
  const tische = await prisma.restaurantTische.findMany({
    where: {
      TischID: {
        in: [HauptTischID, ...TischIDs]
      }
    }
  })

  if (tische.length !== TischIDs.length + 1) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Nicht alle Tische gefunden'
    })
  }

  // Create merge record
  const zusammenlegung = await prisma.tischZusammenlegung.create({
    data: {
      HauptTischID,
      IstAktiv: true
    }
  })

  // Add detail records for each merged table
  for (const tischId of TischIDs) {
    await prisma.tischZusammenlegungDetail.create({
      data: {
        ZusammenlegungID: zusammenlegung.ZusammenlegungID,
        TischID: tischId
      }
    })
  }

  // Update table statuses
  await prisma.restaurantTische.updateMany({
    where: {
      TischID: {
        in: [...TischIDs]
      }
    },
    data: {
      Status: 'Besetzt'
    }
  })

  return zusammenlegung
})
