import prisma from '~/lib/prisma'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)

  const where: any = {}

  if (query.typ) {
    where.Typ = query.typ
  }

  if (query.istAktiv !== undefined) {
    where.IstAktiv = query.istAktiv === 'true'
  }

  const modifiers = await prisma.modifier.findMany({
    where,
    include: {
      MenuItemModifiers: {
        include: {
          MenuItem: {
            select: {
              MenuItemID: true,
              Name: true
            }
          }
        }
      }
    }
  })

  return modifiers
})
