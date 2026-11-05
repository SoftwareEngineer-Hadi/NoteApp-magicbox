import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { messages } from '../../core/i18n/messages'
import { StatusBadge } from './StatusBadge'

describe('StatusBadge', () => {
  it('names the demo and model sources in text', () => {
    const { rerender } = render(<StatusBadge source="demo" />)
    expect(screen.getByText(`${messages.source}: ${messages.sourceDemo}`)).toBeInTheDocument()
    rerender(<StatusBadge source="openai" />)
    expect(screen.getByText(`${messages.source}: ${messages.sourceModel}`)).toBeInTheDocument()
  })
})
