import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ApiError } from '../../core/http/client'
import { httpNotesRepository, type NotesRepository } from '../../core/http/notes-repository'
import { messages } from '../../core/i18n/messages'
import { validateLogin } from '../../core/validation/login'

export function useLoginViewModel(repository: NotesRepository = httpNotesRepository) {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const login = useMutation({
    mutationFn: async () => {
      const parsed = validateLogin(email, password)
      if (!parsed.ok) throw new ApiError(parsed.error, 400)
      return repository.login(parsed.value)
    },
    onSuccess: (signedIn) => {
      setPassword('')
      queryClient.setQueryData(['session'], signedIn)
      navigate('/', { replace: true })
    },
    onError: (reason: unknown) => {
      setError(reason instanceof ApiError ? reason.message : messages.somethingWentWrong)
    },
  })

  return {
    email,
    password,
    error,
    pending: login.isPending,
    onEmail: setEmail,
    onPassword: setPassword,
    onSubmit: () => {
      const parsed = validateLogin(email, password)
      if (!parsed.ok) {
        setError(parsed.error)
        return
      }
      setError(null)
      login.mutate()
    },
  } as const
}
