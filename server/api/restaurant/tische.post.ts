import prisma from '~/lib/prisma'

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)

    const table = await prisma.restaurantTische.create({
      data: {
        Tischnummer: body.Tischnummer,
        BereichID: body.BereichID || null,
        Kapazitaet: body.Kapazitaet || 4,
        Status: body.Status || 'Verfuegbar',
        PositionX: body.PositionX || null,
        PositionY: body.PositionY || null,
        Form: body.Form || null,
        Beschreibung: body.Beschreibung || null,
        IstAktiv: body.IstAktiv !== undefined ? body.IstAktiv : true
      },
      include: {
        Tischbereiche: true
      }
    })

    return table
  } catch (error: any) {
    console.error('Error creating table:', error)
    throw createError({
      statusCode: 500,
      message: error.message || 'Fehler beim Erstellen des Tisches'
    })
  }
})
