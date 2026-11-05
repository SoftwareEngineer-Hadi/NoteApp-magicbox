import { NavLink, Outlet } from 'react-router-dom'
import { messages } from '../../core/i18n/messages'

export function AppShell({ email, onLogout }: { email: string; onLogout: () => void }) {
  return (
    <div className="shell">
      <a className="skip-link" href="#content">
        {messages.skipToContent}
      </a>
      <header className="topbar">
        <NavLink className="brand" to="/">
          {messages.appName}
        </NavLink>
        <nav className="nav" aria-label={messages.appName}>
          <NavLink to="/" end>
            {messages.notes}
          </NavLink>
          <NavLink to="/ask">{messages.ask}</NavLink>
          <NavLink to="/notes/new">{messages.newNote}</NavLink>
          <span className="meta">
            {messages.signedInAs} {email}
          </span>
          <button type="button" className="button-ghost" onClick={onLogout}>
            {messages.signOut}
          </button>
        </nav>
      </header>
      <main id="content" className="page">
        <Outlet />
      </main>
      <p className="shell-note">{messages.shellNote}</p>
    </div>
  )
}
