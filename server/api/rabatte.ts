import prisma from '../../lib/prisma'

export default defineEventHandler(async (event) => {
  const method = event.node.req.method
  const query = getQuery(event)
  const id = query.id ? parseInt(query.id as string) : null

  try {
    if (method === 'GET') {
      if (id) {
        const rabatt = await prisma.rabatte.findUnique({
          where: { RabattID: id },
          include: {
            Rabattstaffeln: true
          }
        })
        if (!rabatt) {
          return { status: 404, message: 'Rabatt nicht gefunden' }
        }
        return rabatt
      } else {
        const rabatte = await prisma.rabatte.findMany({
          include: {
            Rabattstaffeln: true,
            _count: {
              select: { KundenRabattAnwendung: true }
            }
          },
          orderBy: { Erstelldatum: 'desc' }
        })
        return rabatte
      }
    } else if (method === 'POST') {
      const body = await readBody(event)
      const rabatt = await prisma.rabatte.create({
        data: {
          Name: body.Name,
          Beschreibung: body.Beschreibung || null,
          RabattTyp: body.RabattTyp || 'Prozent',
          Anwendungsebene: body.Anwendungsebene || 'Bestellung',
          Wert: body.Wert,
          Mindestbestellwert: body.Mindestbestellwert || null,
          Gutscheincode: body.Gutscheincode || null,
          GueltigAb: body.GueltigAb ? new Date(body.GueltigAb) : new Date(),
          GueltigBis: body.GueltigBis ? new Date(body.GueltigBis) : null,
          MaxNutzungenGesamt: body.MaxNutzungenGesamt || null,
          MaxNutzungenProKunde: body.MaxNutzungenProKunde || null,
          Status: body.Status || 'Aktiv'
        }
      })
      return { status: 201, data: rabatt }
    } else if (method === 'PUT' && id) {
      const body = await readBody(event)
      const rabatt = await prisma.rabatte.update({
        where: { RabattID: id },
        data: {
          Name: body.Name,
          Beschreibung: body.Beschreibung || null,
          RabattTyp: body.RabattTyp,
          Anwendungsebene: body.Anwendungsebene,
          Wert: body.Wert,
          Mindestbestellwert: body.Mindestbestellwert || null,
          Gutscheincode: body.Gutscheincode || null,
          GueltigAb: body.GueltigAb ? new Date(body.GueltigAb) : null,
          GueltigBis: body.GueltigBis ? new Date(body.GueltigBis) : null,
          MaxNutzungenGesamt: body.MaxNutzungenGesamt || null,
          MaxNutzungenProKunde: body.MaxNutzungenProKunde || null,
          Status: body.Status,
          LetzteAenderung: new Date()
        }
      })
      return { status: 200, data: rabatt }
    } else if (method === 'DELETE' && id) {
      await prisma.rabatte.delete({
        where: { RabattID: id }
      })
      return { status: 204, message: 'Rabatt geloscht' }
    } else {
      return { status: 405, message: 'Methode nicht erlaubt' }
    }
  } catch (error: any) {
    console.error('Rabatte API Error:', error)
    return { status: 500, message: 'Interner Serverfehler', error: error.message }
  }
})
