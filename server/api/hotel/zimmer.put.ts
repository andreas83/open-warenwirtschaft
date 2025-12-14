import prisma from '~/lib/prisma'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)

  try {
    // Convert etage to integer or null
    const etage = body.etage !== '' && body.etage != null ? parseInt(body.etage) : null

    const room = await prisma.zimmer.update({
      where: { ZimmerID: body.id },
      data: {
        Zimmernummer: body.zimmernummer,
        ZimmerkategorieID: body.zimmerkategorieID,
        StandortID: body.standortID || null,
        Etage: isNaN(etage) ? null : etage,
        Status: body.status,
        Beschreibung: body.beschreibung || null,
        Ausstattung: body.ausstattung ? JSON.stringify(body.ausstattung) : null,
        PreisProNacht: body.preisProNacht,
        MaxPersonen: body.maxPersonen,
        IstRaucherZimmer: body.istRaucherZimmer,
        IstBarrierfrei: body.istBarrierfrei,
        IstAktiv: body.istAktiv,
        LetzteReinigung: body.letzteReinigung,
        Notizen: body.notizen || null
      },
      include: {
        Zimmerkategorien: true,
        Standorte: true
      }
    })

    return room
  } catch (error: any) {
    console.error('Error updating room:', error)
    throw createError({
      statusCode: 500,
      message: error.message || 'Fehler beim Aktualisieren des Zimmers'
    })
  }
})
