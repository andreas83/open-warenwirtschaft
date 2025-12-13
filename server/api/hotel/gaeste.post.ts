import prisma from '~/lib/prisma'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)

  try {
    const guest = await prisma.hotelGaeste.create({
      data: {
        BuchungsID: body.buchungsID,
        Vorname: body.vorname,
        Nachname: body.nachname,
        Geburtsdatum: body.geburtsdatum ? new Date(body.geburtsdatum) : null,
        Nationalitaet: body.nationalitaet,
        AusweisnummerTyp: body.ausweisnummerTyp,
        Ausweisnummer: body.ausweisnummer,
        Email: body.email,
        Telefon: body.telefon,
        Adresse: body.adresse,
        Stadt: body.stadt,
        PLZ: body.plz,
        Land: body.land,
        IstHauptgast: body.istHauptgast || false,
        Notizen: body.notizen
      }
    })

    return guest
  } catch (error: any) {
    console.error('Error creating guest:', error)
    throw createError({
      statusCode: 500,
      message: error.message || 'Fehler beim Erstellen des Gastes'
    })
  }
})
