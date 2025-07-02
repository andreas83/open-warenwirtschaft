import prisma from '../../lib/prisma'
import { unlink } from 'fs/promises'
import { join } from 'path'

export default defineEventHandler(async (event) => {
  try {
    const query = getQuery(event)
    
    if (!query.id) {
      return { status: 400, message: 'Bild-ID fehlt' }
    }

    const bildId = parseInt(query.id as string)
    const bild = await prisma.produktBilder.findUnique({
      where: { BildID: bildId }
    })

    if (!bild) {
      return { status: 404, message: 'Bild nicht gefunden' }
    }

    // Delete the image file from the server
    const filePath = join('public', bild.BildPfad)
    try {
      await unlink(filePath)
    } catch (fileError) {
      console.error(`Fehler beim Löschen der Datei ${filePath}:`, fileError)
      // Continue with database deletion even if file deletion fails
    }

    // Delete the image record from the database
    await prisma.produktBilder.delete({
      where: { BildID: bildId }
    })

    return { status: 200, message: 'Bild erfolgreich gelöscht' }
  } catch (error: unknown) {
    console.error(error)
    return { status: 500, message: 'Interner Serverfehler', error: String(error) }
  }
})
