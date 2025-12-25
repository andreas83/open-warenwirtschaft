import prisma from '~/lib/prisma'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)

  const modifier = await prisma.modifier.create({
    data: {
      Name: body.Name,
      Typ: body.Typ,
      Beschreibung: body.Beschreibung,
      PreisAufschlag: body.PreisAufschlag || 0,
      IstAktiv: body.IstAktiv !== undefined ? body.IstAktiv : true
    }
  })

  return modifier
})
