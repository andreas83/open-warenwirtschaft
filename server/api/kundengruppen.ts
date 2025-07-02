import { PrismaClient } from '@prisma/client'
import { defineEventHandler, readBody, createError, getQuery } from 'h3'

const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
  const method = event.node.req.method

  if (method === 'GET') {
    try {
      const kundengruppen = await prisma.kundengruppen.findMany()
      return kundengruppen
    } catch (error: any) {
      throw createError({
        statusCode: 500,
        statusMessage: 'Fehler beim Abrufen der Kundengruppen',
        data: error.message || 'Unbekannter Fehler'
      })
    } finally {
      await prisma.$disconnect()
    }
  }

  if (method === 'POST') {
    try {
      const data = await readBody(event)
      const kundengruppe = await prisma.kundengruppen.create({
        data: {
          Name: data.Name,
          Beschreibung: data.Beschreibung || ''
        }
      })
      return kundengruppe
    } catch (error: any) {
      throw createError({
        statusCode: 500,
        statusMessage: 'Fehler beim Erstellen der Kundengruppe',
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
      const kundengruppeId = parseInt(query.id as string)
      if (isNaN(kundengruppeId)) {
        throw createError({
          statusCode: 400,
          statusMessage: 'Ungültige Kundengruppen-ID'
        })
      }
      const kundengruppe = await prisma.kundengruppen.update({
        where: { KundengruppeID: kundengruppeId },
        data: {
          Name: data.Name,
          Beschreibung: data.Beschreibung
        }
      })
      return kundengruppe
    } catch (error: any) {
      throw createError({
        statusCode: 500,
        statusMessage: 'Fehler beim Aktualisieren der Kundengruppe',
        data: error.message || 'Unbekannter Fehler'
      })
    } finally {
      await prisma.$disconnect()
    }
  }

  if (method === 'DELETE') {
    try {
      const query = getQuery(event)
      const kundengruppeId = parseInt(query.id as string)
      if (isNaN(kundengruppeId)) {
        throw createError({
          statusCode: 400,
          statusMessage: 'Ungültige Kundengruppen-ID'
        })
      }
      const kundengruppe = await prisma.kundengruppen.delete({
        where: { KundengruppeID: kundengruppeId }
      })
      return kundengruppe
    } catch (error: any) {
      throw createError({
        statusCode: 500,
        statusMessage: 'Fehler beim Löschen der Kundengruppe',
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
