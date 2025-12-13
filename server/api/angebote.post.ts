import prisma from '../../lib/prisma'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)

  try {
    const angebot = await prisma.angebote.create({
      data: {
        KundenID: body.KundenID,
        ErstelltVonBenutzerID: body.ErstelltVonBenutzerID,
        Angebotsnummer: body.Angebotsnummer,
        Angebotstitel: body.Angebotstitel,
        Angebotsdatum: new Date(body.Angebotsdatum),
        Gueltigkeitsdatum: new Date(body.Gueltigkeitsdatum),
        Status: body.Status || 'Entwurf',
        GesamtsummeNetto: body.GesamtsummeNetto,
        MwSt_Gesamt: body.MwSt_Gesamt,
        GesamtsummeBrutto: body.GesamtsummeBrutto,
        Waehrung: body.Waehrung || 'EUR',
        Zahlungsbedingungen: body.Zahlungsbedingungen,
        Lieferbedingungen: body.Lieferbedingungen,
        Kommentare: body.Kommentare
      }
    })
    return angebot
  } catch (error: any) {
    console.error(error)
    return { status: 500, message: 'Fehler beim Erstellen des Angebots', error: error.message }
  }
})
