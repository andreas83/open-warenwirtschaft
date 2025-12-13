import prisma from '~/lib/prisma'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)

  try {
    if (query.id) {
      // Get single room category with relations
      const category = await prisma.zimmerkategorien.findUnique({
        where: { ZimmerkategorieID: parseInt(query.id as string) },
        include: {
          Zimmer: {
            where: {
              IstAktiv: true
            },
            orderBy: {
              Zimmernummer: 'asc'
            }
          },
          _count: {
            select: {
              Zimmer: true
            }
          }
        }
      })

      if (!category) {
        throw createError({ statusCode: 404, message: 'Zimmerkategorie nicht gefunden' })
      }

      return category
    } else {
      // Get list of room categories with filters
      const limit = query.limit ? parseInt(query.limit as string) : 50
      const offset = query.offset ? parseInt(query.offset as string) : 0
      const search = query.search as string | undefined
      const istAktiv = query.istAktiv !== undefined ? query.istAktiv === 'true' : undefined

      const where: any = {}

      if (istAktiv !== undefined) {
        where.IstAktiv = istAktiv
      }

      if (search) {
        where.OR = [
          { Name: { contains: search } },
          { Beschreibung: { contains: search } }
        ]
      }

      const [categories, total] = await Promise.all([
        prisma.zimmerkategorien.findMany({
          where,
          include: {
            _count: {
              select: {
                Zimmer: true
              }
            }
          },
          orderBy: [
            { SortierReihenfolge: 'asc' },
            { Name: 'asc' }
          ],
          skip: offset,
          take: limit
        }),
        prisma.zimmerkategorien.count({ where })
      ])

      return {
        categories,
        total,
        limit,
        offset
      }
    }
  } catch (error: any) {
    console.error('Error fetching room categories:', error)
    throw createError({
      statusCode: error.statusCode || 500,
      message: error.message || 'Fehler beim Laden der Zimmerkategorien'
    })
  }
})
