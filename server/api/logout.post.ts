import { setCookie } from 'h3'

export default defineEventHandler(async (event) => {
  setCookie(event, 'auth-session', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 0 // This will delete the cookie
  })

  return {
    status: 200,
    body: { message: 'Abmeldung erfolgreich' }
  }
})
