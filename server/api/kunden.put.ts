import prisma from '../../lib/prisma'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const body = await readBody(event)

  try {
    if (!query.id) {
      return { status: 400, message: 'Kunden-ID fehlt' }
    }
    if (!body) {
      return { status: 400, message: 'Keine Daten bereitgestellt' }
    }
    const kundenId = parseInt(query.id as string);
    
    // Check for concurrency conflict using LetzteAenderung timestamp
    if (body.LetzteAenderung) {
      const currentKunde = await prisma.kunden.findUnique({
        where: { KundenID: kundenId },
        select: { LetzteAenderung: true }
      });
      
      if (!currentKunde) {
        return { status: 404, message: 'Kunde nicht gefunden' };
      }
      
      // Compare the timestamp from the client with the one in the database
      const clientTimestamp = new Date(body.LetzteAenderung).getTime();
      const serverTimestamp = currentKunde.LetzteAenderung ? new Date(currentKunde.LetzteAenderung).getTime() : 0;
      
      if (clientTimestamp !== serverTimestamp) {
        setResponseStatus(event, 409);
        return { status: 409, message: 'Konflikt: Die Daten wurden von einem anderen Benutzer geändert. Bitte aktualisieren Sie die Daten und versuchen Sie es erneut.' };
      }
    }
    
    const updatedKunde = await prisma.kunden.update({
      where: { KundenID: kundenId },
      data: {
        Kundennummer: body.Kundennummer,
        KundengruppeID: body.KundengruppeID,
        Firmenname: body.Firmenname,
        Anrede: body.Anrede,
        Vorname: body.Vorname,
        Nachname: body.Nachname,
        Adresse: body.Adresse,
        PLZ: body.PLZ,
        Ort: body.Ort,
        Land: body.Land,
        Telefon: body.Telefon,
        Email: body.Email,
        UmsatzsteuerID: body.UmsatzsteuerID,
        Kundenstatus: body.Kundenstatus,
        Zahlungsbedingungen: body.Zahlungsbedingungen,
        LetzteAenderung: new Date() // Ensure the timestamp is updated
      }
    })
    return { status: 200, data: updatedKunde }
  } catch (error: any) {
    console.error(error)
    return { status: 500, message: 'Interner Serverfehler', error: error.message }
  }
})
