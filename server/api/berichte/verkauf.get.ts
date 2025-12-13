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

    // Get all invoices within date range
    const rechnungen = await prisma.rechnungen.findMany({
      where: {
        ...dateFilter,
        StorniertAm: null
      },
      include: {
        Kunden: true,
        Rechnungspositionen: {
          include: {
            Produkte: true
          }
        },
        Zahlungen: true
      },
      orderBy: {
        Rechnungsdatum: 'asc'
      }
    })

    // Calculate KPIs
    const totalRevenue = rechnungen.reduce((sum, r) => sum + Number(r.GesamtbetragBrutto), 0)
    const totalRevenueNetto = rechnungen.reduce((sum, r) => sum + Number(r.GesamtbetragNetto), 0)
    const totalInvoices = rechnungen.length
    const averageInvoiceValue = totalInvoices > 0 ? totalRevenue / totalInvoices : 0

    // Revenue by month
    const revenueByMonth = rechnungen.reduce((acc: any, r) => {
      const month = new Date(r.Rechnungsdatum).toISOString().substring(0, 7)
      if (!acc[month]) {
        acc[month] = { month, revenue: 0, count: 0 }
      }
      acc[month].revenue += Number(r.GesamtbetragBrutto)
      acc[month].count += 1
      return acc
    }, {})

    // Revenue by status
    const revenueByStatus = rechnungen.reduce((acc: any, r) => {
      const status = r.Zahlungsstatus || 'Unbekannt'
      if (!acc[status]) {
        acc[status] = { status, revenue: 0, count: 0 }
      }
      acc[status].revenue += Number(r.GesamtbetragBrutto)
      acc[status].count += 1
      return acc
    }, {})

    // Payment status distribution
    const statusDistribution = {
      Offen: rechnungen.filter(r => r.Zahlungsstatus === 'Offen').length,
      Teilbezahlt: rechnungen.filter(r => r.Zahlungsstatus === 'Teilbezahlt').length,
      Bezahlt: rechnungen.filter(r => r.Zahlungsstatus === 'Bezahlt').length,
      Überfällig: rechnungen.filter(r => r.Zahlungsstatus === 'Überfällig').length,
      Storniert: rechnungen.filter(r => r.Zahlungsstatus === 'Storniert').length
    }

    // Revenue by day of week
    const revenueByDayOfWeek = rechnungen.reduce((acc: any, r) => {
      const dayOfWeek = new Date(r.Rechnungsdatum).getDay()
      const dayNames = ['Sonntag', 'Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag']
      const dayName = dayNames[dayOfWeek]
      if (!acc[dayName]) {
        acc[dayName] = { day: dayName, revenue: 0, count: 0 }
      }
      acc[dayName].revenue += Number(r.GesamtbetragBrutto)
      acc[dayName].count += 1
      return acc
    }, {})

    // Tax breakdown
    const taxBreakdown = rechnungen.reduce((acc: any, r) => {
      const taxAmount = Number(r.MwSt_Gesamt) || 0
      if (!acc.total) acc.total = 0
      acc.total += taxAmount
      return acc
    }, {})

    // Top products by revenue
    const productRevenue: any = {}
    rechnungen.forEach(r => {
      r.Rechnungspositionen.forEach(pos => {
        const produktId = pos.ProduktID
        const produktName = pos.Produkte?.Produktname || 'Unbekannt'
        if (!productRevenue[produktId]) {
          productRevenue[produktId] = {
            id: produktId,
            name: produktName,
            revenue: 0,
            quantity: 0
          }
        }
        productRevenue[produktId].revenue += Number(pos.GesamtpreisNettoPosition) + Number(pos.MwSt_Betrag)
        productRevenue[produktId].quantity += Number(pos.Menge)
      })
    })

    const topProducts = Object.values(productRevenue)
      .sort((a: any, b: any) => b.revenue - a.revenue)
      .slice(0, 10)

    return {
      kpis: {
        totalRevenue,
        totalRevenueNetto,
        totalInvoices,
        averageInvoiceValue,
        totalTax: taxBreakdown.total
      },
      revenueByMonth: Object.values(revenueByMonth).sort((a: any, b: any) => a.month.localeCompare(b.month)),
      revenueByStatus: Object.values(revenueByStatus),
      statusDistribution,
      revenueByDayOfWeek: Object.values(revenueByDayOfWeek),
      topProducts,
      dateRange: { startDate, endDate }
    }
  } catch (error) {
    console.error('Error fetching sales report:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Fehler beim Laden der Verkaufsdaten'
    })
  }
})
