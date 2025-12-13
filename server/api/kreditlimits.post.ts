import prisma from '../../lib/prisma'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)

  try {
    const kreditlimit = await prisma.kreditlimits.create({
      data: {
        KundenID: body.KundenID,
        Kreditlimit: body.Kreditlimit,
        AktuelleSchuld: body.AktuelleSchuld || 0,
        Waehrung: body.Waehrung || 'EUR',
        Kreditsperre: body.Kreditsperre || false,
        Sperrgrund: body.Sperrgrund,
        Zahlungsziel: body.Zahlungsziel || 30
      }
    })
    return kreditlimit
  } catch (error: any) {
    console.error(error)
    return { status: 500, message: 'Fehler beim Erstellen des Kreditlimits', error: error.message }
  }
})
