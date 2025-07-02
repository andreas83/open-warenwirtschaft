import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
  try {
    const query = getQuery(event)
    const id = parseInt(query.id as string)
    const body = await readBody(event)
    const einheit = await prisma.einheiten.update({
      where: { EinheitID: id },
      data: {
        Name: body.Name,
        Symbol: body.Symbol
      }
    })
    return einheit
  } catch (error) {
    console.error('Error updating einheit:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Internal Server Error'
    })
  } finally {
    await prisma.$disconnect()
  }
})
