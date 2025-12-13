import prisma from '../../lib/prisma'

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    const query = getQuery(event)

    if (!query.id) {
      return { status: 400, message: 'Kassen-ID erforderlich' }
    }

    const kasse = await prisma.kassen.update({
      where: { KassenID: parseInt(query.id as string) },
      data: {
        Kassenbezeichnung: body.Kassenbezeichnung,
        StandortID: body.StandortID ? parseInt(body.StandortID) : null,
        Kassennummer: body.Kassennummer,
        Anfangsbestand: body.Anfangsbestand ? parseFloat(body.Anfangsbestand) : undefined,
        AktuellerBestand: body.AktuellerBestand ? parseFloat(body.AktuellerBestand) : undefined,
        Waehrung: body.Waehrung,
        Status: body.Status,
        LetzteAenderung: new Date()
      },
      include: {
        Standorte: true
      }
    })

    return kasse
  } catch (error: any) {
    console.error(error)
    return { status: 500, message: 'Fehler beim Aktualisieren der Kasse', error: error.message }
  }
})
