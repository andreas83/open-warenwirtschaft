import prisma from '~/lib/prisma'

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    const id = body.TischID || parseInt(getQuery(event).id as string)

    if (!id) {
      throw createError({ statusCode: 400, message: 'Tisch-ID ist erforderlich' })
    }

    const table = await prisma.restaurantTische.update({
      where: { TischID: id },
      data: {
        Tischnummer: body.Tischnummer,
        BereichID: body.BereichID || null,
        Kapazitaet: body.Kapazitaet,
        Status: body.Status,
        PositionX: body.PositionX || null,
        PositionY: body.PositionY || null,
        Form: body.Form || null,
        Beschreibung: body.Beschreibung || null,
        IstAktiv: body.IstAktiv,
        LetzteAenderung: new Date()
      },
      include: {
        Tischbereiche: true
      }
    })

    return table
  } catch (error: any) {
    console.error('Error updating table:', error)
    throw createError({
      statusCode: error.statusCode || 500,
      message: error.message || 'Fehler beim Aktualisieren des Tisches'
    })
  }
})
