import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import { describe, expect, it } from 'vitest'
import { AppRoutes } from '../../app/App'
import { messages } from '../../core/i18n/messages'
import { server } from '../../test/msw'
import { renderRoute } from '../../test/render'

const note = {
  id: '11111111-1111-4111-8111-111111111111',
  title: 'Weekend trip',
  body: 'Leave Saturday at 8. Book the lakeside cabin if it is still open.',
  created_at: '2026-11-03T00:00:00.000Z',
  updated_at: '2026-11-03T00:00:00.000Z',
}

describe('note owner flow', () => {
  it('opens a note from the list and asks across notes', async () => {
    server.use(
      http.get('/api/session', () => HttpResponse.json({ email: 'owner@example.com' })),
      http.get('/api/notes', () =>
        HttpResponse.json({ notes: [note], page: 1, pageSize: 20, total: 1 }),
      ),
      http.get('/api/notes/:id', () => HttpResponse.json(note)),
      http.post('/api/ask', () =>
        HttpResponse.json({
          answer: 'From “Weekend trip”: Leave Saturday at 8.',
          source: 'demo',
          notes: [{ id: note.id, title: note.title }],
        }),
      ),
    )
    const user = userEvent.setup()
    renderRoute(<AppRoutes />)
    await user.click(await screen.findByRole('link', { name: /Weekend trip/ }))
    expect(await screen.findByRole('link', { name: messages.edit })).toBeInTheDocument()
    expect(screen.getByText(/Book the lakeside cabin/)).toBeInTheDocument()
    await user.click(screen.getByRole('link', { name: messages.ask }))
    await user.type(await screen.findByLabelText(/Question/), 'cabin')
    await user.click(screen.getByRole('button', { name: messages.ask }))
    expect(await screen.findByText(/From “Weekend trip”/)).toBeInTheDocument()
  })
})
