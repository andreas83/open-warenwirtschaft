import prisma from '~/lib/prisma'

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)

    // Generate slug from title if not provided
    const slug = body.Slug || body.Titel.toLowerCase()
      .replace(/[^a-z0-9äöüß]+/g, '-')
      .replace(/^-+|-+$/g, '')

    const product = await prisma.shopProdukte.create({
      data: {
        ProduktID: body.ProduktID,
        ShopKategorieID: body.ShopKategorieID || null,
        Titel: body.Titel,
        Kurzbeschreibung: body.Kurzbeschreibung || null,
        Langbeschreibung: body.Langbeschreibung || null,
        Slug: slug,
        SKU: body.SKU || null,
        Preis: body.Preis,
        UVP: body.UVP || null,
        IstAktiv: body.IstAktiv !== undefined ? body.IstAktiv : true,
        IstHervorgehoben: body.IstHervorgehoben || false,
        Lagerbestand: body.Lagerbestand || 0,
        MindestBestellmenge: body.MindestBestellmenge || 1,
        MaximalBestellmenge: body.MaximalBestellmenge || null,
        Gewicht: body.Gewicht || null,
        Breite: body.Breite || null,
        Hoehe: body.Hoehe || null,
        Tiefe: body.Tiefe || null,
        HauptbildPfad: body.HauptbildPfad || null,
        BilderJSON: body.BilderJSON ? JSON.stringify(body.BilderJSON) : null,
        AttributeJSON: body.AttributeJSON ? JSON.stringify(body.AttributeJSON) : null,
        MetaTitel: body.MetaTitel || null,
        MetaBeschreibung: body.MetaBeschreibung || null,
        SortOrder: body.SortOrder || 0
      },
      include: {
        Produkte: {
          include: {
            Einheiten: true,
            Umsatzsteuersaetze: true
          }
        },
        ShopKategorien: true
      }
    })

    return product
  } catch (error: any) {
    console.error('Error creating shop product:', error)
    throw createError({
      statusCode: 500,
      message: error.message || 'Fehler beim Erstellen des Shop-Produkts'
    })
  }
})
