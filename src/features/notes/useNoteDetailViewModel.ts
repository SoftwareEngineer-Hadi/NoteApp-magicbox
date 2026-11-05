import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ApiError } from '../../core/http/client'
import { httpNotesRepository, type NotesRepository } from '../../core/http/notes-repository'
import { messages } from '../../core/i18n/messages'

export function useNoteDetailViewModel(id: string, repository: NotesRepository = httpNotesRepository) {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [localSummaryError, setLocalSummaryError] = useState<string | null>(null)

  const note = useQuery({
    queryKey: ['note', id],
    queryFn: () => repository.get(id),
    enabled: Boolean(id),
    retry: false,
  })

  const summary = useMutation({
    mutationFn: () => repository.summarize(id),
  })
  const resetSummary = summary.reset

  useEffect(() => {
    resetSummary()
    setLocalSummaryError(null)
  }, [note.data?.updated_at, resetSummary])

  const remove = useMutation({
    mutationFn: () => repository.remove(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['notes'] })
      navigate('/')
    },
  })

  const missing = note.error instanceof ApiError && note.error.status === 404
  const summaryError =
    localSummaryError ??
    (summary.isError
      ? summary.error instanceof ApiError
        ? summary.error.message
        : messages.somethingWentWrong
      : null)

  return {
    status: note.isPending ? 'loading' : note.isError ? 'error' : 'ready',
    missing,
    error: note.isError && !missing ? messages.somethingWentWrong : null,
    note: note.data ?? null,
    summary: summary.data ?? null,
    summaryLoading: summary.isPending,
    summaryError,
    deletePending: remove.isPending,
    deleteError: remove.isError ? messages.somethingWentWrong : null,
    onSummarize: () => {
      if (!note.data?.body) {
        setLocalSummaryError(messages.emptyBodySummary)
        return
      }
      setLocalSummaryError(null)
      summary.mutate()
    },
    onDelete: () => {
      remove.mutate()
    },
  } as const
}
