import prisma from '../../lib/prisma'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)

  try {
    if (!body) {
      return { status: 400, message: 'Keine Daten bereitgestellt' }
    }
    const newRechnung = await prisma.rechnungen.create({
      data: {
        BestellID: body.BestellID,
        KundenID: body.KundenID,
        ErstelltVonBenutzerID: body.ErstelltVonBenutzerID,
        Rechnungsnummer: body.Rechnungsnummer,
        Rechnungsdatum: new Date(body.Rechnungsdatum),
        Faelligkeitsdatum: new Date(body.Faelligkeitsdatum),
        Rechnungsadresse: body.Rechnungsadresse,
        Zahlungsstatus: body.Zahlungsstatus,
        GesamtbetragNetto: body.GesamtbetragNetto,
        MwSt_Gesamt: body.MwSt_Gesamt,
        GesamtrabattBetrag: body.GesamtrabattBetrag,
        GesamtbetragBrutto: body.GesamtbetragBrutto,
        Mahnstufe: body.Mahnstufe,
        Waehrung: body.Waehrung,
        Kommentare: body.Kommentare,
        Rechnungspositionen: {
          create: body.Rechnungspositionen?.map((position: { ProduktID: number; Menge: number; EinzelpreisNetto: number; RabattID: number | null; RabattProzentPosition: number; RabattBetragPosition: number; GesamtpreisNettoPosition: number; MwSt_Satz: number; MwSt_Betrag: number; Beschreibung: string }) => ({
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
          })) || []
        },
        RechnungsRabatte: {
          create: body.RechnungsRabatte?.map((rabatt: { RabattID: number; AngewendeterWert: number | null; AngewendeterBetrag: number }) => ({
            RabattID: rabatt.RabattID,
            AngewendeterWert: rabatt.AngewendeterWert,
            AngewendeterBetrag: rabatt.AngewendeterBetrag
          })) || []
        }
      },
      include: {
        Rechnungspositionen: true,
        RechnungsRabatte: true
      }
    })
    return { status: 201, data: newRechnung }
  } catch (error: any) {
    console.error(error)
    return { status: 500, message: 'Interner Serverfehler', error: error.message }
  }
})
