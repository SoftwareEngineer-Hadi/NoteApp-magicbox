import { randomBytes } from 'node:crypto'

const COOKIE = '__Host-session'
const SESSION_MS = 8 * 60 * 60 * 1000
const sessions = new Map()

export function createSession(email) {
  const token = randomBytes(32).toString('hex')
  sessions.set(token, { email, expires: Date.now() + SESSION_MS })
  return token
}

export function readSession(cookieHeader) {
  if (typeof cookieHeader !== 'string' || cookieHeader.length > 4096) return null
  for (const part of cookieHeader.split(';')) {
    const trimmed = part.trim()
    const prefix = `${COOKIE}=`
    if (!trimmed.startsWith(prefix)) continue
    const token = trimmed.slice(prefix.length)
    if (!/^[a-f0-9]{64}$/.test(token)) return null
    const record = sessions.get(token)
    if (!record || record.expires <= Date.now()) {
      sessions.delete(token)
      return null
    }
    return { token, email: record.email }
  }
  return null
}

export function deleteSession(token) {
  if (token) sessions.delete(token)
}

export function sessionCookie(token) {
  return `${COOKIE}=${token}; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=${SESSION_MS / 1000}`
}

export function clearSessionCookie() {
  return `${COOKIE}=; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=0`
}
