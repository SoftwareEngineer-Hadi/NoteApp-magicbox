import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { messages } from '../../core/i18n/messages'
import { renderWithRouter } from '../../test/render'
import { NoteListScreen } from './NoteListScreen'

const note = {
  id: '11111111-1111-4111-8111-111111111111',
  title: 'Weekly grocery run',
  body: 'Need milk, eggs, and sourdough before Thursday.',
  created_at: '2026-11-03T00:00:00.000Z',
  updated_at: '2026-11-03T00:00:00.000Z',
}

function view(overrides: Partial<Parameters<typeof NoteListScreen>[0]> = {}) {
  return {
    query: '',
    status: 'ready' as const,
    error: null,
    canRetry: false,
    notes: [note],
    page: 1,
    pageSize: 20,
    total: 1,
    onQuery: vi.fn(),
    onPage: vi.fn(),
    onRetry: vi.fn(),
    ...overrides,
  }
}

describe('NoteListScreen', () => {
  it('shows notes and the new-note action', () => {
    renderWithRouter(<NoteListScreen {...view()} />)
    expect(screen.getByRole('heading', { name: messages.notes })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: messages.newNote })).toHaveAttribute('href', '/notes/new')
    expect(screen.getByRole('link', { name: /Weekly grocery run/ })).toHaveAttribute(
      'href',
      `/notes/${note.id}`,
    )
  })

  it('shows a loading status', () => {
    renderWithRouter(<NoteListScreen {...view({ status: 'loading', notes: [] })} />)
    expect(screen.getByRole('status')).toHaveTextContent(messages.loadingNotes)
  })

  it('distinguishes an empty library from a search miss', () => {
    const { rerender } = renderWithRouter(<NoteListScreen {...view({ notes: [] })} />)
    expect(screen.getByText(messages.emptyNotes)).toBeInTheDocument()
    rerender(
      <NoteListScreen {...view({ notes: [], query: 'quantum' })} />,
    )
    expect(screen.getByText(messages.noSearchHit)).toBeInTheDocument()
  })

  it('shows the server error and retries', async () => {
    const onRetry = vi.fn()
    renderWithRouter(
      <NoteListScreen
        {...view({
          status: 'error',
          error: messages.somethingWentWrong,
          canRetry: true,
          notes: [],
          onRetry,
        })}
      />,
    )
    await userEvent.click(screen.getByRole('button', { name: messages.retry }))
    expect(onRetry).toHaveBeenCalledOnce()
  })

  it('clears the search and moves to the next server page', async () => {
    const onQuery = vi.fn()
    const onPage = vi.fn()
    renderWithRouter(
      <NoteListScreen {...view({ query: 'milk', page: 1, pageSize: 2, total: 3, onQuery, onPage })} />,
    )
    await userEvent.click(screen.getByRole('button', { name: messages.clearSearch }))
    expect(onQuery).toHaveBeenCalledWith('')
    expect(screen.getByText(messages.pageStatus(1, 2))).toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: messages.nextPage }))
    expect(onPage).toHaveBeenCalledWith(2)
  })
})
