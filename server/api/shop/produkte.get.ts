import prisma from '~/lib/prisma'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)

  try {
    if (query.id) {
      // Get single product with relations
      const product = await prisma.shopProdukte.findUnique({
        where: { ShopProduktID: parseInt(query.id as string) },
        include: {
          Produkte: {
            include: {
              Einheiten: true,
              Umsatzsteuersaetze: true
            }
          },
          ShopKategorien: true,
          ShopBewertungen: {
            where: {
              Status: 'Genehmigt'
            },
            orderBy: {
              Erstelldatum: 'desc'
            },
            take: 10
          },
          _count: {
            select: {
              ShopBewertungen: {
                where: {
                  Status: 'Genehmigt'
                }
              }
            }
          }
        }
      })

      if (!product) {
        throw createError({ statusCode: 404, message: 'Produkt nicht gefunden' })
      }

      return product
    } else {
      // Get list of products with filters
      const limit = query.limit ? parseInt(query.limit as string) : 50
      const offset = query.offset ? parseInt(query.offset as string) : 0
      const kategorieId = query.kategorieId ? parseInt(query.kategorieId as string) : undefined
      const istAktiv = query.istAktiv !== undefined ? query.istAktiv === 'true' : undefined
      const istHervorgehoben = query.istHervorgehoben !== undefined ? query.istHervorgehoben === 'true' : undefined
      const search = query.search as string | undefined

      const where: any = {}

      if (kategorieId) {
        where.ShopKategorieID = kategorieId
      }

      if (istAktiv !== undefined) {
        where.IstAktiv = istAktiv
      }

      if (istHervorgehoben !== undefined) {
        where.IstHervorgehoben = istHervorgehoben
      }

      if (search) {
        where.OR = [
          { Titel: { contains: search } },
          { SKU: { contains: search } },
          { Kurzbeschreibung: { contains: search } }
        ]
      }

      const [products, total] = await Promise.all([
        prisma.shopProdukte.findMany({
          where,
          include: {
            Produkte: {
              include: {
                Einheiten: true
              }
            },
            ShopKategorien: true,
            _count: {
              select: {
                ShopBewertungen: {
                  where: {
                    Status: 'Genehmigt'
                  }
                }
              }
            }
          },
          orderBy: {
            SortOrder: 'asc'
          },
          skip: offset,
          take: limit
        }),
        prisma.shopProdukte.count({ where })
      ])

      return {
        products,
        total,
        limit,
        offset
      }
    }
  } catch (error: any) {
    console.error('Error fetching shop products:', error)
    throw createError({
      statusCode: error.statusCode || 500,
      message: error.message || 'Fehler beim Laden der Shop-Produkte'
    })
  }
})
