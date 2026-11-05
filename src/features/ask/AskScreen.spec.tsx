import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { messages } from '../../core/i18n/messages'
import { renderWithRouter } from '../../test/render'
import { AskScreen } from './AskScreen'

const base = {
  question: '',
  asking: false,
  error: null,
  answer: null,
  onQuestion: vi.fn(),
  onSubmit: vi.fn(),
}

describe('AskScreen', () => {
  it('submits a question and shows a loading status', async () => {
    const onSubmit = vi.fn()
    const { rerender } = renderWithRouter(<AskScreen {...base} onSubmit={onSubmit} />)
    await userEvent.click(screen.getByRole('button', { name: messages.ask }))
    expect(onSubmit).toHaveBeenCalledOnce()
    rerender(<AskScreen {...base} asking />)
    expect(screen.getByRole('button', { name: messages.asking })).toBeDisabled()
    expect(screen.getByRole('status')).toHaveTextContent(messages.asking)
  })

  it('shows a no-match answer without related notes', () => {
    renderWithRouter(
      <AskScreen
        {...base}
        answer={{
          answer: 'None of the saved notes mention that. Try a word from a title or from the note text.',
          source: 'demo',
          notes: [],
        }}
      />,
    )
    expect(screen.getByText(/None of the saved notes mention that/)).toBeInTheDocument()
    expect(screen.queryByRole('heading', { name: messages.relatedNotes })).not.toBeInTheDocument()
  })

  it('links a related note', () => {
    renderWithRouter(
      <AskScreen
        {...base}
        answer={{
          answer: 'From “Weekend trip”: Leave Saturday at 8.',
          source: 'demo',
          notes: [{ id: '11111111-1111-4111-8111-111111111111', title: 'Weekend trip' }],
          notice: 'The AI service did not respond, so this answer comes from the saved notes directly.',
        }}
      />,
    )
    expect(screen.getByRole('link', { name: 'Weekend trip' })).toHaveAttribute(
      'href',
      '/notes/11111111-1111-4111-8111-111111111111',
    )
    expect(screen.getByText(/saved notes directly/)).toBeInTheDocument()
  })

  it('shows a validation error', () => {
    renderWithRouter(<AskScreen {...base} error={messages.questionRequired} />)
    expect(screen.getByRole('alert')).toHaveTextContent(messages.questionRequired)
  })
})
