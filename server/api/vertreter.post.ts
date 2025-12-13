import prisma from '../../lib/prisma'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)

  try {
    const vertreter = await prisma.vertreter.create({
      data: {
        Vertreternummer: body.Vertreternummer,
        Vorname: body.Vorname,
        Nachname: body.Nachname,
        Email: body.Email,
        Telefon: body.Telefon,
        Gebiet: body.Gebiet,
        Provisionssatz: body.Provisionssatz,
        Status: body.Status || 'Aktiv',
        Einstellungsdatum: body.Einstellungsdatum ? new Date(body.Einstellungsdatum) : null
      }
    })
    return vertreter
  } catch (error: any) {
    console.error(error)
    return { status: 500, message: 'Fehler beim Erstellen des Vertreters', error: error.message }
  }
})
