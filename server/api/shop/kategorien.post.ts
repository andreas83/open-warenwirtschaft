import prisma from '~/lib/prisma'

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)

    // Generate slug from name if not provided
    const slug = body.Slug || body.Name.toLowerCase()
      .replace(/[^a-z0-9äöüß]+/g, '-')
      .replace(/^-+|-+$/g, '')

    const category = await prisma.shopKategorien.create({
      data: {
        Name: body.Name,
        Beschreibung: body.Beschreibung || null,
        UebergeordneteKategorieID: body.UebergeordneteKategorieID || null,
        Slug: slug,
        BildPfad: body.BildPfad || null,
        SortOrder: body.SortOrder || 0,
        IstSichtbar: body.IstSichtbar !== undefined ? body.IstSichtbar : true,
        MetaTitel: body.MetaTitel || null,
        MetaBeschreibung: body.MetaBeschreibung || null
      },
      include: {
        ShopKategorien: true,
        _count: {
          select: {
            ShopProdukte: true
          }
        }
      }
    })

    return category
  } catch (error: any) {
    console.error('Error creating shop category:', error)
    throw createError({
      statusCode: 500,
      message: error.message || 'Fehler beim Erstellen der Shop-Kategorie'
    })
  }
})
