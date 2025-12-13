import prisma from '../../lib/prisma'

export default defineEventHandler(async (event) => {
  try {
    const query = getQuery(event)

    if (!query.id) {
      return { status: 400, message: 'Kassen-ID erforderlich' }
    }

    await prisma.kassen.delete({
      where: { KassenID: parseInt(query.id as string) }
    })

    return { status: 200, message: 'Kasse erfolgreich gelöscht' }
  } catch (error: any) {
    console.error(error)
    return { status: 500, message: 'Fehler beim Löschen der Kasse', error: error.message }
  }
})
