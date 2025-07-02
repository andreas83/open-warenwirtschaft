import prisma from '../../lib/prisma'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)

  try {
    if (!query.id) {
      return { status: 400, message: 'Produkt-ID fehlt' }
    }
    const deletedProdukt = await prisma.produkte.delete({
      where: { ProduktID: parseInt(query.id as string) }
    })
    return { status: 200, message: 'Produkt gelöscht', data: deletedProdukt }
  } catch (error: any) {
    console.error(error)
    return { status: 500, message: 'Interner Serverfehler', error: error.message }
  }
})
