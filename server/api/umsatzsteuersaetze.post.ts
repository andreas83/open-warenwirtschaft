import prisma from '../../lib/prisma'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)

  try {
    if (!body) {
      return { status: 400, message: 'Keine Daten bereitgestellt' }
    }
    const newUmsatzsteuersatz = await prisma.umsatzsteuersaetze.create({
      data: {
        Name: body.Name,
        Steuersatz: parseFloat(body.Steuersatz),
        Beschreibung: body.Beschreibung
      }
    })
    return { status: 201, data: newUmsatzsteuersatz }
  } catch (error: any) {
    console.error(error)
    return { status: 500, message: 'Interner Serverfehler', error: error.message }
  }
})
