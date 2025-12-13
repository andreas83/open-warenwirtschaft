import prisma from '../../lib/prisma'

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    const query = getQuery(event)

    if (!query.id) {
      return { status: 400, message: 'Buchungs-ID erforderlich' }
    }

    const buchung = await prisma.kassenbuchungen.update({
      where: { BuchungsID: parseInt(query.id as string) },
      data: {
        KassenID: body.KassenID ? parseInt(body.KassenID) : undefined,
        BenutzerID: body.BenutzerID ? parseInt(body.BenutzerID) : undefined,
        RechnungsID: body.RechnungsID ? parseInt(body.RechnungsID) : undefined,
        KundenID: body.KundenID ? parseInt(body.KundenID) : undefined,
        Buchungsdatum: body.Buchungsdatum ? new Date(body.Buchungsdatum) : undefined,
        Buchungstyp: body.Buchungstyp,
        Betrag: body.Betrag ? parseFloat(body.Betrag) : undefined,
        Zahlungsart: body.Zahlungsart,
        Beschreibung: body.Beschreibung,
        Belegnummer: body.Belegnummer,
        LetzteAenderung: new Date()
      },
      include: {
        Kassen: true,
        Benutzer: true,
        Kunden: true,
        Rechnungen: true
      }
    })

    return buchung
  } catch (error: any) {
    console.error(error)
    return { status: 500, message: 'Fehler beim Aktualisieren der Kassenbuchung', error: error.message }
  }
})
