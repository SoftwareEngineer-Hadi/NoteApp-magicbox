import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { httpNotesRepository, type NotesRepository } from '../../core/http/notes-repository'
import { messages } from '../../core/i18n/messages'

export function useSessionViewModel(repository: NotesRepository = httpNotesRepository) {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const session = useQuery({
    queryKey: ['session'],
    queryFn: () => repository.session(),
    retry: false,
  })
  const logout = useMutation({
    mutationFn: () => repository.logout(),
    onSettled: () => {
      queryClient.setQueryData(['session'], null)
      queryClient.removeQueries({ queryKey: ['notes'] })
      queryClient.removeQueries({ queryKey: ['note'] })
      navigate('/login', { replace: true })
    },
  })

  return {
    status: session.isPending ? 'loading' : session.isError ? 'error' : 'ready',
    email: session.data?.email ?? null,
    error: session.isError ? messages.somethingWentWrong : null,
    onLogout: () => {
      logout.mutate()
    },
    onRetry: () => {
      void session.refetch()
    },
  } as const
}
