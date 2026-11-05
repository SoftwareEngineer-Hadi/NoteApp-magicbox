import { screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { messages } from '../../core/i18n/messages'
import { renderWithRouter } from '../../test/render'
import { AppShell } from './AppShell'

describe('AppShell', () => {
  it('shows the notes and ask navigation', () => {
    renderWithRouter(<AppShell />)
    expect(screen.getByRole('link', { name: messages.skipToContent })).toHaveAttribute(
      'href',
      '#content',
    )
    expect(screen.getByRole('link', { name: messages.ask })).toHaveAttribute('href', '/ask')
    expect(screen.getByRole('link', { name: messages.newNote })).toHaveAttribute('href', '/notes/new')
  })
})
