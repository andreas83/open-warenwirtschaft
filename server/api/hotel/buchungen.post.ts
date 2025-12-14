import prisma from '~/lib/prisma'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)

  try {
    // Generate unique booking number
    const lastBooking = await prisma.hotelBuchungen.findFirst({
      orderBy: { BuchungsID: 'desc' }
    })

    const nextNumber = lastBooking ? parseInt(lastBooking.Buchungsnummer?.replace(/\D/g, '') || '0') + 1 : 1
    const buchungsnummer = `HB-${String(nextNumber).padStart(6, '0')}`

    // Calculate nights
    const checkIn = new Date(body.checkInDatum)
    const checkOut = new Date(body.checkOutDatum)
    const nights = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24))

    // Build guest list - start with main guest
    const guestRecords: any[] = []

    // Add main guest (from new form fields or legacy gaeste array)
    if (body.gastVorname || body.gastNachname) {
      guestRecords.push({
        Vorname: body.gastVorname || '',
        Nachname: body.gastNachname || '',
        Geburtsdatum: body.geburtsdatum ? new Date(body.geburtsdatum) : null,
        Nationalitaet: body.nationalitaet || null,
        AusweisnummerTyp: body.ausweisart || null,
        Ausweisnummer: body.ausweisnummer || null,
        Email: body.email || null,
        Telefon: body.telefon || null,
        Adresse: body.strasse || null,
        Stadt: body.ort || null,
        PLZ: body.plz || null,
        Land: body.land || null,
        IstHauptgast: true,
        Notizen: null
      })
    }

    // Add additional guests from weitereGaeste array
    if (body.weitereGaeste && Array.isArray(body.weitereGaeste)) {
      for (const gast of body.weitereGaeste) {
        if (gast.vorname || gast.nachname) {
          guestRecords.push({
            Vorname: gast.vorname || '',
            Nachname: gast.nachname || '',
            Geburtsdatum: gast.geburtsdatum ? new Date(gast.geburtsdatum) : null,
            Nationalitaet: gast.nationalitaet || null,
            AusweisnummerTyp: gast.ausweisart || null,
            Ausweisnummer: gast.ausweisnummer || null,
            Email: null,
            Telefon: null,
            Adresse: null,
            Stadt: null,
            PLZ: null,
            Land: null,
            IstHauptgast: false,
            Notizen: null
          })
        }
      }
    }

    // Support legacy gaeste array format
    if (body.gaeste && Array.isArray(body.gaeste)) {
      for (const gast of body.gaeste) {
        guestRecords.push({
          Vorname: gast.vorname || '',
          Nachname: gast.nachname || '',
          Geburtsdatum: gast.geburtsdatum ? new Date(gast.geburtsdatum) : null,
          Nationalitaet: gast.nationalitaet || null,
          AusweisnummerTyp: gast.ausweisnummerTyp || null,
          Ausweisnummer: gast.ausweisnummer || null,
          Email: gast.email || null,
          Telefon: gast.telefon || null,
          Adresse: gast.adresse || null,
          Stadt: gast.stadt || null,
          PLZ: gast.plz || null,
          Land: gast.land || null,
          IstHauptgast: gast.istHauptgast || false,
          Notizen: gast.notizen || null
        })
      }
    }

    // Create booking with rooms and guests
    const booking = await prisma.hotelBuchungen.create({
      data: {
        Buchungsnummer: buchungsnummer,
        KundenID: body.kundenID || null,
        Gastname: body.gastname || `${body.gastVorname || ''} ${body.gastNachname || ''}`.trim(),
        Email: body.email || null,
        Telefon: body.telefon || null,
        CheckInDatum: checkIn,
        CheckOutDatum: checkOut,
        AnzahlErwachsene: body.anzahlErwachsene || 1,
        AnzahlKinder: body.anzahlKinder || 0,
        Status: body.status || 'Bestaetigt',
        GesamtpreisNetto: body.gesamtpreisNetto || 0,
        GesamtpreisBrutto: body.gesamtpreisBrutto || 0,
        MwStGesamt: body.mwStGesamt || 0,
        Anzahlung: body.anzahlung || 0,
        Zahlungsart: body.zahlungsart || null,
        Zahlungsstatus: body.zahlungsstatus || 'Ausstehend',
        BesondereWuensche: body.besondereWuensche || null,
        InterneNotizen: body.interneNotizen || null,
        ErfasstVonBenutzerID: body.erfasstVonBenutzerID || null,
        HotelBuchungszimmer: {
          create: (body.zimmer || []).filter((z: any) => z.zimmerID).map((zimmer: any) => ({
            ZimmerID: zimmer.zimmerID,
            CheckInDatum: checkIn,
            CheckOutDatum: checkOut,
            PreisProNacht: zimmer.preisProNacht || 0,
            AnzahlNaechte: nights,
            GesamtpreisNetto: zimmer.gesamtpreisNetto || 0,
            MwStSatz: zimmer.mwStSatz || 7,
            MwStBetrag: zimmer.mwStBetrag || 0,
            Notizen: zimmer.notizen || null
          }))
        },
        HotelGaeste: {
          create: guestRecords
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
        HotelGaeste: {
          orderBy: [
            { IstHauptgast: 'desc' },
            { GastID: 'asc' }
          ]
        }
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
