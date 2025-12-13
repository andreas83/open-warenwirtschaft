import prisma from '~/lib/prisma'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)

  try {
    // Generate unique booking number
    const lastBooking = await prisma.hotelBuchungen.findFirst({
      orderBy: { BuchungsID: 'desc' }
    })

    const nextNumber = lastBooking ? parseInt(lastBooking.Buchungsnummer.replace(/\D/g, '')) + 1 : 1
    const buchungsnummer = `HB-${String(nextNumber).padStart(6, '0')}`

    // Calculate nights
    const checkIn = new Date(body.checkInDatum)
    const checkOut = new Date(body.checkOutDatum)
    const nights = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24))

    // Create booking with rooms
    const booking = await prisma.hotelBuchungen.create({
      data: {
        Buchungsnummer: buchungsnummer,
        KundenID: body.kundenID,
        Gastname: body.gastname,
        Email: body.email,
        Telefon: body.telefon,
        CheckInDatum: checkIn,
        CheckOutDatum: checkOut,
        AnzahlErwachsene: body.anzahlErwachsene || 1,
        AnzahlKinder: body.anzahlKinder || 0,
        Status: body.status || 'Bestaetigt',
        GesamtpreisNetto: body.gesamtpreisNetto || 0,
        GesamtpreisBrutto: body.gesamtpreisBrutto || 0,
        MwStGesamt: body.mwStGesamt || 0,
        Anzahlung: body.anzahlung || 0,
        Zahlungsart: body.zahlungsart,
        Zahlungsstatus: body.zahlungsstatus || 'Ausstehend',
        BesondereWuensche: body.besondereWuensche,
        InterneNotizen: body.interneNotizen,
        ErfasstVonBenutzerID: body.erfasstVonBenutzerID,
        HotelBuchungszimmer: {
          create: (body.zimmer || []).map((zimmer: any) => ({
            ZimmerID: zimmer.zimmerID,
            CheckInDatum: checkIn,
            CheckOutDatum: checkOut,
            PreisProNacht: zimmer.preisProNacht,
            AnzahlNaechte: nights,
            GesamtpreisNetto: zimmer.gesamtpreisNetto,
            MwStSatz: zimmer.mwStSatz || 7,
            MwStBetrag: zimmer.mwStBetrag,
            Notizen: zimmer.notizen
          }))
        },
        HotelGaeste: {
          create: (body.gaeste || []).map((gast: any) => ({
            Vorname: gast.vorname,
            Nachname: gast.nachname,
            Geburtsdatum: gast.geburtsdatum ? new Date(gast.geburtsdatum) : null,
            Nationalitaet: gast.nationalitaet,
            AusweisnummerTyp: gast.ausweisnummerTyp,
            Ausweisnummer: gast.ausweisnummer,
            Email: gast.email,
            Telefon: gast.telefon,
            Adresse: gast.adresse,
            Stadt: gast.stadt,
            PLZ: gast.plz,
            Land: gast.land,
            IstHauptgast: gast.istHauptgast || false,
            Notizen: gast.notizen
          }))
        }
      },
      include: {
        HotelBuchungszimmer: {
          include: {
            Zimmer: {
              include: {
                Zimmerkategorien: true
              }
            }
          }
        },
        HotelGaeste: true
      }
    })

    return booking
  } catch (error: any) {
    console.error('Error creating booking:', error)
    throw createError({
      statusCode: 500,
      message: error.message || 'Fehler beim Erstellen der Buchung'
    })
  }
})
