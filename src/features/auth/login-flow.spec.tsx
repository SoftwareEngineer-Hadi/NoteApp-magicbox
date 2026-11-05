import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import { describe, expect, it } from 'vitest'
import { AppRoutes } from '../../app/App'
import { messages } from '../../core/i18n/messages'
import { server } from '../../test/msw'
import { renderRoute } from '../../test/render'

describe('login flow', () => {
  it('opens the notes home after any email and password', async () => {
    let signedIn = false
    server.use(
      http.get('/api/session', () =>
        signedIn
          ? HttpResponse.json({ email: 'owner@example.com' })
          : HttpResponse.json({ error: 'Sign in first.' }, { status: 401 }),
      ),
      http.post('/api/session', async ({ request }) => {
        const body = (await request.json()) as { email: string; password: string }
        expect(body.password).toBe('any pass')
        signedIn = true
        return HttpResponse.json({ email: body.email })
      }),
      http.get('/api/notes', () => HttpResponse.json({ notes: [], page: 1, pageSize: 20, total: 0 })),
    )
    const user = userEvent.setup()
    renderRoute(<AppRoutes />)
    expect(await screen.findByRole('heading', { name: messages.signIn })).toBeInTheDocument()
    await user.type(screen.getByLabelText(messages.emailLabel), 'owner@example.com')
    await user.type(screen.getByLabelText(messages.passwordLabel), 'any pass')
    await user.click(screen.getByRole('button', { name: messages.signIn }))
    expect(await screen.findByRole('heading', { name: messages.notes })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: messages.signOut })).toBeInTheDocument()
    expect(screen.queryByLabelText(messages.passwordLabel)).not.toBeInTheDocument()
  })
})
