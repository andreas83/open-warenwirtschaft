import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    const einheit = await prisma.einheiten.create({
      data: {
        Name: body.Name,
        Symbol: body.Symbol
      }
    })
    return einheit
  } catch (error) {
    console.error('Error creating einheit:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Internal Server Error'
    })
  } finally {
    await prisma.$disconnect()
  }
})
