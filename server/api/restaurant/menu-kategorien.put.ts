import prisma from '~/lib/prisma'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { KategorieID, ...data } = body

  if (!KategorieID) {
    throw createError({
      statusCode: 400,
      statusMessage: 'KategorieID ist erforderlich'
    })
  }

  const kategorie = await prisma.menuKategorien.update({
    where: { KategorieID },
    data: {
      Name: data.Name,
      Beschreibung: data.Beschreibung,
      ParentID: data.ParentID || null,
      SortOrder: data.SortOrder,
      Icon: data.Icon,
      IstAktiv: data.IstAktiv
    }
  })

  return kategorie
})
