import { PrismaClient } from '@prisma/client'
import { defineEventHandler, readBody, createError, getQuery } from 'h3'

const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
  const method = event.node.req.method

  if (method === 'GET') {
    try {
      const preise = await prisma.preise.findMany()
      return preise
    } catch (error: any) {
      throw createError({
        statusCode: 500,
        statusMessage: 'Fehler beim Abrufen der Preise',
        data: error.message || 'Unbekannter Fehler'
      })
    } finally {
      await prisma.$disconnect()
    }
  }

  if (method === 'POST') {
    try {
      const data = await readBody(event)
      const preis = await prisma.preise.create({
        data: {
          ProduktID: data.ProduktID,
          Preis: data.Preis,
          Waehrung: data.Waehrung || 'EUR',
          GueltigAb: data.GueltigAb ? new Date(data.GueltigAb) : new Date(),
          GueltigBis: data.GueltigBis ? new Date(data.GueltigBis) : null,
          StandortID: data.StandortID || null,
          KundengruppeID: data.KundengruppeID || null,
          PreisTyp: data.PreisTyp || 'Standard'
        }
      })
      return preis
    } catch (error: any) {
      throw createError({
        statusCode: 500,
        statusMessage: 'Fehler beim Erstellen des Preises',
        data: error.message || 'Unbekannter Fehler'
      })
    } finally {
      await prisma.$disconnect()
    }
  }

  if (method === 'PUT') {
    try {
      const data = await readBody(event)
      const query = getQuery(event)
      const preisId = parseInt(query.id as string)
      if (isNaN(preisId)) {
        throw createError({
          statusCode: 400,
          statusMessage: 'Ungültige Preis-ID'
        })
      }
      const preis = await prisma.preise.update({
        where: { PreisID: preisId },
        data: {
          ProduktID: data.ProduktID,
          Preis: data.Preis,
          Waehrung: data.Waehrung,
          GueltigAb: data.GueltigAb ? new Date(data.GueltigAb) : undefined,
          GueltigBis: data.GueltigBis ? new Date(data.GueltigBis) : null,
          StandortID: data.StandortID || null,
          KundengruppeID: data.KundengruppeID || null,
          PreisTyp: data.PreisTyp
        }
      })
      return preis
    } catch (error: any) {
      throw createError({
        statusCode: 500,
        statusMessage: 'Fehler beim Aktualisieren des Preises',
        data: error.message || 'Unbekannter Fehler'
      })
    } finally {
      await prisma.$disconnect()
    }
  }

  if (method === 'DELETE') {
    try {
      const query = getQuery(event)
      const preisId = parseInt(query.id as string)
      if (isNaN(preisId)) {
        throw createError({
          statusCode: 400,
          statusMessage: 'Ungültige Preis-ID'
        })
      }
      const preis = await prisma.preise.delete({
        where: { PreisID: preisId }
      })
      return preis
    } catch (error: any) {
      throw createError({
        statusCode: 500,
        statusMessage: 'Fehler beim Löschen des Preises',
        data: error.message || 'Unbekannter Fehler'
      })
    } finally {
      await prisma.$disconnect()
    }
  }

  throw createError({
    statusCode: 405,
    statusMessage: 'Methode nicht erlaubt'
  })
})
