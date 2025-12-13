import prisma from '~/lib/prisma'

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    const id = body.PositionID || parseInt(getQuery(event).id as string)

    if (!id) {
      throw createError({ statusCode: 400, message: 'Positions-ID ist erforderlich' })
    }

    const updateData: any = {
      LetzteAenderung: new Date()
    }

    if (body.Status) {
      updateData.Status = body.Status

      // Set timestamps based on status
      if (body.Status === 'In_Zubereitung' && !body.ZubereitetUm) {
        updateData.ZubereitetUm = new Date()
      } else if (body.Status === 'Serviert' && !body.ServiertUm) {
        updateData.ServiertUm = new Date()
      }
    }

    if (body.Notizen !== undefined) updateData.Notizen = body.Notizen
    if (body.KuecheNotizen !== undefined) updateData.KuecheNotizen = body.KuecheNotizen

    const position = await prisma.restaurantBestellpositionen.update({
      where: { PositionID: id },
      data: updateData,
      include: {
        Produkte: {
          include: {
            Einheiten: true
          }
        }
      }
    })

    return position
  } catch (error: any) {
    console.error('Error updating order position:', error)
    throw createError({
      statusCode: error.statusCode || 500,
      message: error.message || 'Fehler beim Aktualisieren der Bestellposition'
    })
  }
})
