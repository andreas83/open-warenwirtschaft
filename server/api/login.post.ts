import { PrismaClient } from '@prisma/client'
import { setCookie } from 'h3'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { benutzername, passwort } = body

  if (!benutzername || !passwort) {
    return {
      status: 400,
      body: { error: 'Benutzername und Passwort sind erforderlich' }
    }
  }

  const benutzer = await prisma.benutzer.findUnique({
    where: { Benutzername: benutzername }
  })

  if (!benutzer || !(await bcrypt.compare(passwort, benutzer.PasswortHash))) {
    return {
      status: 401,
      body: { error: 'Ungültige Anmeldedaten' }
    }
  }

  if (!benutzer.IstAktiv) {
    return {
      status: 403,
      body: { error: 'Benutzerkonto ist deaktiviert' }
    }
  }

  setCookie(event, 'auth-session', JSON.stringify({
    id: benutzer.BenutzerID,
    username: benutzer.Benutzername,
    role: benutzer.Rolle
  }), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 60 * 60 * 24 * 7, // 1 week
    path: '/'
  })

  return {
    status: 200,
    body: { message: 'Anmeldung erfolgreich', user: { id: benutzer.BenutzerID, username: benutzer.Benutzername, role: benutzer.Rolle } }
  }
})
