import prisma from '~/lib/prisma'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)

  try {
    // Start a transaction to handle booking and guests together
    const result = await prisma.$transaction(async (tx) => {
      // 1. Update booking basic info
      const booking = await tx.hotelBuchungen.update({
        where: { BuchungsID: body.id },
        data: {
          KundenID: body.kundenID,
          Gastname: body.gastname,
          Email: body.email || null,
          Telefon: body.telefon || null,
          CheckInDatum: body.checkInDatum ? new Date(body.checkInDatum) : undefined,
          CheckOutDatum: body.checkOutDatum ? new Date(body.checkOutDatum) : undefined,
          AnzahlErwachsene: body.anzahlErwachsene,
          AnzahlKinder: body.anzahlKinder,
          Status: body.status,
          GesamtpreisNetto: body.gesamtpreisNetto,
          GesamtpreisBrutto: body.gesamtpreisBrutto,
          MwStGesamt: body.mwStGesamt,
          Anzahlung: body.anzahlung,
          RechnungsID: body.rechnungsID,
          Zahlungsart: body.zahlungsart || null,
          Zahlungsstatus: body.zahlungsstatus,
          BesondereWuensche: body.besondereWuensche || null,
          InterneNotizen: body.interneNotizen || null,
          CheckInZeit: body.checkInZeit ? new Date(body.checkInZeit) : undefined,
          CheckOutZeit: body.checkOutZeit ? new Date(body.checkOutZeit) : undefined
        }
      })

      // 2. Handle main guest (hauptgast)
      if (body.hauptgast) {
        const hauptgastData = {
          Vorname: body.hauptgast.vorname || '',
          Nachname: body.hauptgast.nachname || '',
          Geburtsdatum: body.hauptgast.geburtsdatum ? new Date(body.hauptgast.geburtsdatum) : null,
          Nationalitaet: body.hauptgast.nationalitaet || null,
          AusweisnummerTyp: body.hauptgast.ausweisart || null,
          Ausweisnummer: body.hauptgast.ausweisnummer || null,
          Email: body.hauptgast.email || null,
          Telefon: body.hauptgast.telefon || null,
          Adresse: body.hauptgast.adresse || null,
          Stadt: body.hauptgast.stadt || null,
          PLZ: body.hauptgast.plz || null,
          Land: body.hauptgast.land || null,
          IstHauptgast: true
        }

        if (body.hauptgast.id) {
          // Update existing main guest
          await tx.hotelGaeste.update({
            where: { GastID: body.hauptgast.id },
            data: hauptgastData
          })
        } else {
          // Check if a main guest already exists for this booking
          const existingHauptgast = await tx.hotelGaeste.findFirst({
            where: {
              BuchungsID: body.id,
              IstHauptgast: true
            }
          })

          if (existingHauptgast) {
            // Update existing
            await tx.hotelGaeste.update({
              where: { GastID: existingHauptgast.GastID },
              data: hauptgastData
            })
          } else {
            // Create new main guest
            await tx.hotelGaeste.create({
              data: {
                ...hauptgastData,
                BuchungsID: body.id
              }
            })
          }
        }
      }

      // 3. Handle additional guests (weitereGaeste)
      if (body.weitereGaeste && Array.isArray(body.weitereGaeste)) {
        // Get existing additional guests
        const existingGuests = await tx.hotelGaeste.findMany({
          where: {
            BuchungsID: body.id,
            IstHauptgast: false
          }
        })

        const existingGuestIds = existingGuests.map(g => g.GastID)
        const submittedGuestIds = body.weitereGaeste
          .filter((g: any) => g.id)
          .map((g: any) => g.id)

        // Delete guests that were removed
        const guestsToDelete = existingGuestIds.filter(id => !submittedGuestIds.includes(id))
        if (guestsToDelete.length > 0) {
          await tx.hotelGaeste.deleteMany({
            where: {
              GastID: { in: guestsToDelete }
            }
          })
        }

        // Update or create additional guests
        for (const guest of body.weitereGaeste) {
          const guestData = {
            Vorname: guest.vorname || '',
            Nachname: guest.nachname || '',
            Geburtsdatum: guest.geburtsdatum ? new Date(guest.geburtsdatum) : null,
            Nationalitaet: guest.nationalitaet || null,
            AusweisnummerTyp: guest.ausweisart || null,
            Ausweisnummer: guest.ausweisnummer || null,
            Email: null,
            Telefon: null,
            Adresse: null,
            Stadt: null,
            PLZ: null,
            Land: null,
            IstHauptgast: false
          }

          if (guest.id) {
            // Update existing guest
            await tx.hotelGaeste.update({
              where: { GastID: guest.id },
              data: guestData
            })
          } else {
            // Create new guest
            await tx.hotelGaeste.create({
              data: {
                ...guestData,
                BuchungsID: body.id
              }
            })
          }
        }
      }

      // Return updated booking with all relations
      return await tx.hotelBuchungen.findUnique({
        where: { BuchungsID: body.id },
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
          },
          HotelZusatzleistungen: true
        }
      })
    })

    return result
  } catch (error: any) {
    console.error('Error updating booking:', error)
    throw createError({
      statusCode: 500,
      message: error.message || 'Fehler beim Aktualisieren der Buchung'
    })
  }
})
