import { useQuery } from '@tanstack/react-query'
import { useEffect, useState } from 'react'
import { ApiError } from '../../core/http/client'
import { httpNotesRepository, type NotesRepository } from '../../core/http/notes-repository'
import { messages } from '../../core/i18n/messages'
import { validateSearch } from '../../core/validation/note'

export function useNoteListViewModel(repository: NotesRepository = httpNotesRepository) {
  const [query, setQuery] = useState('')
  const [debounced, setDebounced] = useState('')
  const [searchError, setSearchError] = useState<string | null>(null)

  useEffect(() => {
    const handle = window.setTimeout(() => {
      const result = validateSearch(query)
      if (!result.ok) {
        setSearchError(result.error)
        return
      }
      setSearchError(null)
      setDebounced(result.value)
    }, 300)
    return () => window.clearTimeout(handle)
  }, [query])

  const list = useQuery({
    queryKey: ['notes', debounced],
    queryFn: () => repository.list(debounced),
    enabled: searchError === null,
  })

  const status = searchError || list.isError ? 'error' : list.isPending ? 'loading' : 'ready'
  const error =
    searchError ??
    (list.isError
      ? list.error instanceof ApiError
        ? list.error.message
        : messages.somethingWentWrong
      : null)

  return {
    query,
    status,
    error,
    canRetry: list.isError && !searchError,
    notes: list.data ?? [],
    onQuery: setQuery,
    onRetry: () => {
      void list.refetch()
    },
  } as const
}
