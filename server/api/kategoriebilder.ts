import prisma from '../../lib/prisma'
import { defineEventHandler, readBody, getQuery } from 'h3'
import { existsSync, mkdirSync } from 'fs'
import { writeFile } from 'fs/promises'
import path from 'path'

export default defineEventHandler(async (event) => {
  const method = event.node.req.method
  const query = getQuery(event)
  const id = query.id ? parseInt(query.id as string) : null

  const uploadDir = path.join(process.cwd(), 'public/uploads/kategorien')
  if (!existsSync(uploadDir)) {
    mkdirSync(uploadDir, { recursive: true })
  }

  try {
    if (method === 'GET') {
      if (id) {
        const bild = await prisma.kategorieBilder.findUnique({
          where: { BildID: id }
        })
        if (!bild) {
          return { status: 404, message: 'Bild nicht gefunden' }
        }
        return bild
      } else {
        const bilder = await prisma.kategorieBilder.findMany({
          orderBy: { Erstelldatum: 'desc' }
        })
        return bilder
      }
    } else if (method === 'POST') {
      const body = await readBody(event)
      if (!body.KategorieID || !body.file) {
        return { status: 400, message: 'KategorieID und Datei sind erforderlich' }
      }

      const kategorieId = parseInt(body.KategorieID)
      const file = body.file
      const fileName = `${Date.now()}-${file.name}`
      const filePath = path.join(uploadDir, fileName)

      await writeFile(filePath, Buffer.from(file.data, 'base64'))

      const newBild = await prisma.kategorieBilder.create({
        data: {
          KategorieID: kategorieId,
          BildPfad: `/uploads/kategorien/${fileName}`,
          IstHauptbild: body.IstHauptbild || false
        }
      })

      // If this is set as the main image, update others to not be main
      if (body.IstHauptbild) {
        await prisma.kategorieBilder.updateMany({
          where: {
            KategorieID: kategorieId,
            BildID: { not: newBild.BildID }
          },
          data: { IstHauptbild: false }
        })
      }

      return { status: 201, data: newBild }
    } else if (method === 'PUT' && id) {
      const body = await readBody(event)
      if (body.IstHauptbild !== undefined) {
        const bild = await prisma.kategorieBilder.findUnique({
          where: { BildID: id }
        })
        if (!bild) {
          return { status: 404, message: 'Bild nicht gefunden' }
        }

        const updatedBild = await prisma.kategorieBilder.update({
          where: { BildID: id },
          data: { IstHauptbild: body.IstHauptbild }
        })

        // If this is set as the main image, update others to not be main
        if (body.IstHauptbild) {
          await prisma.kategorieBilder.updateMany({
            where: {
              KategorieID: bild.KategorieID,
              BildID: { not: id }
            },
            data: { IstHauptbild: false }
          })
        }

        return { status: 200, data: updatedBild }
      }
      return { status: 400, message: 'Ungültige Anfrage' }
    } else if (method === 'DELETE' && id) {
      const bild = await prisma.kategorieBilder.findUnique({
        where: { BildID: id }
      })
      if (!bild) {
        return { status: 404, message: 'Bild nicht gefunden' }
      }

      // Optionally, delete the file from the filesystem if it exists
      const filePath = path.join(process.cwd(), 'public', bild.BildPfad)
      if (existsSync(filePath)) {
        // Uncomment to enable file deletion
        // unlinkSync(filePath)
      }

      await prisma.kategorieBilder.delete({
        where: { BildID: id }
      })
      return { status: 204, message: 'Bild gelöscht' }
    } else {
      return { status: 405, message: 'Methode nicht erlaubt' }
    }
  } catch (error: any) {
    console.error(error)
    return { status: 500, message: 'Interner Serverfehler', error: error.message }
  }
})
