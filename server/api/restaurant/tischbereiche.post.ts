import prisma from '~/lib/prisma'

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)

    const section = await prisma.tischbereiche.create({
      data: {
        Name: body.Name,
        Beschreibung: body.Beschreibung || null,
        StandortID: body.StandortID || null,
        Farbe: body.Farbe || null,
        SortOrder: body.SortOrder || 0,
        IstAktiv: body.IstAktiv !== undefined ? body.IstAktiv : true
      },
      include: {
        Standorte: true
      }
    })

    return section
  } catch (error: any) {
    console.error('Error creating table section:', error)
    throw createError({
      statusCode: 500,
      message: error.message || 'Fehler beim Erstellen des Tischbereichs'
    })
  }
})
