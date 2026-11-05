import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { messages } from '../../core/i18n/messages'
import { renderWithRouter } from '../../test/render'
import { EditorScreen } from './EditorScreen'

const base = {
  mode: 'create' as const,
  title: '',
  body: '',
  error: null,
  saving: false,
  loading: false,
  missing: false,
  loadError: null,
  onTitle: vi.fn(),
  onBody: vi.fn(),
  onSubmit: vi.fn(),
}

describe('EditorScreen', () => {
  it('shows the title and body fields and disables save while saving', () => {
    renderWithRouter(<EditorScreen {...base} saving />)
    expect(screen.getByLabelText(/Title/)).toBeInTheDocument()
    expect(screen.getByLabelText(/Body/)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: messages.saving })).toBeDisabled()
  })

  it('shows the API error and submits', async () => {
    const onSubmit = vi.fn()
    renderWithRouter(<EditorScreen {...base} error={messages.titleRequired} onSubmit={onSubmit} />)
    expect(screen.getByRole('alert')).toHaveTextContent(messages.titleRequired)
    await userEvent.click(screen.getByRole('button', { name: messages.save }))
    expect(onSubmit).toHaveBeenCalledOnce()
  })

  it('shows a loading status and a missing note', () => {
    const { rerender } = renderWithRouter(<EditorScreen {...base} loading />)
    expect(screen.getByRole('status')).toHaveTextContent(messages.loadingNote)
    rerender(<EditorScreen {...base} missing />)
    expect(screen.getByRole('heading', { name: messages.missingNote })).toBeInTheDocument()
  })
})
