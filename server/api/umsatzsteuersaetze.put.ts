import prisma from '../../lib/prisma'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const body = await readBody(event)

  try {
    if (!query.id) {
      return { status: 400, message: 'Umsatzsteuersatz-ID fehlt' }
    }
    if (!body) {
      return { status: 400, message: 'Keine Daten bereitgestellt' }
    }
    const updatedUmsatzsteuersatz = await prisma.umsatzsteuersaetze.update({
      where: { UmsatzsteuersatzID: parseInt(query.id as string) },
      data: {
        Name: body.Name,
        Steuersatz: parseFloat(body.Steuersatz),
        Beschreibung: body.Beschreibung
      }
    })
    return { status: 200, data: updatedUmsatzsteuersatz }
  } catch (error: any) {
    console.error(error)
    return { status: 500, message: 'Interner Serverfehler', error: error.message }
  }
})
