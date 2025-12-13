import prisma from '../../lib/prisma'

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)

    // Start a transaction to update cash register balance
    const result = await prisma.$transaction(async (tx) => {
      // Create the booking
      const buchung = await tx.kassenbuchungen.create({
        data: {
          KassenID: parseInt(body.KassenID),
          BenutzerID: body.BenutzerID ? parseInt(body.BenutzerID) : null,
          RechnungsID: body.RechnungsID ? parseInt(body.RechnungsID) : null,
          KundenID: body.KundenID ? parseInt(body.KundenID) : null,
          Buchungsdatum: body.Buchungsdatum ? new Date(body.Buchungsdatum) : new Date(),
          Buchungstyp: body.Buchungstyp,
          Betrag: parseFloat(body.Betrag),
          Zahlungsart: body.Zahlungsart,
          Beschreibung: body.Beschreibung,
          Belegnummer: body.Belegnummer
        },
        include: {
          Kassen: true,
          Benutzer: true,
          Kunden: true,
          Rechnungen: true
        }
      })

      // Update cash register balance
      const kasse = await tx.kassen.findUnique({
        where: { KassenID: parseInt(body.KassenID) }
      })

      if (kasse) {
        let neuerBestand = parseFloat(kasse.AktuellerBestand.toString())
        const betrag = parseFloat(body.Betrag)

        // Einnahme and Einlage increase balance
        if (body.Buchungstyp === 'Einnahme' || body.Buchungstyp === 'Einlage') {
          neuerBestand += betrag
        }
        // Ausgabe and Entnahme decrease balance
        else if (body.Buchungstyp === 'Ausgabe' || body.Buchungstyp === 'Entnahme') {
          neuerBestand -= betrag
        }

        await tx.kassen.update({
          where: { KassenID: parseInt(body.KassenID) },
          data: {
            AktuellerBestand: neuerBestand,
            LetzteAenderung: new Date()
          }
        })
      }

      return buchung
    })

    return result
  } catch (error: any) {
    console.error(error)
    return { status: 500, message: 'Fehler beim Erstellen der Kassenbuchung', error: error.message }
  }
})
