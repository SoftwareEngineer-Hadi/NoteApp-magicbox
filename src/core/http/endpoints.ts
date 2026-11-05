export const endpoints = {
  health: '/api/health',
  notes: '/api/notes',
  note: (id: string) => `/api/notes/${encodeURIComponent(id)}`,
  summarize: (id: string) => `/api/notes/${encodeURIComponent(id)}/summarize`,
  ask: '/api/ask',
} as const

export function notesCollectionPath(search: string): string {
  if (!search) return endpoints.notes
  const params = new URLSearchParams()
  params.set('q', search)
  return `${endpoints.notes}?${params.toString()}`
}
