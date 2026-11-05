import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { messages } from '../../core/i18n/messages'
import { renderWithRouter } from '../../test/render'
import { AppShell } from './AppShell'

describe('AppShell', () => {
  it('shows the notes and ask navigation and a logout control', async () => {
    const onLogout = vi.fn()
    renderWithRouter(<AppShell email="owner@example.com" onLogout={onLogout} />)
    expect(screen.getByRole('link', { name: messages.skipToContent })).toHaveAttribute(
      'href',
      '#content',
    )
    expect(screen.getByRole('link', { name: messages.ask })).toHaveAttribute('href', '/ask')
    expect(screen.getByRole('link', { name: messages.newNote })).toHaveAttribute('href', '/notes/new')
    expect(screen.getByText(`${messages.signedInAs} owner@example.com`)).toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: messages.signOut }))
    expect(onLogout).toHaveBeenCalledOnce()
  })
})
