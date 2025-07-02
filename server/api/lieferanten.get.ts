import prisma from '../../lib/prisma'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)

  try {
    if (query.id) {
      const lieferant = await prisma.lieferanten.findUnique({
        where: { LieferantenID: parseInt(query.id as string) }
      })
      if (!lieferant) {
        return { status: 404, message: 'Lieferant nicht gefunden' }
      }
      // Map database fields to frontend expected fields
      return {
        LieferantenID: lieferant.LieferantenID,
        Name: lieferant.Firmenname,
        Telefon: lieferant.Telefon || '',
        Email: lieferant.Email || '',
        Adresse: lieferant.Adresse || '',
        PLZ: lieferant.PLZ || '',
        Ort: lieferant.Ort || '',
        Land: lieferant.Land || ''
      }
    } else {
      const limit = parseInt(query.limit as string) || 10
      const offset = parseInt(query.offset as string) || 0
      const search = query.search as string || ''
      
      // Build the where clause for search if provided
      const whereClause = search ? {
        OR: [
          { Firmenname: { contains: search, mode: 'insensitive' } },
          { Adresse: { contains: search, mode: 'insensitive' } },
          { Telefon: { contains: search, mode: 'insensitive' } },
          { Email: { contains: search, mode: 'insensitive' } }
        ]
      } : {}
      
      // Fetch the total count of suppliers matching the search criteria
      const totalCount = await prisma.lieferanten.count({
        where: whereClause
      })
      
      // Fetch the paginated list of suppliers
      const lieferanten = await prisma.lieferanten.findMany({
        where: whereClause,
        take: limit,
        skip: offset
      })
      
      return {
        data: lieferanten,
        total: totalCount
      }
    }
  } catch (error: any) {
    console.error(error)
    return { status: 500, message: 'Interner Serverfehler', error: error.message }
  }
})
