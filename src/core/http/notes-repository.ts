import type { Answer, Note, NoteDraft, Summary } from '../domain/note'
import { requestJson } from './client'
import { endpoints, notesCollectionPath } from './endpoints'
import { mapAnswer, mapNote, mapNotes, mapSummary } from './mappers'

export type NotesRepository = {
  list(query: string): Promise<Note[]>
  get(id: string): Promise<Note>
  create(input: NoteDraft): Promise<Note>
  update(id: string, input: NoteDraft): Promise<Note>
  remove(id: string): Promise<void>
  summarize(id: string): Promise<Summary>
  ask(question: string): Promise<Answer>
}

export const httpNotesRepository: NotesRepository = {
  async list(query) {
    return mapNotes(await requestJson(notesCollectionPath(query)))
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
