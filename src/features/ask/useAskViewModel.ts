import { useMutation } from '@tanstack/react-query'
import { useState } from 'react'
import { ApiError } from '../../core/http/client'
import { httpNotesRepository, type NotesRepository } from '../../core/http/notes-repository'
import { messages } from '../../core/i18n/messages'
import { validateQuestion } from '../../core/validation/note'

export function useAskViewModel(repository: NotesRepository = httpNotesRepository) {
  const [question, setQuestion] = useState('')
  const [error, setError] = useState<string | null>(null)
  const ask = useMutation({
    mutationFn: async () => {
      const parsed = validateQuestion(question)
      if (!parsed.ok) throw new ApiError(parsed.error, 400)
      return repository.ask(parsed.value)
    },
    onError: (reason: unknown) => {
      setError(reason instanceof ApiError ? reason.message : messages.somethingWentWrong)
    },
  })

  return {
    question,
    asking: ask.isPending,
    error,
    answer: ask.data ?? null,
    onQuestion: setQuestion,
    onSubmit: () => {
      const parsed = validateQuestion(question)
      if (!parsed.ok) {
        setError(parsed.error)
        return
      }
      setError(null)
      ask.mutate()
    },
  } as const
}
