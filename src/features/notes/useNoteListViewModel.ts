import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { useEffect, useState } from 'react'
import { ApiError } from '../../core/http/client'
import { httpNotesRepository, type NotesRepository } from '../../core/http/notes-repository'
import { messages } from '../../core/i18n/messages'
import { validateSearch } from '../../core/validation/note'

export function useNoteListViewModel(repository: NotesRepository = httpNotesRepository) {
  const [query, setQuery] = useState('')
  const [debounced, setDebounced] = useState('')
  const [page, setPage] = useState(1)
  const [searchError, setSearchError] = useState<string | null>(null)

  useEffect(() => {
    const handle = window.setTimeout(() => {
      const result = validateSearch(query)
      if (!result.ok) {
        setSearchError(result.error)
        return
      }
      setSearchError(null)
      if (result.value !== debounced) setPage(1)
      setDebounced(result.value)
    }, 300)
    return () => window.clearTimeout(handle)
  }, [debounced, query])

  const list = useQuery({
    queryKey: ['notes', debounced, page],
    queryFn: () => repository.list(debounced, page),
    enabled: searchError === null,
    placeholderData: keepPreviousData,
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
    notes: list.data?.notes ?? [],
    page,
    pageSize: list.data?.pageSize ?? 20,
    total: list.data?.total ?? 0,
    onQuery: setQuery,
    onPage: setPage,
    onRetry: () => {
      void list.refetch()
    },
  } as const
}
