import prisma from '../../lib/prisma'

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)

    const kasse = await prisma.kassen.create({
      data: {
        Kassenbezeichnung: body.Kassenbezeichnung,
        StandortID: body.StandortID ? parseInt(body.StandortID) : null,
        Kassennummer: body.Kassennummer,
        Anfangsbestand: body.Anfangsbestand ? parseFloat(body.Anfangsbestand) : 0,
        AktuellerBestand: body.AktuellerBestand ? parseFloat(body.AktuellerBestand) : 0,
        Waehrung: body.Waehrung || 'EUR',
        Status: body.Status || 'Aktiv'
      },
      include: {
        Standorte: true
      }
    })

    return kasse
  } catch (error: any) {
    console.error(error)
    return { status: 500, message: 'Fehler beim Erstellen der Kasse', error: error.message }
  }
})
