import prisma from '../../lib/prisma'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const body = await readBody(event)

  try {
    if (!query.id) {
      return { status: 400, message: 'Standort-ID fehlt' }
    }
    if (!body) {
      return { status: 400, message: 'Keine Daten bereitgestellt' }
    }
    const standortId = parseInt(query.id as string);
    
    // Check for concurrency conflict using LetzteAenderung timestamp
    if (body.LetzteAenderung) {
      const currentStandort = await prisma.standorte.findUnique({
        where: { StandortID: standortId },
        select: { LetzteAenderung: true }
      });
      
      if (!currentStandort) {
        return { status: 404, message: 'Standort nicht gefunden' };
      }
      
      // Compare the timestamp from the client with the one in the database
      const clientTimestamp = new Date(body.LetzteAenderung).getTime();
      const serverTimestamp = currentStandort.LetzteAenderung ? new Date(currentStandort.LetzteAenderung).getTime() : 0;
      
      if (clientTimestamp !== serverTimestamp) {
        setResponseStatus(event, 409);
        return { status: 409, message: 'Konflikt: Die Daten wurden von einem anderen Benutzer geändert. Bitte aktualisieren Sie die Daten und versuchen Sie es erneut.' };
      }
    }
    
    const updatedStandort = await prisma.standorte.update({
      where: { StandortID: standortId },
      data: {
        Name: body.Name,
        Adresse: body.Adresse,
        PLZ: body.PLZ,
        Ort: body.Ort,
        Land: body.Land,
        Telefon: body.Telefon,
        Email: body.Email,
        Typ: body.Typ,
        LetzteAenderung: new Date() // Ensure the timestamp is updated
      }
    })
    return { status: 200, data: updatedStandort }
  } catch (error: any) {
    console.error(error)
    return { status: 500, message: 'Interner Serverfehler', error: error.message }
  }
})
