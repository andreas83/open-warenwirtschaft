import prisma from '../../lib/prisma'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)

  try {
    if (!query.id) {
      return { status: 400, message: 'Umsatzsteuersatz-ID fehlt' }
    }
    const deletedUmsatzsteuersatz = await prisma.umsatzsteuersaetze.delete({
      where: { UmsatzsteuersatzID: parseInt(query.id as string) }
    })
    return { status: 200, message: 'Umsatzsteuersatz gelöscht', data: deletedUmsatzsteuersatz }
  } catch (error: any) {
    console.error(error)
    return { status: 500, message: 'Interner Serverfehler', error: error.message }
  }
})
