import prisma from '../../lib/prisma'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)

  try {
    const vertrag = await prisma.preisvertraege.create({
      data: {
        KundenID: body.KundenID,
        Vertragsnummer: body.Vertragsnummer,
        Vertragsbezeichnung: body.Vertragsbezeichnung,
        Beschreibung: body.Beschreibung,
        GueltigAb: new Date(body.GueltigAb),
        GueltigBis: body.GueltigBis ? new Date(body.GueltigBis) : null,
        Status: body.Status || 'Aktiv',
        Zahlungsbedingungen: body.Zahlungsbedingungen,
        Mindestabnahme: body.Mindestabnahme,
        Waehrung: body.Waehrung || 'EUR',
        Kommentare: body.Kommentare
      }
    })
    return vertrag
  } catch (error: any) {
    console.error(error)
    return { status: 500, message: 'Fehler beim Erstellen des Preisvertrags', error: error.message }
  }
})
