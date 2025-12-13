import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const startDate = query.startDate as string | undefined
  const endDate = query.endDate as string | undefined

  try {
    // Build date filter
    const dateFilter: any = {}
    if (startDate && endDate) {
      dateFilter.Rechnungsdatum = {
        gte: new Date(startDate),
        lte: new Date(endDate)
      }
    }

    // Get all products with sales data
    const produkte = await prisma.produkte.findMany({
      include: {
        Rechnungspositionen: {
          include: {
            Rechnungen: {
              where: {
                ...dateFilter,
                StorniertAm: null
              }
            }
          }
        },
        Bestand: true,
        Preise: {
          where: {
            PreisTyp: 'Standard',
            GueltigAb: {
              lte: new Date()
            },
            OR: [
              { GueltigBis: null },
              { GueltigBis: { gte: new Date() } }
            ]
          },
          take: 1
        },
        ProduktZuKategorie: {
          include: {
            Produktkategorien: true
          }
        },
        Einheiten: true
      }
    })

    // Calculate product metrics
    const productMetrics = produkte.map(p => {
      const salesPositions = p.Rechnungspositionen.filter(rp => rp.Rechnungen && !rp.Rechnungen.StorniertAm)
      const totalRevenue = salesPositions.reduce((sum, rp) =>
        sum + Number(rp.GesamtpreisNettoPosition) + Number(rp.MwSt_Betrag), 0
      )
      const totalQuantitySold = salesPositions.reduce((sum, rp) => sum + Number(rp.Menge), 0)
      const salesCount = salesPositions.length
      const averagePrice = salesCount > 0 ? totalRevenue / totalQuantitySold : 0

      const totalStock = p.Bestand.reduce((sum, b) => sum + Number(b.Menge), 0)
      const stockValue = totalStock * Number(p.Preise[0]?.Preis || 0)

      return {
        produktId: p.ProduktID,
        name: p.Produktname,
        artikelnummer: p.Artikelnummer,
        kategorie: p.ProduktZuKategorie[0]?.Produktkategorien?.Name || 'Keine',
        totalRevenue,
        totalQuantitySold,
        salesCount,
        averagePrice,
        currentPrice: Number(p.Preise[0]?.Preis || 0),
        totalStock,
        stockValue,
        einheit: p.Einheiten?.Symbol || ''
      }
    })

    // Best selling products by revenue
    const topProductsByRevenue = productMetrics
      .filter(pm => pm.totalRevenue > 0)
      .sort((a, b) => b.totalRevenue - a.totalRevenue)
      .slice(0, 20)

    // Best selling products by quantity
    const topProductsByQuantity = productMetrics
      .filter(pm => pm.totalQuantitySold > 0)
      .sort((a, b) => b.totalQuantitySold - a.totalQuantitySold)
      .slice(0, 20)

    // Slow movers (products with low sales)
    const slowMovers = productMetrics
      .filter(pm => pm.totalStock > 0 && pm.totalQuantitySold < 5)
      .sort((a, b) => b.stockValue - a.stockValue)
      .slice(0, 20)

    // Products with no sales
    const noSales = productMetrics
      .filter(pm => pm.totalQuantitySold === 0)
      .sort((a, b) => b.stockValue - a.stockValue)
      .slice(0, 20)

    // Revenue by category
    const revenueByCategory = productMetrics.reduce((acc: any, pm) => {
      const category = pm.kategorie
      if (!acc[category]) {
        acc[category] = {
          category,
          revenue: 0,
          quantity: 0,
          products: 0
        }
      }
      acc[category].revenue += pm.totalRevenue
      acc[category].quantity += pm.totalQuantitySold
      acc[category].products += 1
      return acc
    }, {})

    // Stock value by category
    const stockValueByCategory = productMetrics.reduce((acc: any, pm) => {
      const category = pm.kategorie
      if (!acc[category]) {
        acc[category] = {
          category,
          stockValue: 0,
          products: 0
        }
      }
      acc[category].stockValue += pm.stockValue
      acc[category].products += 1
      return acc
    }, {})

    // Product profitability (simplified - revenue vs stock value)
    const profitability = productMetrics.map(pm => ({
      produktId: pm.produktId,
      name: pm.name,
      revenue: pm.totalRevenue,
      stockValue: pm.stockValue,
      margin: pm.stockValue > 0 ? ((pm.totalRevenue - pm.stockValue) / pm.totalRevenue) * 100 : 0
    }))
      .filter(p => p.revenue > 0)
      .sort((a, b) => b.margin - a.margin)
      .slice(0, 20)

    // Sales trends over time
    const salesByMonth: any = {}
    produkte.forEach(p => {
      p.Rechnungspositionen.forEach(rp => {
        if (rp.Rechnungen && !rp.Rechnungen.StorniertAm) {
          const month = new Date(rp.Rechnungen.Rechnungsdatum).toISOString().substring(0, 7)
          if (!salesByMonth[month]) {
            salesByMonth[month] = { month, revenue: 0, quantity: 0 }
          }
          salesByMonth[month].revenue += Number(rp.GesamtpreisNettoPosition) + Number(rp.MwSt_Betrag)
          salesByMonth[month].quantity += Number(rp.Menge)
        }
      })
    })

    return {
      kpis: {
        totalProducts: produkte.length,
        productsWithSales: productMetrics.filter(pm => pm.totalQuantitySold > 0).length,
        totalRevenue: productMetrics.reduce((sum, pm) => sum + pm.totalRevenue, 0),
        totalStockValue: productMetrics.reduce((sum, pm) => sum + pm.stockValue, 0),
        averagePrice: productMetrics.reduce((sum, pm) => sum + pm.currentPrice, 0) / produkte.length || 0
      },
      topProductsByRevenue,
      topProductsByQuantity,
      slowMovers,
      noSales,
      revenueByCategory: Object.values(revenueByCategory)
        .sort((a: any, b: any) => b.revenue - a.revenue),
      stockValueByCategory: Object.values(stockValueByCategory)
        .sort((a: any, b: any) => b.stockValue - a.stockValue),
      profitability,
      salesByMonth: Object.values(salesByMonth)
        .sort((a: any, b: any) => a.month.localeCompare(b.month)),
      dateRange: { startDate, endDate }
    }
  } catch (error) {
    console.error('Error fetching product report:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Fehler beim Laden der Produktdaten'
    })
  }
})
