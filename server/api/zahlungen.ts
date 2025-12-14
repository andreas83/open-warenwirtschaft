import prisma from '../../lib/prisma'

export default defineEventHandler(async (event) => {
  const method = event.node.req.method
  const query = getQuery(event)
  const id = query.id ? parseInt(query.id as string) : null

  try {
    if (method === 'GET') {
      if (id) {
        const zahlung = await prisma.zahlungen.findUnique({
          where: { ZahlungsID: id },
          include: {
            Rechnungen: {
              include: {
                Kunden: true
              }
            },
            Benutzer: true
          }
        })
        if (!zahlung) {
          return { status: 404, message: 'Zahlung nicht gefunden' }
        }
        return zahlung
      } else {
        // List with optional filters
        const rechnungId = query.rechnung ? parseInt(query.rechnung as string) : undefined
        const zahlungsart = query.zahlungsart as string | undefined
        const search = query.search as string | undefined
        const limit = query.limit ? parseInt(query.limit as string) : 100

        const where: any = {}
        if (rechnungId) where.RechnungsID = rechnungId
        if (zahlungsart) where.Zahlungsart = zahlungsart
        if (search) {
          where.OR = [
            { Referenznummer: { contains: search } },
            { Rechnungen: { Rechnungsnummer: { contains: search } } }
          ]
        }

        const zahlungen = await prisma.zahlungen.findMany({
          where,
          include: {
            Rechnungen: {
              include: {
                Kunden: true
              }
            },
            Benutzer: true
          },
          orderBy: { Zahlungsdatum: 'desc' },
          take: limit
        })
        return zahlungen
      }
    } else if (method === 'POST') {
      const body = await readBody(event)
      const zahlung = await prisma.zahlungen.create({
        data: {
          RechnungsID: body.RechnungsID,
          GebuchtVonBenutzerID: body.GebuchtVonBenutzerID || null,
          Betrag: body.Betrag,
          Zahlungsart: body.Zahlungsart,
          Referenznummer: body.Referenznummer || null,
          Kommentare: body.Kommentare || null
        },
        include: {
          Rechnungen: true
        }
      })

      // Update invoice payment status
      const allPayments = await prisma.zahlungen.findMany({
        where: { RechnungsID: body.RechnungsID }
      })
      const totalPaid = allPayments.reduce((sum, p) => sum + Number(p.Betrag), 0)
      const invoice = await prisma.rechnungen.findUnique({
        where: { RechnungsID: body.RechnungsID }
      })

      if (invoice) {
        let newStatus = 'Offen'
        if (totalPaid >= Number(invoice.GesamtbetragBrutto)) {
          newStatus = 'Bezahlt'
        } else if (totalPaid > 0) {
          newStatus = 'Teilbezahlt'
        }

        await prisma.rechnungen.update({
          where: { RechnungsID: body.RechnungsID },
          data: { Zahlungsstatus: newStatus }
        })
      }

      return { status: 201, data: zahlung }
    } else if (method === 'DELETE' && id) {
      await prisma.zahlungen.delete({
        where: { ZahlungsID: id }
      })
      return { status: 204, message: 'Zahlung geloscht' }
    } else {
      return { status: 405, message: 'Methode nicht erlaubt' }
    }
  } catch (error: any) {
    console.error('Zahlungen API Error:', error)
    return { status: 500, message: 'Interner Serverfehler', error: error.message }
  }
})
