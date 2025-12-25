import prisma from '~/lib/prisma'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { ModifierID, ...data } = body

  if (!ModifierID) {
    throw createError({
      statusCode: 400,
      statusMessage: 'ModifierID ist erforderlich'
    })
  }

  const modifier = await prisma.modifier.update({
    where: { ModifierID },
    data: {
      Name: data.Name,
      Typ: data.Typ,
      Beschreibung: data.Beschreibung,
      PreisAufschlag: data.PreisAufschlag,
      IstAktiv: data.IstAktiv
    }
  })

  return modifier
})
