import prisma from '~/lib/prisma'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { WartelisteID, ...data } = body

  if (!WartelisteID) {
    throw createError({
      statusCode: 400,
      statusMessage: 'WartelisteID ist erforderlich'
    })
  }

  const updateData: any = {}

  if (data.Status) updateData.Status = data.Status
  if (data.TischID) updateData.TischID = data.TischID
  if (data.GeschaetzteWartezeit !== undefined) updateData.GeschaetzteWartezeit = data.GeschaetzteWartezeit
  if (data.Notizen !== undefined) updateData.Notizen = data.Notizen

  // Set timestamps based on status
  if (data.Status === 'Benachrichtigt') {
    updateData.BenachrichtigtUm = new Date()
  } else if (data.Status === 'Platziert') {
    updateData.PlatzierungsUm = new Date()
  }

  const eintrag = await prisma.warteliste.update({
    where: { WartelisteID },
    data: updateData
  })

  return eintrag
})
