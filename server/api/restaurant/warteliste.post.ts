import prisma from '~/lib/prisma'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)

  const eintrag = await prisma.warteliste.create({
    data: {
      Gastname: body.Gastname,
      Telefon: body.Telefon,
      PersonenAnzahl: body.PersonenAnzahl,
      GeschaetzteWartezeit: body.GeschaetzteWartezeit,
      Notizen: body.Notizen,
      Status: 'Wartend'
    }
  })

  return eintrag
})
