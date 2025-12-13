import prisma from '../../lib/prisma'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)

  try {
    const lieferung = await prisma.lieferungen.create({
      data: {
        BestellID: body.BestellID,
        Liefernummer: body.Liefernummer,
        Lieferdatum: body.Lieferdatum ? new Date(body.Lieferdatum) : null,
        GeplantesLieferdatum: body.GeplantesLieferdatum ? new Date(body.GeplantesLieferdatum) : null,
        LieferadresseID: body.LieferadresseID,
        TourID: body.TourID,
        Status: body.Status || 'Geplant',
        TrackingNummer: body.TrackingNummer,
        Lieferant: body.Lieferant,
        Kommentare: body.Kommentare
      }
    })
    return lieferung
  } catch (error: any) {
    console.error(error)
    return { status: 500, message: 'Fehler beim Erstellen der Lieferung', error: error.message }
  }
})
