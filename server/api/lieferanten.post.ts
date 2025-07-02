import prisma from '../../lib/prisma'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)

  try {
    if (!body) {
      return { status: 400, message: 'Keine Daten bereitgestellt' }
    }
    const newLieferant = await prisma.lieferanten.create({
      data: {
        Firmenname: body.Firmenname,
        Ansprechpartner: body.Ansprechpartner,
        Adresse: body.Adresse,
        PLZ: body.PLZ,
        Ort: body.Ort,
        Land: body.Land,
        Telefon: body.Telefon,
        Email: body.Email,
        UmsatzsteuerID: body.UmsatzsteuerID
      }
    })
    return { status: 201, data: newLieferant }
  } catch (error: any) {
    console.error(error)
    return { status: 500, message: 'Interner Serverfehler', error: error.message }
  }
})
