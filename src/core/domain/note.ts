export type Note = {
  id: string
  title: string
  body: string
  created_at: string
  updated_at: string
}

export type NoteDraft = {
  title: string
  body: string
}

export type NotePage = {
  notes: Note[]
  page: number
  pageSize: number
  total: number
}

export type AnswerSource = 'demo' | 'openai'

export type Summary = {
  summary: string
  actions: [string, string, string]
  source: AnswerSource
  notice?: string
}

export type RelatedNote = {
  id: string
  title: string
}

export type Answer = {
  answer: string
  source: AnswerSource
  notes: RelatedNote[]
  notice?: string
}
