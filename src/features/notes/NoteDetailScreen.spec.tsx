import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { messages } from '../../core/i18n/messages'
import { renderWithRouter } from '../../test/render'
import { NoteDetailScreen } from './NoteDetailScreen'

const note = {
  id: '11111111-1111-4111-8111-111111111111',
  title: 'Weekend trip',
  body: 'Leave Saturday at 8.',
  created_at: '2026-11-03T00:00:00.000Z',
  updated_at: '2026-11-03T00:00:00.000Z',
}

function view(overrides: Partial<Parameters<typeof NoteDetailScreen>[0]> = {}) {
  return {
    status: 'ready' as const,
    missing: false,
    error: null,
    note,
    summary: null,
    summaryLoading: false,
    summaryError: null,
    deletePending: false,
    deleteError: null,
    onSummarize: vi.fn(),
    onDelete: vi.fn(),
    ...overrides,
  }
}

describe('NoteDetailScreen', () => {
  it('asks for a summary from the note', async () => {
    const onSummarize = vi.fn()
    renderWithRouter(<NoteDetailScreen {...view({ onSummarize })} />)
    await userEvent.click(screen.getByRole('button', { name: messages.summarize }))
    expect(onSummarize).toHaveBeenCalledOnce()
  })

  it('shows the summary, three actions, and a fallback notice', () => {
    renderWithRouter(
      <NoteDetailScreen
        {...view({
          summary: {
            summary: 'Leave Saturday at 8.',
            actions: ['Pack a charger', 'Check the train', 'Book the cabin'],
            source: 'demo',
            notice: 'The AI service did not respond, so this is a local summary.',
          },
        })}
      />,
    )
    expect(screen.getByRole('region', { name: messages.summary })).toHaveTextContent(
      'Leave Saturday at 8.',
    )
    expect(screen.getAllByRole('listitem')).toHaveLength(3)
    expect(screen.getByRole('status')).toHaveTextContent('local summary')
    expect(screen.getByText(messages.actionsHint)).toBeInTheDocument()
  })

  it('shows the empty-body error', () => {
    renderWithRouter(
      <NoteDetailScreen {...view({ summaryError: messages.emptyBodySummary })} />,
    )
    expect(screen.getByRole('alert')).toHaveTextContent(messages.emptyBodySummary)
  })

  it('confirms before delete and can be cancelled', async () => {
    const onDelete = vi.fn()
    renderWithRouter(<NoteDetailScreen {...view({ onDelete })} />)
    await userEvent.click(screen.getByRole('button', { name: messages.delete }))
    expect(screen.getByRole('dialog')).toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: messages.cancel }))
    expect(onDelete).not.toHaveBeenCalled()
  })
})
