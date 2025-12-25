import prisma from '~/lib/prisma'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)

  const menuItem = await prisma.menuItem.create({
    data: {
      ProduktID: body.ProduktID,
      KategorieID: body.KategorieID || null,
      Name: body.Name,
      Beschreibung: body.Beschreibung,
      Preis: body.Preis,
      Bild: body.Bild,
      IstVerfuegbar: body.IstVerfuegbar !== undefined ? body.IstVerfuegbar : true,
      IstTagesessen: body.IstTagesessen || false,
      Allergene: body.Allergene,
      Zutaten: body.Zutaten,
      Kalorien: body.Kalorien,
      Zubereitungszeit: body.Zubereitungszeit,
      SortOrder: body.SortOrder || 0,
      IstAktiv: body.IstAktiv !== undefined ? body.IstAktiv : true
    },
    include: {
      Produkte: true,
      MenuKategorien: true
    }
  })

  // Add modifiers if provided
  if (body.modifiers && Array.isArray(body.modifiers)) {
    for (const modifier of body.modifiers) {
      await prisma.menuItemModifier.create({
        data: {
          MenuItemID: menuItem.MenuItemID,
          ModifierID: modifier.ModifierID,
          IstPflicht: modifier.IstPflicht || false,
          SortOrder: modifier.SortOrder || 0
        }
      })
    }
  }

  return menuItem
})
