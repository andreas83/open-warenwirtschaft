import prisma from '~/lib/prisma'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { MenuItemID, modifiers, ...data } = body

  if (!MenuItemID) {
    throw createError({
      statusCode: 400,
      statusMessage: 'MenuItemID ist erforderlich'
    })
  }

  const menuItem = await prisma.menuItem.update({
    where: { MenuItemID },
    data: {
      ProduktID: data.ProduktID,
      KategorieID: data.KategorieID || null,
      Name: data.Name,
      Beschreibung: data.Beschreibung,
      Preis: data.Preis,
      Bild: data.Bild,
      IstVerfuegbar: data.IstVerfuegbar,
      IstTagesessen: data.IstTagesessen,
      Allergene: data.Allergene,
      Zutaten: data.Zutaten,
      Kalorien: data.Kalorien,
      Zubereitungszeit: data.Zubereitungszeit,
      SortOrder: data.SortOrder,
      IstAktiv: data.IstAktiv
    },
    include: {
      Produkte: true,
      MenuKategorien: true
    }
  })

  // Update modifiers if provided
  if (modifiers) {
    // Delete existing modifiers
    await prisma.menuItemModifier.deleteMany({
      where: { MenuItemID }
    })

    // Add new modifiers
    for (const modifier of modifiers) {
      await prisma.menuItemModifier.create({
        data: {
          MenuItemID,
          ModifierID: modifier.ModifierID,
          IstPflicht: modifier.IstPflicht || false,
          SortOrder: modifier.SortOrder || 0
        }
      })
    }
  }

  return menuItem
})
