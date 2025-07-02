import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
  try {
    const query = getQuery(event)
    const id = parseInt(query.id as string)
    await prisma.einheiten.delete({
      where: { EinheitID: id }
    })
    return { status: 'success' }
  } catch (error) {
    console.error('Error deleting einheit:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Internal Server Error'
    })
  } finally {
    await prisma.$disconnect()
  }
})
