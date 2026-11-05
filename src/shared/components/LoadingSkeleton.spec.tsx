import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { messages } from '../../core/i18n/messages'
import { LoadingSkeleton } from './LoadingSkeleton'

describe('LoadingSkeleton', () => {
  it('announces the loading label', () => {
    render(<LoadingSkeleton label={messages.loadingNotes} />)
    expect(screen.getByRole('status')).toHaveTextContent(messages.loadingNotes)
  })
})
