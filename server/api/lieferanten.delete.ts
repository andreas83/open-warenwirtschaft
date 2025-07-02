import prisma from '../../lib/prisma'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)

  try {
    if (!query.id) {
      return { status: 400, message: 'Lieferanten-ID fehlt' }
    }
    const deletedLieferant = await prisma.lieferanten.delete({
      where: { LieferantenID: parseInt(query.id as string) }
    })
    return { status: 200, message: 'Lieferant gelöscht', data: deletedLieferant }
  } catch (error: any) {
    console.error(error)
    return { status: 500, message: 'Interner Serverfehler', error: error.message }
  }
})
