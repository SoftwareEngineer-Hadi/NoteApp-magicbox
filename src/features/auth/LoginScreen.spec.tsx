import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { messages } from '../../core/i18n/messages'
import { renderWithRouter } from '../../test/render'
import { LoginScreen } from './LoginScreen'

const base = {
  email: '',
  password: '',
  error: null,
  pending: false,
  onEmail: vi.fn(),
  onPassword: vi.fn(),
  onSubmit: vi.fn(),
}

describe('LoginScreen', () => {
  it('masks the password, allows the field to stay editable, and submits', async () => {
    const onSubmit = vi.fn()
    renderWithRouter(<LoginScreen {...base} onSubmit={onSubmit} />)
    expect(screen.getByRole('heading', { name: messages.signIn })).toBeInTheDocument()
    expect(screen.getByLabelText(messages.passwordLabel)).toHaveAttribute('type', 'password')
    await userEvent.click(screen.getByRole('button', { name: messages.showPassword }))
    expect(screen.getByLabelText(messages.passwordLabel)).toHaveAttribute('type', 'text')
    await userEvent.click(screen.getByRole('button', { name: messages.signIn }))
    expect(onSubmit).toHaveBeenCalledOnce()
  })

  it('shows an error and disables submit while signing in', () => {
    renderWithRouter(<LoginScreen {...base} error={messages.emailInvalid} pending />)
    expect(screen.getByRole('alert')).toHaveTextContent(messages.emailInvalid)
    expect(screen.getByRole('button', { name: messages.signingIn })).toBeDisabled()
  })
})
