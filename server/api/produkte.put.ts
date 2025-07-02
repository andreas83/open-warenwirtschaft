import prisma from '../../lib/prisma'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const body = await readBody(event)

  try {
    if (!query.id) {
      return { status: 400, message: 'Produkt-ID fehlt' }
    }
    if (!body) {
      return { status: 400, message: 'Keine Daten bereitgestellt' }
    }
    const produktId = parseInt(query.id as string);
    
    // Check for concurrency conflict using LetzteAenderung timestamp
    if (body.LetzteAenderung) {
      const currentProdukt = await prisma.produkte.findUnique({
        where: { ProduktID: produktId },
        select: { LetzteAenderung: true }
      });
      
      if (!currentProdukt) {
        return { status: 404, message: 'Produkt nicht gefunden' };
      }
      
      // Compare the timestamp from the client with the one in the database
      const clientTimestamp = new Date(body.LetzteAenderung).getTime();
      const serverTimestamp = currentProdukt.LetzteAenderung ? new Date(currentProdukt.LetzteAenderung).getTime() : 0;
      
      if (clientTimestamp !== serverTimestamp) {
        setResponseStatus(event, 409);
        return { status: 409, message: 'Konflikt: Die Daten wurden von einem anderen Benutzer geändert. Bitte aktualisieren Sie die Daten und versuchen Sie es erneut.' };
      }
    }
    
    const updatedProdukt = await prisma.produkte.update({
      where: { ProduktID: produktId },
      data: {
        Produktname: body.Produktname,
        Beschreibung: body.Beschreibung,
        Artikelnummer: body.Artikelnummer,
        EAN_Code: body.EAN_Code,
        EinheitID: body.EinheitID,
        UmsatzsteuersatzID: body.UmsatzsteuersatzID,
        Hersteller: body.Hersteller,
        Gewicht: body.Gewicht ? parseFloat(body.Gewicht) : null,
        Volumen: body.Volumen ? parseFloat(body.Volumen) : null,
        LetzteAenderung: new Date() // Ensure the timestamp is updated
      }
    });

    // Update product categories if provided
    if (body.Kategorien && Array.isArray(body.Kategorien)) {
      // First, remove existing category associations
      await prisma.produktZuKategorie.deleteMany({
        where: { ProduktID: produktId }
      });
      
      // Then, create new category associations
      const categoryData = body.Kategorien.map((kategorieId: number) => ({
        ProduktID: produktId,
        KategorieID: kategorieId
      }));
      
      await prisma.produktZuKategorie.createMany({
        data: categoryData
      });
    }

    // Update product suppliers if provided
    if (body.LieferantenDetails && Array.isArray(body.LieferantenDetails)) {
      // First, remove existing supplier associations
      await prisma.produktLieferanten.deleteMany({
        where: { ProduktID: produktId }
      });
      
      // Then, create new supplier associations with details
      const supplierData = body.LieferantenDetails.map((detail: any) => ({
        ProduktID: produktId,
        LieferantenID: detail.LieferantenID,
        LieferantenArtikelnummer: detail.LieferantenArtikelnummer || null,
        Lieferzeit: detail.Lieferzeit ? parseInt(detail.Lieferzeit) : null,
        Mindestbestellmenge: detail.Mindestbestellmenge ? parseInt(detail.Mindestbestellmenge) : null,
        PreisBeimLieferanten: detail.PreisBeimLieferanten ? parseFloat(detail.PreisBeimLieferanten) : null,
        WaehrungLieferant: detail.WaehrungLieferant || 'EUR'
      }));
      
      await prisma.produktLieferanten.createMany({
        data: supplierData
      });
    }

    // Fetch the updated product with categories and suppliers
    const produktWithRelations = await prisma.produkte.findUnique({
      where: { ProduktID: produktId },
      include: {
        ProduktZuKategorie: {
          include: {
            Produktkategorien: true
          }
        },
        ProduktLieferanten: {
          include: {
            Lieferanten: true
          }
        }
      }
    });

    return { status: 200, data: produktWithRelations }
  } catch (error: any) {
    console.error(error)
    return { status: 500, message: 'Interner Serverfehler', error: error.message }
  }
})
