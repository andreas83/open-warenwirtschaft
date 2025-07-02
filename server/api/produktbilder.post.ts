import prisma from '../../lib/prisma'
import { createReadStream, createWriteStream } from 'fs'
import { mkdir } from 'fs/promises'
import { join, basename } from 'path'
import { Readable } from 'stream'

export default defineEventHandler(async (event) => {
  try {
    // Ensure the upload directory exists
    const uploadDir = join('public', 'uploads', 'produkte')
    await mkdir(uploadDir, { recursive: true })

    // Read the multipart form data
    const formData = await readMultipartFormData(event)
    if (!formData || formData.length === 0) {
      return { status: 400, message: 'Keine Dateien hochgeladen' }
    }

    const produktIdField = formData.find(f => f.name === 'produktId')
    if (!produktIdField || !produktIdField.data) {
      return { status: 400, message: 'Produkt-ID fehlt' }
    }

    const produktId = parseInt(produktIdField.data.toString(), 10)
    const files = formData.filter(f => f.filename && f.type && f.type.includes('image'))

    if (files.length === 0) {
      return { status: 400, message: 'Keine Bilddateien gefunden' }
    }

    const savedImages: any[] = []
    for (const file of files) {
      const fileName = `${Date.now()}-${basename(file.filename || 'unnamed-file')}`
      const filePath = join(uploadDir, fileName)
      const relativePath = `/uploads/produkte/${fileName}`

      // Save the file to the upload directory
      await new Promise<void>((resolve, reject) => {
        const writeStream = createWriteStream(filePath)
        const readStream = Readable.from(file.data)
        readStream.pipe(writeStream)
        writeStream.on('finish', () => resolve())
        writeStream.on('error', (err) => reject(err))
      })

      // Save the image reference to the database
      const isMainImage: boolean = savedImages.length === 0 // Set the first image as the main image by default
      const image: any = await prisma.produktBilder.create({
        data: {
          ProduktID: produktId,
          BildPfad: relativePath,
          IstHauptbild: isMainImage
        }
      })

      savedImages.push(image)
    }

    return { status: 201, data: savedImages, message: `${savedImages.length} Bilder erfolgreich hochgeladen` }
  } catch (error: unknown) {
    console.error(error)
    return { status: 500, message: 'Interner Serverfehler', error: String(error) }
  }
})
