import { Link } from 'react-router-dom'
import { messages } from '../../core/i18n/messages'

export function NotFoundScreen() {
  return (
    <section className="panel stack">
      <h1>{messages.pageNotFound}</h1>
      <p className="lede">{messages.pageNotFoundHint}</p>
      <Link className="button" to="/">
        {messages.backToNotes}
      </Link>
    </section>
  )
}
