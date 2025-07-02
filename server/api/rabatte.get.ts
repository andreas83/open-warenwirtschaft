import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
  try {
    const rabatte = await prisma.rabatte.findMany({
      include: {
        Rabattstaffeln: true,
        RechnungsRabatte: true,
      },
    })
    return rabatte
  } catch (error) {
    console.error('Error fetching rabatte:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Internal Server Error',
    })
  } finally {
    await prisma.$disconnect()
  }
})
