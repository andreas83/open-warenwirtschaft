import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
  try {
    const query = getQuery(event)
    if (query.id) {
      const id = parseInt(query.id as string)
      const einheit = await prisma.einheiten.findUnique({
        where: { EinheitID: id }
      })
      if (!einheit) {
        throw createError({
          statusCode: 404,
          statusMessage: 'Einheit not found'
        })
      }
      return einheit
    } else {
      const limit = parseInt(query.limit as string) || 10
      const offset = parseInt(query.offset as string) || 0
      const search = query.search as string || ''
      
      let where = {}
      if (search) {
        where = {
          OR: [
            { Name: { contains: search, mode: 'insensitive' } },
            { Symbol: { contains: search, mode: 'insensitive' } }
          ]
        }
      }
      
      const einheiten = await prisma.einheiten.findMany({
        where,
        skip: offset,
        take: limit
      })
      
      const total = await prisma.einheiten.count({ where })
      
      return {
        data: einheiten,
        total
      }
    }
  } catch (error: any) {
    console.error('Error fetching einheiten:', error)
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.statusMessage || 'Internal Server Error'
    })
  } finally {
    await prisma.$disconnect()
  }
})
