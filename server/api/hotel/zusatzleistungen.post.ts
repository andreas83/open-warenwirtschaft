import prisma from '~/lib/prisma'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)

  try {
    const service = await prisma.hotelZusatzleistungen.create({
      data: {
        BuchungsID: body.buchungsID,
        Bezeichnung: body.bezeichnung,
        Beschreibung: body.beschreibung,
        Typ: body.typ || 'Sonstiges',
        Preis: body.preis,
        Menge: body.menge || 1,
        GesamtpreisNetto: body.gesamtpreisNetto,
        MwStSatz: body.mwStSatz || 19,
        MwStBetrag: body.mwStBetrag,
        Datum: body.datum ? new Date(body.datum) : new Date(),
        ErfasstVonBenutzerID: body.erfasstVonBenutzerID,
        Notizen: body.notizen
      },
      include: {
        Benutzer: true
      }
    })

    return service
  } catch (error: any) {
    console.error('Error creating additional service:', error)
    throw createError({
      statusCode: 500,
      message: error.message || 'Fehler beim Erstellen der Zusatzleistung'
    })
  }
})
