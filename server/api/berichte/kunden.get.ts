import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const startDate = query.startDate as string | undefined
  const endDate = query.endDate as string | undefined

  try {
    // Build date filter for invoices
    const dateFilter: any = {}
    if (startDate && endDate) {
      dateFilter.Rechnungsdatum = {
        gte: new Date(startDate),
        lte: new Date(endDate)
      }
    }

    // Get all customers with their invoices
    const kunden = await prisma.kunden.findMany({
      include: {
        Rechnungen: {
          where: {
            ...dateFilter,
            StorniertAm: null
          }
        },
        Bestellungen: {
          where: startDate && endDate ? {
            Bestelldatum: {
              gte: new Date(startDate),
              lte: new Date(endDate)
            }
          } : {}
        },
        Kundengruppen: true
      }
    })

    // Calculate customer metrics
    const customerMetrics = kunden.map(k => {
      const totalRevenue = k.Rechnungen.reduce((sum, r) => sum + Number(r.GesamtbetragBrutto), 0)
      const orderCount = k.Rechnungen.length
      const averageOrderValue = orderCount > 0 ? totalRevenue / orderCount : 0
      const lastOrderDate = k.Rechnungen.length > 0
        ? new Date(Math.max(...k.Rechnungen.map(r => new Date(r.Rechnungsdatum).getTime())))
        : null

      return {
        kundenId: k.KundenID,
        name: k.Firmenname || `${k.Vorname || ''} ${k.Nachname || ''}`.trim() || 'Unbekannt',
        gruppe: k.Kundengruppen?.Name || 'Keine',
        status: k.Kundenstatus,
        totalRevenue,
        orderCount,
        averageOrderValue,
        lastOrderDate,
        email: k.Email,
        ort: k.Ort
      }
    })

    // Top customers by revenue
    const topCustomers = customerMetrics
      .sort((a, b) => b.totalRevenue - a.totalRevenue)
      .slice(0, 20)

    // Customer status distribution
    const statusDistribution = {
      Aktiv: kunden.filter(k => k.Kundenstatus === 'Aktiv').length,
      Inaktiv: kunden.filter(k => k.Kundenstatus === 'Inaktiv').length,
      Gesperrt: kunden.filter(k => k.Kundenstatus === 'Gesperrt').length
    }

    // Customer group distribution
    const groupDistribution = kunden.reduce((acc: any, k) => {
      const group = k.Kundengruppen?.Name || 'Keine Gruppe'
      if (!acc[group]) {
        acc[group] = { group, count: 0, revenue: 0 }
      }
      acc[group].count += 1
      const revenue = k.Rechnungen.reduce((sum, r) => sum + Number(r.GesamtbetragBrutto), 0)
      acc[group].revenue += revenue
      return acc
    }, {})

    // Customer acquisition over time (new customers by month)
    const customersByMonth = kunden.reduce((acc: any, k) => {
      if (k.Erstelldatum) {
        const month = new Date(k.Erstelldatum).toISOString().substring(0, 7)
        if (!acc[month]) {
          acc[month] = { month, count: 0 }
        }
        acc[month].count += 1
      }
      return acc
    }, {})

    // Customer geographic distribution
    const customersByLocation = kunden.reduce((acc: any, k) => {
      const location = k.Ort || 'Unbekannt'
      if (!acc[location]) {
        acc[location] = { location, count: 0 }
      }
      acc[location].count += 1
      return acc
    }, {})

    // RFM Analysis (Recency, Frequency, Monetary)
    const now = new Date()
    const rfmAnalysis = customerMetrics.map(cm => {
      const daysSinceLastOrder = cm.lastOrderDate
        ? Math.floor((now.getTime() - cm.lastOrderDate.getTime()) / (1000 * 60 * 60 * 24))
        : 9999

      return {
        kundenId: cm.kundenId,
        name: cm.name,
        recency: daysSinceLastOrder,
        frequency: cm.orderCount,
        monetary: cm.totalRevenue
      }
    })

    // Segment customers
    const activeCustomers = customerMetrics.filter(cm =>
      cm.lastOrderDate &&
      (now.getTime() - cm.lastOrderDate.getTime()) / (1000 * 60 * 60 * 24) <= 90
    ).length

    const churningCustomers = customerMetrics.filter(cm =>
      cm.lastOrderDate &&
      (now.getTime() - cm.lastOrderDate.getTime()) / (1000 * 60 * 60 * 24) > 90 &&
      (now.getTime() - cm.lastOrderDate.getTime()) / (1000 * 60 * 60 * 24) <= 180
    ).length

    const lostCustomers = customerMetrics.filter(cm =>
      !cm.lastOrderDate ||
      (now.getTime() - cm.lastOrderDate.getTime()) / (1000 * 60 * 60 * 24) > 180
    ).length

    return {
      kpis: {
        totalCustomers: kunden.length,
        activeCustomers,
        churningCustomers,
        lostCustomers,
        averageCustomerValue: customerMetrics.reduce((sum, cm) => sum + cm.totalRevenue, 0) / kunden.length || 0
      },
      topCustomers,
      statusDistribution,
      groupDistribution: Object.values(groupDistribution),
      customersByMonth: Object.values(customersByMonth).sort((a: any, b: any) => a.month.localeCompare(b.month)),
      customersByLocation: Object.values(customersByLocation)
        .sort((a: any, b: any) => b.count - a.count)
        .slice(0, 10),
      rfmAnalysis: rfmAnalysis.slice(0, 100),
      dateRange: { startDate, endDate }
    }
  } catch (error) {
    console.error('Error fetching customer report:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Fehler beim Laden der Kundendaten'
    })
  }
})
