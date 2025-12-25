import prisma from '~/lib/prisma'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)

  const kategorie = await prisma.menuKategorien.create({
    data: {
      Name: body.Name,
      Beschreibung: body.Beschreibung,
      ParentID: body.ParentID || null,
      SortOrder: body.SortOrder || 0,
      Icon: body.Icon,
      IstAktiv: body.IstAktiv !== undefined ? body.IstAktiv : true
    }
  })

  return kategorie
})
