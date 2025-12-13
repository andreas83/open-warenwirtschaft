import prisma from '~/lib/prisma'

export default defineEventHandler(async (event) => {
  try {
    const query = getQuery(event)
    const id = parseInt(query.id as string)

    if (!id) {
      throw createError({ statusCode: 400, message: 'Tisch-ID ist erforderlich' })
    }

    // Check if table has active reservations or orders
    const table = await prisma.restaurantTische.findUnique({
      where: { TischID: id },
      include: {
        Reservierungen: {
          where: {
            Status: {
              in: ['Bestaetigt', 'Eingecheckt']
            }
          }
        },
        RestaurantBestellungen: {
          where: {
            Status: {
              notIn: ['Abgeschlossen', 'Storniert']
            }
          }
        }
      }
    })

    if (!table) {
      throw createError({ statusCode: 404, message: 'Tisch nicht gefunden' })
    }

    if (table.Reservierungen.length > 0 || table.RestaurantBestellungen.length > 0) {
      throw createError({
        statusCode: 400,
        message: 'Tisch kann nicht gelöscht werden, da aktive Reservierungen oder Bestellungen vorhanden sind'
      })
    }

    const deletedTable = await prisma.restaurantTische.delete({
      where: { TischID: id }
    })

    return deletedTable
  } catch (error: any) {
    console.error('Error deleting table:', error)
    throw createError({
      statusCode: error.statusCode || 500,
      message: error.message || 'Fehler beim Löschen des Tisches'
    })
  }
})
