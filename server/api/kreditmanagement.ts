import prisma from '~/lib/prisma'

export default defineEventHandler(async (event) => {
  const method = getMethod(event)
  const query = getQuery(event)

  // GET - List credit limits or single
  if (method === 'GET') {
    try {
      // Get reminders (Mahnungen)
      if (query.type === 'mahnungen') {
        const status = query.status as string
        const where: any = {}
        if (status) {
          where.Status = status
        }

        const mahnungen = await prisma.mahnungen.findMany({
          where,
          include: {
            Kreditlimits: {
              include: {
                Kunden: true
              }
            },
            Rechnungen: true
          },
          orderBy: { Mahnungsdatum: 'desc' },
          take: parseInt(query.limit as string) || 100
        })
        return { reminders: mahnungen }
      }

      // Get single credit limit
      if (query.id) {
        const kreditlimit = await prisma.kreditlimits.findUnique({
          where: { KreditlimitID: parseInt(query.id as string) },
          include: {
            Kunden: true,
            Mahnungen: {
              include: {
                Rechnungen: true
              },
              orderBy: { Mahnungsdatum: 'desc' }
            }
          }
        })
        if (!kreditlimit) {
          return { status: 404, error: 'Kreditlimit nicht gefunden' }
        }
        return kreditlimit
      }

      // List all credit limits
      const kreditlimits = await prisma.kreditlimits.findMany({
        include: {
          Kunden: true,
          Mahnungen: {
            where: { Status: 'Offen' }
          }
        },
        orderBy: { LetzteAenderung: 'desc' },
        take: parseInt(query.limit as string) || 100
      })

      // Calculate statistics
      const stats = {
        totalCustomers: kreditlimits.length,
        blockedCustomers: kreditlimits.filter(k => k.Kreditsperre).length,
        totalCreditLimit: kreditlimits.reduce((sum, k) => sum + Number(k.Kreditlimit), 0),
        totalDebt: kreditlimits.reduce((sum, k) => sum + Number(k.AktuelleSchuld), 0),
        openReminders: kreditlimits.reduce((sum, k) => sum + (k.Mahnungen?.length || 0), 0)
      }

      return { creditLimits: kreditlimits, stats }
    } catch (error: any) {
      console.error('GET Kreditmanagement Error:', error)
      return { status: 500, error: error.message }
    }
  }

  // POST - Create credit limit
  if (method === 'POST') {
    try {
      const body = await readBody(event)

      // Check if customer already has a credit limit
      const existing = await prisma.kreditlimits.findUnique({
        where: { KundenID: body.kundenId }
      })

      if (existing) {
        return { status: 400, error: 'Kunde hat bereits ein Kreditlimit' }
      }

      const kreditlimit = await prisma.kreditlimits.create({
        data: {
          KundenID: body.kundenId,
          Kreditlimit: body.kreditlimit,
          AktuelleSchuld: body.aktuelleSchuld || 0,
          Waehrung: body.waehrung || 'EUR',
          Kreditsperre: body.kreditsperre || false,
          Sperrgrund: body.sperrgrund || null,
          Zahlungsziel: body.zahlungsziel || 30
        },
        include: {
          Kunden: true
        }
      })

      return { status: 201, creditLimit: kreditlimit }
    } catch (error: any) {
      console.error('POST Kreditmanagement Error:', error)
      return { status: 500, error: error.message }
    }
  }

  // PUT - Update credit limit
  if (method === 'PUT') {
    try {
      const id = parseInt(query.id as string)
      if (!id) {
        return { status: 400, error: 'ID erforderlich' }
      }

      const body = await readBody(event)

      const kreditlimit = await prisma.kreditlimits.update({
        where: { KreditlimitID: id },
        data: {
          Kreditlimit: body.kreditlimit,
          AktuelleSchuld: body.aktuelleSchuld,
          Kreditsperre: body.kreditsperre,
          Sperrgrund: body.sperrgrund,
          Zahlungsziel: body.zahlungsziel,
          LetztePruefung: new Date(),
          LetzteAenderung: new Date()
        },
        include: {
          Kunden: true
        }
      })

      return { status: 200, creditLimit: kreditlimit }
    } catch (error: any) {
      console.error('PUT Kreditmanagement Error:', error)
      return { status: 500, error: error.message }
    }
  }

  // DELETE - Delete credit limit
  if (method === 'DELETE') {
    try {
      const id = parseInt(query.id as string)
      if (!id) {
        return { status: 400, error: 'ID erforderlich' }
      }

      // Check for open reminders
      const openReminders = await prisma.mahnungen.count({
        where: {
          KreditlimitID: id,
          Status: 'Offen'
        }
      })

      if (openReminders > 0) {
        return { status: 400, error: 'Offene Mahnungen vorhanden' }
      }

      await prisma.kreditlimits.delete({
        where: { KreditlimitID: id }
      })

      return { status: 200, message: 'Kreditlimit geloscht' }
    } catch (error: any) {
      console.error('DELETE Kreditmanagement Error:', error)
      return { status: 500, error: error.message }
    }
  }

  return { status: 405, error: 'Methode nicht erlaubt' }
})
