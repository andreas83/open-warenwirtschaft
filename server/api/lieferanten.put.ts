import prisma from '../../lib/prisma'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const body = await readBody(event)

  try {
    if (!query.id) {
      return { status: 400, message: 'Lieferanten-ID fehlt' }
    }
    if (!body) {
      return { status: 400, message: 'Keine Daten bereitgestellt' }
    }
    const updatedLieferant = await prisma.lieferanten.update({
      where: { LieferantenID: parseInt(query.id as string) },
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
    return { status: 200, data: updatedLieferant }
  } catch (error: any) {
    console.error(error)
    return { status: 500, message: 'Interner Serverfehler', error: error.message }
  }
})
