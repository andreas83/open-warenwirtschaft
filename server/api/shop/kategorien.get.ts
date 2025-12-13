import prisma from '~/lib/prisma'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)

  try {
    if (query.id) {
      // Get single category with relations
      const category = await prisma.shopKategorien.findUnique({
        where: { ShopKategorieID: parseInt(query.id as string) },
        include: {
          ShopKategorien: true, // Parent category
          other_ShopKategorien: true, // Child categories
          ShopProdukte: {
            where: {
              IstAktiv: true
            },
            take: 10
          },
          _count: {
            select: {
              ShopProdukte: {
                where: {
                  IstAktiv: true
                }
              }
            }
          }
        }
      })

      if (!category) {
        throw createError({ statusCode: 404, message: 'Kategorie nicht gefunden' })
      }

      return category
    } else {
      // Get list of categories with filters
      const limit = query.limit ? parseInt(query.limit as string) : 100
      const offset = query.offset ? parseInt(query.offset as string) : 0
      const parentId = query.parentId !== undefined
        ? (query.parentId === 'null' ? null : parseInt(query.parentId as string))
        : undefined
      const istSichtbar = query.istSichtbar !== undefined ? query.istSichtbar === 'true' : undefined
      const search = query.search as string | undefined

      const where: any = {}

      if (parentId !== undefined) {
        where.UebergeordneteKategorieID = parentId
      }

      if (istSichtbar !== undefined) {
        where.IstSichtbar = istSichtbar
      }

      if (search) {
        where.OR = [
          { Name: { contains: search } },
          { Beschreibung: { contains: search } }
        ]
      }

      const [categories, total] = await Promise.all([
        prisma.shopKategorien.findMany({
          where,
          include: {
            ShopKategorien: true,
            _count: {
              select: {
                ShopProdukte: true,
                other_ShopKategorien: true
              }
            }
          },
          orderBy: {
            SortOrder: 'asc'
          },
          skip: offset,
          take: limit
        }),
        prisma.shopKategorien.count({ where })
      ])

      return {
        categories,
        total,
        limit,
        offset
      }
    }
  } catch (error: any) {
    console.error('Error fetching shop categories:', error)
    throw createError({
      statusCode: error.statusCode || 500,
      message: error.message || 'Fehler beim Laden der Shop-Kategorien'
    })
  }
})
