import prisma from '../../lib/prisma'

export default defineEventHandler(async (event) => {
  try {
    const query = getQuery(event)
    const body = await readBody(event)
    
    if (!query.id) {
      return { status: 400, message: 'Bild-ID fehlt' }
    }

    const bildId = parseInt(query.id as string)
    const bild = await prisma.produktBilder.findUnique({
      where: { BildID: bildId }
    })

    if (!bild) {
      return { status: 404, message: 'Bild nicht gefunden' }
    }

    // If setting as main image, update all other images for this product to not be main
    if (body.IstHauptbild === true) {
      await prisma.produktBilder.updateMany({
        where: { 
          ProduktID: bild.ProduktID,
          BildID: { not: bildId }
        },
        data: { IstHauptbild: false }
      })
    }

    const updatedBild = await prisma.produktBilder.update({
      where: { BildID: bildId },
      data: {
        IstHauptbild: body.IstHauptbild !== undefined ? body.IstHauptbild : bild.IstHauptbild
      }
    })

    return { status: 200, data: updatedBild, message: 'Bild erfolgreich aktualisiert' }
  } catch (error: unknown) {
    console.error(error)
    return { status: 500, message: 'Interner Serverfehler', error: String(error) }
  }
})
