export const endpoints = {
  health: '/api/health',
  session: '/api/session',
  notes: '/api/notes',
  note: (id: string) => `/api/notes/${encodeURIComponent(id)}`,
  summarize: (id: string) => `/api/notes/${encodeURIComponent(id)}/summarize`,
  ask: '/api/ask',
} as const

export function notesCollectionPath(search: string, page = 1): string {
  const params = new URLSearchParams()
  if (search) params.set('q', search)
  if (page > 1) params.set('page', String(page))
  const query = params.toString()
  return query ? `${endpoints.notes}?${query}` : endpoints.notes
}
