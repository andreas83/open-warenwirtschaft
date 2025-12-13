import prisma from '~/lib/prisma'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)

  try {
    const category = await prisma.zimmerkategorien.update({
      where: { ZimmerkategorieID: body.id },
      data: {
        Name: body.name,
        Beschreibung: body.beschreibung,
        Grundpreis: body.grundpreis,
        MaxPersonen: body.maxPersonen,
        Ausstattung: body.ausstattung ? JSON.stringify(body.ausstattung) : null,
        Groesse: body.groesse,
        BildURL: body.bildURL,
        SortierReihenfolge: body.sortierReihenfolge,
        IstAktiv: body.istAktiv
      }
    })

    return category
  } catch (error: any) {
    console.error('Error updating room category:', error)
    throw createError({
      statusCode: 500,
      message: error.message || 'Fehler beim Aktualisieren der Zimmerkategorie'
    })
  }
})
