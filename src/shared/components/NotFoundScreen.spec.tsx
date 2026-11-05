import { screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { messages } from '../../core/i18n/messages'
import { renderWithRouter } from '../../test/render'
import { NotFoundScreen } from './NotFoundScreen'

describe('NotFoundScreen', () => {
  it('explains the missing page and links back to notes', () => {
    renderWithRouter(<NotFoundScreen />)
    expect(screen.getByRole('heading', { name: messages.pageNotFound })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: messages.backToNotes })).toHaveAttribute('href', '/')
  })
})
