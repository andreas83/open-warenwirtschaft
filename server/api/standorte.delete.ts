import prisma from '../../lib/prisma'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)

  try {
    if (!query.id) {
      return { status: 400, message: 'Standort-ID fehlt' }
    }
    const deletedStandort = await prisma.standorte.delete({
      where: { StandortID: parseInt(query.id as string) }
    })
    return { status: 200, message: 'Standort gelöscht', data: deletedStandort }
  } catch (error: any) {
    console.error(error)
    return { status: 500, message: 'Interner Serverfehler', error: error.message }
  }
})
