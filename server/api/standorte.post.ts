import prisma from '../../lib/prisma'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)

  try {
    if (!body) {
      return { status: 400, message: 'Keine Daten bereitgestellt' }
    }
    const newStandort = await prisma.standorte.create({
      data: {
        Name: body.Name,
        Adresse: body.Adresse,
        PLZ: body.PLZ,
        Ort: body.Ort,
        Land: body.Land,
        Telefon: body.Telefon,
        Email: body.Email,
        Typ: body.Typ || 'Filiale'
      }
    })
    return { status: 201, data: newStandort }
  } catch (error: any) {
    console.error(error)
    return { status: 500, message: 'Interner Serverfehler', error: error.message }
  }
})
