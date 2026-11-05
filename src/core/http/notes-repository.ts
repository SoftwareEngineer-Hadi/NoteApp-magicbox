import type { Answer, LoginInput, Note, NoteDraft, NotePage, Session, Summary } from '../domain/note'
import { ApiError, requestJson } from './client'
import { endpoints, notesCollectionPath } from './endpoints'
import { mapAnswer, mapNote, mapNotePage, mapSession, mapSummary } from './mappers'

export type NotesRepository = {
  session(): Promise<Session | null>
  login(input: LoginInput): Promise<Session>
  logout(): Promise<void>
  list(query: string, page: number): Promise<NotePage>
  get(id: string): Promise<Note>
  create(input: NoteDraft): Promise<Note>
  update(id: string, input: NoteDraft): Promise<Note>
  remove(id: string): Promise<void>
  summarize(id: string): Promise<Summary>
  ask(question: string): Promise<Answer>
}

export const httpNotesRepository: NotesRepository = {
  async session() {
    try {
      return mapSession(await requestJson(endpoints.session))
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) return null
      throw error
    }
  },
  async login(input) {
    return mapSession(
      await requestJson(endpoints.session, {
        method: 'POST',
        body: JSON.stringify({ email: input.email, password: input.password }),
      }),
    )
  },
  async logout() {
    await requestJson(endpoints.session, { method: 'DELETE' })
  },
  async list(query, page) {
    return mapNotePage(await requestJson(notesCollectionPath(query, page)))
  },
  async get(id) {
    return mapNote(await requestJson(endpoints.note(id)))
  },
  async create(input) {
    return mapNote(
      await requestJson(endpoints.notes, {
        method: 'POST',
        body: JSON.stringify(input),
      }),
    )
  },
  async update(id, input) {
    return mapNote(
      await requestJson(endpoints.note(id), {
        method: 'PUT',
        body: JSON.stringify(input),
      }),
    )
  },
  async remove(id) {
    await requestJson(endpoints.note(id), { method: 'DELETE' })
  },
  async summarize(id) {
    return mapSummary(
      await requestJson(endpoints.summarize(id), {
        method: 'POST',
        body: JSON.stringify({}),
      }),
    )
  },
  async ask(question) {
    return mapAnswer(
      await requestJson(endpoints.ask, {
        method: 'POST',
        body: JSON.stringify({ question }),
      }),
    )
  },
}
