import prisma from '~/lib/prisma'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)

  try {
    // Convert etage to integer or null
    const etage = body.etage !== '' && body.etage != null ? parseInt(body.etage) : null

    const room = await prisma.zimmer.create({
      data: {
        Zimmernummer: body.zimmernummer,
        ZimmerkategorieID: body.zimmerkategorieID,
        StandortID: body.standortID || null,
        Etage: isNaN(etage) ? null : etage,
        Status: body.status || 'Verfuegbar',
        Beschreibung: body.beschreibung || null,
        Ausstattung: body.ausstattung ? JSON.stringify(body.ausstattung) : null,
        PreisProNacht: body.preisProNacht,
        MaxPersonen: body.maxPersonen || 2,
        IstRaucherZimmer: body.istRaucherZimmer || false,
        IstBarrierfrei: body.istBarrierfrei || false,
        IstAktiv: body.istAktiv !== undefined ? body.istAktiv : true,
        Notizen: body.notizen || null
      },
      include: {
        Zimmerkategorien: true,
        Standorte: true
      }
    })

    return room
  } catch (error: any) {
    console.error('Error creating room:', error)
    throw createError({
      statusCode: 500,
      message: error.message || 'Fehler beim Erstellen des Zimmers'
    })
  }
})
