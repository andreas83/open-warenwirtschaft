import prisma from '../../lib/prisma'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)

  try {
    if (!query.id) {
      return { status: 400, message: 'Kunden-ID fehlt' }
    }
    const deletedKunde = await prisma.kunden.delete({
      where: { KundenID: parseInt(query.id as string) }
    })
    return { status: 200, message: 'Kunde gelöscht', data: deletedKunde }
  } catch (error: any) {
    console.error(error)
    if (error.code === 'P2003' || (error.message && error.message.includes('Foreign key constraint violated'))) {
      return { status: 409, message: 'Kunde kann nicht gelöscht werden, da verknüpfte Daten existieren (z.B. Bestellungen oder Rechnungen).' }
    }
    return { status: 500, message: 'Interner Serverfehler', error: error.message }
  }
})
