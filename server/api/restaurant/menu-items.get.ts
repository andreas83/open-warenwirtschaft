import prisma from '~/lib/prisma'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)

  const where: any = {}

  if (query.kategorieId) {
    where.KategorieID = parseInt(query.kategorieId as string)
  }

  if (query.istVerfuegbar !== undefined) {
    where.IstVerfuegbar = query.istVerfuegbar === 'true'
  }

  if (query.istTagesessen !== undefined) {
    where.IstTagesessen = query.istTagesessen === 'true'
  }

  if (query.istAktiv !== undefined) {
    where.IstAktiv = query.istAktiv === 'true'
  }

  if (query.search) {
    where.OR = [
      { Name: { contains: query.search as string } },
      { Beschreibung: { contains: query.search as string } }
    ]
  }

  const menuItems = await prisma.menuItem.findMany({
    where,
    include: {
      Produkte: {
        include: {
          Umsatzsteuersaetze: true,
          Einheiten: true
        }
      },
      MenuKategorien: true,
      MenuItemModifiers: {
        include: {
          Modifier: true
        },
        orderBy: { SortOrder: 'asc' }
      }
    },
    orderBy: { SortOrder: 'asc' }
  })

  return menuItems
})
