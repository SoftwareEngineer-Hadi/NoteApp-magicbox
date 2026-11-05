import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ApiError } from '../../core/http/client'
import { httpNotesRepository, type NotesRepository } from '../../core/http/notes-repository'
import { messages } from '../../core/i18n/messages'
import { validateNoteDraft } from '../../core/validation/note'

export function useEditorViewModel(id?: string, repository: NotesRepository = httpNotesRepository) {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [dirty, setDirty] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const existing = useQuery({
    queryKey: ['note', id],
    queryFn: () => repository.get(id ?? ''),
    enabled: Boolean(id),
    retry: false,
  })

  useEffect(() => {
    if (!existing.data || dirty) return
    setTitle(existing.data.title)
    setBody(existing.data.body)
  }, [existing.data, dirty])

  const save = useMutation({
    mutationFn: async () => {
      const draft = validateNoteDraft(title, body)
      if (!draft.ok) throw new ApiError(draft.error, 400)
      return id ? repository.update(id, draft.value) : repository.create(draft.value)
    },
    onSuccess: async (note) => {
      await queryClient.invalidateQueries({ queryKey: ['notes'] })
      queryClient.setQueryData(['note', note.id], note)
      navigate(`/notes/${note.id}`)
    },
    onError: (reason: unknown) => {
      setError(reason instanceof ApiError ? reason.message : messages.somethingWentWrong)
    },
  })

  const missing = existing.error instanceof ApiError && existing.error.status === 404

  return {
    mode: id ? 'edit' : 'create',
    title,
    body,
    error,
    saving: save.isPending,
    loading: Boolean(id) && existing.isPending,
    missing,
    loadError: existing.isError && !missing ? messages.somethingWentWrong : null,
    onTitle: (value: string) => {
      setDirty(true)
      setTitle(value)
    },
    onBody: (value: string) => {
      setDirty(true)
      setBody(value)
    },
    onSubmit: () => {
      const draft = validateNoteDraft(title, body)
      if (!draft.ok) {
        setError(draft.error)
        return
      }
      setError(null)
      save.mutate()
    },
  } as const
}
