import prisma from '../../lib/prisma'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)

  try {
    if (!query.id) {
      return { status: 400, message: 'Rechnungs-ID fehlt' }
    }
    const deletedRechnung = await prisma.rechnungen.delete({
      where: { RechnungsID: parseInt(query.id as string) }
    })
    return { status: 200, message: 'Rechnung gelöscht', data: deletedRechnung }
  } catch (error: any) {
    console.error(error)
    if (error.code === 'P2003' || (error.message && error.message.includes('Foreign key constraint violated'))) {
      return { status: 409, message: 'Rechnung kann nicht gelöscht werden, da verknüpfte Daten existieren (z.B. Zahlungen oder Retouren).' }
    }
    return { status: 500, message: 'Interner Serverfehler', error: error.message }
  }
})
