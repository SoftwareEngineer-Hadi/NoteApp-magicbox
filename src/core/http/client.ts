import { messages } from '../i18n/messages'

const REQUEST_TIMEOUT_MS = 25_000

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error('timeout')), ms)
    promise.then(
      (value) => {
        clearTimeout(timer)
        resolve(value)
      },
      (error: unknown) => {
        clearTimeout(timer)
        reject(error instanceof Error ? error : new Error('request failed'))
      },
    )
  })
}

export class ApiError extends Error {
  readonly status: number

  constructor(message: string, status: number) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

function messageFromPayload(payload: unknown, status: number): string {
  if (status === 413) return messages.requestTooLarge
  if (status === 429) return messages.tooManyRequests
  if (payload && typeof payload === 'object' && 'error' in payload) {
    const value = payload.error
    if (typeof value === 'string') {
      const text = value.replace(/[<>]/g, '').trim().slice(0, 300)
      if (text) return text
    }
  }
  if (status === 404) return messages.missingNote
  return messages.somethingWentWrong
}

export async function requestJson<T>(path: string, init: RequestInit = {}): Promise<T> {
  const headers = new Headers(init.headers)
  headers.set('Accept', 'application/json')
  headers.set('X-Smart-Notes', '1')
  if (init.body !== undefined) headers.set('Content-Type', 'application/json')

  let response: Response
  try {
    response = await withTimeout(
      fetch(new URL(path, window.location.origin), {
        ...init,
        headers,
        credentials: 'same-origin',
      }),
      REQUEST_TIMEOUT_MS,
    )
  } catch {
    throw new ApiError(messages.somethingWentWrong, 0)
  }

  const text = await response.text()
  let payload: unknown = null
  if (text) {
    try {
      payload = JSON.parse(text) as unknown
    } catch {
      throw new ApiError(messages.somethingWentWrong, response.status)
    }
  }

  if (!response.ok) {
    throw new ApiError(messageFromPayload(payload, response.status), response.status)
  }

  return payload as T
}
