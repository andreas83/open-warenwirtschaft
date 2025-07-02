import prisma from '../../lib/prisma'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)

  try {
    if (!body) {
      return { status: 400, message: 'Keine Daten bereitgestellt' }
    }
    // Check if Kundennummer already exists
    const existingKunde = await prisma.kunden.findUnique({
      where: { Kundennummer: body.Kundennummer }
    });
    if (existingKunde) {
      return { status: 409, message: 'Kundennummer bereits vorhanden. Bitte wählen Sie eine andere Kundennummer.' }
    }
    const newKunde = await prisma.kunden.create({
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
        Zahlungsbedingungen: body.Zahlungsbedingungen
      }
    })
    return { status: 201, data: newKunde }
  } catch (error: any) {
    console.error(error)
    if (error.code === 'P2002') {
      return { status: 409, message: 'Kundennummer bereits vorhanden. Bitte wählen Sie eine andere Kundennummer.' }
    }
    return { status: 500, message: 'Interner Serverfehler', error: error.message }
  }
})
