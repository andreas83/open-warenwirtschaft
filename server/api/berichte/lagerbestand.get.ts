import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const standortId = query.standortId ? parseInt(query.standortId as string) : undefined

  try {
    // Build filters
    const filters: any = {}
    if (standortId) {
      filters.StandortID = standortId
    }

    // Get all inventory with product and location details
    const bestand = await prisma.bestand.findMany({
      where: filters,
      include: {
        Produkte: {
          include: {
            Einheiten: true,
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
            }
          }
        },
        Standorte: true,
        Lagerbewegungen: {
          orderBy: {
            Bewegungsdatum: 'desc'
          },
          take: 5
        }
      }
    })

    // Calculate total inventory value
    const inventoryValue = bestand.reduce((sum, b) => {
      const price = b.Produkte?.Preise?.[0]?.Preis || 0
      return sum + (Number(b.Menge) * Number(price))
    }, 0)

    // Count products by status
    const statusDistribution = {
      Verfügbar: bestand.filter(b => b.Status === 'Verf_gbar').length,
      Reserviert: bestand.filter(b => b.Status === 'Reserviert').length,
      Beschädigt: bestand.filter(b => b.Status === 'Besch_digt').length,
      Gesperrt: bestand.filter(b => b.Status === 'Gesperrt').length
    }

    // Products below minimum stock level
    const lowStockProducts = bestand.filter(b =>
      Number(b.Menge) <= Number(b.Meldebestand || 0)
    ).map(b => ({
      produktId: b.ProduktID,
      produktName: b.Produkte?.Produktname || 'Unbekannt',
      standort: b.Standorte?.Name || 'Unbekannt',
      menge: Number(b.Menge),
      meldebestand: Number(b.Meldebestand || 0),
      mindestbestand: Number(b.Mindestbestand || 0)
    }))

    // Stock by location
    const stockByLocation = bestand.reduce((acc: any, b) => {
      const locationName = b.Standorte?.Name || 'Unbekannt'
      if (!acc[locationName]) {
        acc[locationName] = {
          location: locationName,
          products: 0,
          totalQuantity: 0,
          value: 0
        }
      }
      const price = b.Produkte?.Preise?.[0]?.Preis || 0
      acc[locationName].products += 1
      acc[locationName].totalQuantity += Number(b.Menge)
      acc[locationName].value += Number(b.Menge) * Number(price)
      return acc
    }, {})

    // Top products by quantity
    const topProductsByQuantity = bestand
      .map(b => ({
        produktId: b.ProduktID,
        produktName: b.Produkte?.Produktname || 'Unbekannt',
        menge: Number(b.Menge),
        wert: Number(b.Menge) * Number(b.Produkte?.Preise?.[0]?.Preis || 0)
      }))
      .sort((a, b) => b.menge - a.menge)
      .slice(0, 10)

    // Stock movements summary (last 30 days)
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const recentMovements = await prisma.lagerbewegungen.findMany({
      where: {
        Bewegungsdatum: {
          gte: thirtyDaysAgo
        }
      },
      include: {
        Bestand: {
          include: {
            Produkte: true
          }
        },
        Benutzer: true
      },
      orderBy: {
        Bewegungsdatum: 'desc'
      },
      take: 20
    })

    // Movement types distribution
    const movementTypes = recentMovements.reduce((acc: any, m) => {
      const type = m.Bewegungstyp
      if (!acc[type]) {
        acc[type] = { type, count: 0, totalQuantity: 0 }
      }
      acc[type].count += 1
      acc[type].totalQuantity += Number(m.Menge)
      return acc
    }, {})

    // Products with expiring batches (next 90 days)
    const ninetyDaysFromNow = new Date()
    ninetyDaysFromNow.setDate(ninetyDaysFromNow.getDate() + 90)

    const expiringProducts = bestand.filter(b =>
      b.Ablaufdatum &&
      new Date(b.Ablaufdatum) <= ninetyDaysFromNow &&
      new Date(b.Ablaufdatum) >= new Date()
    ).map(b => ({
      produktId: b.ProduktID,
      produktName: b.Produkte?.Produktname || 'Unbekannt',
      chargennummer: b.Chargennummer,
      ablaufdatum: b.Ablaufdatum,
      menge: Number(b.Menge),
      standort: b.Standorte?.Name || 'Unbekannt'
    }))

    return {
      kpis: {
        totalProducts: bestand.length,
        totalInventoryValue: inventoryValue,
        lowStockCount: lowStockProducts.length,
        expiringCount: expiringProducts.length
      },
      statusDistribution,
      lowStockProducts,
      stockByLocation: Object.values(stockByLocation),
      topProductsByQuantity,
      recentMovements: recentMovements.map(m => ({
        id: m.LagerbewegungID,
        datum: m.Bewegungsdatum,
        typ: m.Bewegungstyp,
        menge: Number(m.Menge),
        produkt: m.Bestand?.Produkte?.Produktname || 'Unbekannt',
        benutzer: m.Benutzer ? `${m.Benutzer.Vorname} ${m.Benutzer.Nachname}` : 'System'
      })),
      movementTypes: Object.values(movementTypes),
      expiringProducts
    }
  } catch (error) {
    console.error('Error fetching inventory report:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Fehler beim Laden der Lagerbestandsdaten'
    })
  }
})
