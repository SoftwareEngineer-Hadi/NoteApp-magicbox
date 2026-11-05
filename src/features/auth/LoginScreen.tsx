import { useState } from 'react'
import { limits } from '../../core/validation/sanitize'
import { messages } from '../../core/i18n/messages'

export type LoginView = {
  email: string
  password: string
  error: string | null
  pending: boolean
  onEmail: (value: string) => void
  onPassword: (value: string) => void
  onSubmit: () => void
}

export function LoginScreen(props: LoginView) {
  const [visible, setVisible] = useState(false)

  return (
    <section className="login-page stack">
      <div className="page-header">
        <div>
          <h1>{messages.signIn}</h1>
          <p className="lede">{messages.loginLede}</p>
        </div>
      </div>
      <form
        className="panel stack"
        onSubmit={(event) => {
          event.preventDefault()
          props.onSubmit()
        }}
      >
        <label className="field" htmlFor="email">
          {messages.emailLabel}
        </label>
        <input
          id="email"
          name="email"
          type="text"
          inputMode="email"
          autoComplete="username"
          autoCapitalize="none"
          spellCheck={false}
          value={props.email}
          maxLength={limits.emailMax}
          onChange={(event) => props.onEmail(event.target.value)}
          aria-invalid={Boolean(props.error)}
        />
        <label className="field" htmlFor="password">
          {messages.passwordLabel}
        </label>
        <input
          id="password"
          name="password"
          type={visible ? 'text' : 'password'}
          autoComplete="current-password"
          spellCheck={false}
          value={props.password}
          maxLength={limits.passwordMax}
          onChange={(event) => props.onPassword(event.target.value)}
          aria-invalid={Boolean(props.error)}
        />
        <button type="button" className="button-ghost" onClick={() => setVisible((current) => !current)}>
          {visible ? messages.hidePassword : messages.showPassword}
        </button>
        {props.error ? (
          <div role="alert" className="alert">
            {props.error}
          </div>
        ) : null}
        <button type="submit" className="button-primary" disabled={props.pending}>
          {props.pending ? messages.signingIn : messages.signIn}
        </button>
      </form>
    </section>
  )
}
