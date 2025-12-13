import prisma from '../../lib/prisma'

export default defineEventHandler(async (event) => {
  try {
    const query = getQuery(event)

    if (!query.id) {
      return { status: 400, message: 'Buchungs-ID erforderlich' }
    }

    await prisma.kassenbuchungen.delete({
      where: { BuchungsID: parseInt(query.id as string) }
    })

    return { status: 200, message: 'Kassenbuchung erfolgreich gelöscht' }
  } catch (error: any) {
    console.error(error)
    return { status: 500, message: 'Fehler beim Löschen der Kassenbuchung', error: error.message }
  }
})
