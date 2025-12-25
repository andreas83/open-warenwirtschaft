import prisma from '~/lib/prisma'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)

  const where: any = {}

  if (query.istAktiv !== undefined) {
    where.IstAktiv = query.istAktiv === 'true'
  }

  if (query.parentId) {
    where.ParentID = parseInt(query.parentId as string)
  } else if (query.rootOnly === 'true') {
    where.ParentID = null
  }

  const kategorien = await prisma.menuKategorien.findMany({
    where,
    include: {
      Children: {
        where: { IstAktiv: true },
        orderBy: { SortOrder: 'asc' }
      },
      MenuItems: {
        where: { IstAktiv: true },
        include: {
          Produkte: true,
          MenuItemModifiers: {
            include: {
              Modifier: true
            }
          }
        },
        orderBy: { SortOrder: 'asc' }
      }
    },
    orderBy: { SortOrder: 'asc' }
  })

  return kategorien
})
