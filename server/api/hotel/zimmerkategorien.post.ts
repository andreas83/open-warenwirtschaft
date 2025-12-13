import prisma from '~/lib/prisma'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)

  try {
    const category = await prisma.zimmerkategorien.create({
      data: {
        Name: body.name,
        Beschreibung: body.beschreibung,
        Grundpreis: body.grundpreis,
        MaxPersonen: body.maxPersonen || 2,
        Ausstattung: body.ausstattung ? JSON.stringify(body.ausstattung) : null,
        Groesse: body.groesse,
        BildURL: body.bildURL,
        SortierReihenfolge: body.sortierReihenfolge || 0,
        IstAktiv: body.istAktiv !== undefined ? body.istAktiv : true
      }
    })

    return category
  } catch (error: any) {
    console.error('Error creating room category:', error)
    throw createError({
      statusCode: 500,
      message: error.message || 'Fehler beim Erstellen der Zimmerkategorie'
    })
  }
})
