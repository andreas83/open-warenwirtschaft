import prisma from '../../lib/prisma'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)

  try {
    if (!body) {
      return { status: 400, message: 'Keine Daten bereitgestellt' }
    }
    if (!body.Produktname) {
      return { status: 400, message: 'Produktname ist erforderlich' }
    }
    const newProdukt = await prisma.produkte.create({
      data: {
        Produktname: body.Produktname,
        Beschreibung: body.Beschreibung,
        Artikelnummer: body.Artikelnummer,
        EAN_Code: body.EAN_Code,
        Hersteller: body.Hersteller,
        Gewicht: body.Gewicht ? parseFloat(body.Gewicht) : null,
        Volumen: body.Volumen ? parseFloat(body.Volumen) : null,
        Umsatzsteuersaetze: {
          connect: { UmsatzsteuersatzID: body.UmsatzsteuersatzID }
        },
        Einheiten: {
          connect: { EinheitID: body.EinheitID }
        },
        ProduktLieferanten: body.LieferantenDetails && body.LieferantenDetails.length > 0 ? {
          create: body.LieferantenDetails.map((detail: any) => ({
            Lieferanten: {
              connect: { LieferantenID: detail.LieferantenID }
            },
            LieferantenArtikelnummer: detail.LieferantenArtikelnummer || null,
            Lieferzeit: detail.Lieferzeit ? parseInt(detail.Lieferzeit) : null,
            Mindestbestellmenge: detail.Mindestbestellmenge ? parseInt(detail.Mindestbestellmenge) : null,
            PreisBeimLieferanten: detail.PreisBeimLieferanten ? parseFloat(detail.PreisBeimLieferanten) : null,
            WaehrungLieferant: detail.WaehrungLieferant || 'EUR'
          }))
        } : undefined
      }
    })
    return { status: 201, data: newProdukt }
  } catch (error: any) {
    console.error(error)
    return { status: 500, message: 'Interner Serverfehler', error: error.message }
  }
})
