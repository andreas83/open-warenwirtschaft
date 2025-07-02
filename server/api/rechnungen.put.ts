import prisma from '../../lib/prisma'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const body = await readBody(event)

  try {
    if (!query.id) {
      return { status: 400, message: 'Rechnungs-ID fehlt' }
    }
    if (!body) {
      return { status: 400, message: 'Keine Daten bereitgestellt' }
    }
    const rechnungsId = parseInt(query.id as string);

    // Check for concurrency conflict using LetzteAenderung timestamp
    if (body.LetzteAenderung) {
      const currentRechnung = await prisma.rechnungen.findUnique({
        where: { RechnungsID: rechnungsId },
        select: { LetzteAenderung: true }
      });
      
      if (!currentRechnung) {
        return { status: 404, message: 'Rechnung nicht gefunden' };
      }
      
      // Compare the timestamp from the client with the one in the database
      const clientTimestamp = new Date(body.LetzteAenderung).getTime();
      const serverTimestamp = currentRechnung.LetzteAenderung ? new Date(currentRechnung.LetzteAenderung).getTime() : 0;
      
      if (clientTimestamp !== serverTimestamp) {
        setResponseStatus(event, 409);
        return { status: 409, message: 'Konflikt: Die Daten wurden von einem anderen Benutzer geändert. Bitte aktualisieren Sie die Daten und versuchen Sie es erneut.' };
      }
    }

    // Start a transaction to ensure data consistency
    const updatedRechnung = await prisma.$transaction(async (tx) => {
      // Update the main invoice data
      const rechnung = await tx.rechnungen.update({
        where: { RechnungsID: rechnungsId },
        data: {
          BestellID: body.BestellID,
          KundenID: body.KundenID,
          ErstelltVonBenutzerID: body.ErstelltVonBenutzerID,
          Rechnungsnummer: body.Rechnungsnummer,
          Rechnungsdatum: body.Rechnungsdatum ? new Date(body.Rechnungsdatum) : undefined,
          Faelligkeitsdatum: body.Faelligkeitsdatum ? new Date(body.Faelligkeitsdatum) : undefined,
          Rechnungsadresse: body.Rechnungsadresse,
          Zahlungsstatus: body.Zahlungsstatus,
          GesamtbetragNetto: body.GesamtbetragNetto,
          MwSt_Gesamt: body.MwSt_Gesamt,
          GesamtrabattBetrag: body.GesamtrabattBetrag,
          GesamtbetragBrutto: body.GesamtbetragBrutto,
          Mahnstufe: body.Mahnstufe,
          Waehrung: body.Waehrung,
          Kommentare: body.Kommentare,
          StorniertAm: body.StorniertAm ? new Date(body.StorniertAm) : undefined,
          LetzteAenderung: new Date() // Ensure the timestamp is updated
        }
      });

      // Delete existing Rechnungspositionen and RechnungsRabatte to avoid duplicates
      if (body.Rechnungspositionen && body.Rechnungspositionen.length > 0) {
        await tx.rechnungspositionen.deleteMany({
          where: { RechnungsID: rechnungsId }
        });

        // Create new Rechnungspositionen
        await tx.rechnungspositionen.createMany({
          data: body.Rechnungspositionen.map((position: { ProduktID: number; Menge: number; EinzelpreisNetto: number; RabattID: number | null; RabattProzentPosition: number; RabattBetragPosition: number; GesamtpreisNettoPosition: number; MwSt_Satz: number; MwSt_Betrag: number; Beschreibung: string }) => ({
            RechnungsID: rechnungsId,
            ProduktID: position.ProduktID,
            Menge: position.Menge,
            EinzelpreisNetto: position.EinzelpreisNetto,
            RabattID: position.RabattID,
            RabattProzentPosition: position.RabattProzentPosition,
            RabattBetragPosition: position.RabattBetragPosition,
            GesamtpreisNettoPosition: position.GesamtpreisNettoPosition,
            MwSt_Satz: position.MwSt_Satz,
            MwSt_Betrag: position.MwSt_Betrag,
            Beschreibung: position.Beschreibung
          }))
        });
      }

      // Delete existing RechnungsRabatte and recreate them
      if (body.RechnungsRabatte && body.RechnungsRabatte.length > 0) {
        await tx.rechnungsRabatte.deleteMany({
          where: { RechnungsID: rechnungsId }
        });

        // Create new RechnungsRabatte
        await tx.rechnungsRabatte.createMany({
          data: body.RechnungsRabatte.map((rabatt: { RabattID: number; AngewendeterWert: number | null; AngewendeterBetrag: number }) => ({
            RechnungsID: rechnungsId,
            RabattID: rabatt.RabattID,
            AngewendeterWert: rabatt.AngewendeterWert,
            AngewendeterBetrag: rabatt.AngewendeterBetrag
          }))
        });
      }

      // Fetch the updated invoice with related data
      return await tx.rechnungen.findUnique({
        where: { RechnungsID: rechnungsId },
        include: {
          Rechnungspositionen: true,
          RechnungsRabatte: true
        }
      });
    });

    return { status: 200, data: updatedRechnung }
  } catch (error: any) {
    console.error(error)
    return { status: 500, message: 'Interner Serverfehler', error: error.message }
  }
})
