import prisma from '~/lib/prisma'

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    const { items } = body

    if (!items || !Array.isArray(items) || items.length === 0) {
      throw createError({ statusCode: 400, message: 'Keine Artikel im Warenkorb' })
    }

    // Validate each item and get current prices/availability
    const validatedItems = await Promise.all(
      items.map(async (item: any) => {
        const product = await prisma.shopProdukte.findUnique({
          where: { ShopProduktID: item.ShopProduktID },
          include: {
            Produkte: {
              include: {
                Umsatzsteuersaetze: true
              }
            }
          }
        })

        if (!product) {
          return {
            ...item,
            valid: false,
            error: 'Produkt nicht gefunden'
          }
        }

        if (!product.IstAktiv) {
          return {
            ...item,
            valid: false,
            error: 'Produkt ist nicht mehr verfügbar'
          }
        }

        if (product.Lagerbestand < item.Menge) {
          return {
            ...item,
            valid: false,
            error: `Nur ${product.Lagerbestand} Stück verfügbar`,
            availableQuantity: product.Lagerbestand
          }
        }

        const currentPrice = product.Angebotspreis || product.Preis
        const vatRate = product.Produkte?.Umsatzsteuersaetze?.Satz || 19

        return {
          ShopProduktID: product.ShopProduktID,
          Titel: product.Titel,
          Preis: currentPrice,
          Menge: item.Menge,
          Hauptbild: product.Hauptbild,
          Lagerbestand: product.Lagerbestand,
          UmsatzsteuersatzID: product.Produkte?.UmsatzsteuersatzID,
          Umsatzsteuersatz: vatRate,
          valid: true,
          subtotal: currentPrice * item.Menge,
          vat: (currentPrice * item.Menge * vatRate) / (100 + vatRate),
          total: currentPrice * item.Menge
        }
      })
    )

    const allValid = validatedItems.every(item => item.valid)
    const subtotal = validatedItems.reduce((sum, item) => sum + (item.subtotal || 0), 0)
    const vatTotal = validatedItems.reduce((sum, item) => sum + (item.vat || 0), 0)
    const total = validatedItems.reduce((sum, item) => sum + (item.total || 0), 0)

    return {
      items: validatedItems,
      allValid,
      summary: {
        subtotal,
        vat: vatTotal,
        shipping: 0, // Can be calculated based on address
        total
      }
    }
  } catch (error: any) {
    console.error('Error validating cart:', error)
    throw createError({
      statusCode: error.statusCode || 500,
      message: error.message || 'Fehler beim Validieren des Warenkorbs'
    })
  }
})
