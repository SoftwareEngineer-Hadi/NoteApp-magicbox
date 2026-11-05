import { Link } from 'react-router-dom'
import type { Note } from '../../core/domain/note'
import { excerpt, formatUpdated } from '../../core/format/text'
import { messages } from '../../core/i18n/messages'

export type NoteListView = {
  query: string
  status: 'loading' | 'error' | 'ready'
  error: string | null
  canRetry: boolean
  notes: Note[]
  onQuery: (value: string) => void
  onRetry: () => void
}

export function NoteListScreen({
  query,
  status,
  error,
  canRetry,
  notes,
  onQuery,
  onRetry,
}: NoteListView) {
  return (
    <section className="stack">
      <div className="page-header">
        <div>
          <h1>{messages.notes}</h1>
          <p className="lede">{messages.listLede}</p>
        </div>
        <Link className="button-primary" to="/notes/new">
          {messages.newNote}
        </Link>
      </div>
      <form
        className="field"
        role="search"
        onSubmit={(event) => {
          event.preventDefault()
        }}
      >
        <label htmlFor="note-search">{messages.searchLabel}</label>
        <input
          id="note-search"
          name="q"
          value={query}
          onChange={(event) => onQuery(event.target.value)}
          placeholder={messages.searchPlaceholder}
          autoComplete="off"
          aria-invalid={status === 'error'}
        />
      </form>
      {error ? (
        <div role="alert" className="alert">
          {error}
        </div>
      ) : null}
      {status === 'loading' ? <p role="status">{messages.loadingNotes}</p> : null}
      {status === 'error' && canRetry ? (
        <button type="button" className="button" onClick={onRetry}>
          {messages.retry}
        </button>
      ) : null}
      {status === 'ready' && notes.length === 0 ? (
        <div className="panel">
          <p>{query ? messages.noSearchHit : messages.emptyNotes}</p>
          {query ? null : <p className="muted">{messages.emptyNotesHint}</p>}
        </div>
      ) : null}
      {status === 'ready' && notes.length > 0 ? (
        <ul className="note-list">
          {notes.map((note) => (
            <li key={note.id}>
              <Link className="note-link" to={`/notes/${note.id}`}>
                <strong>{note.title}</strong>
                <span>{excerpt(note.body) || messages.noTextYet}</span>
                <span className="meta">
                  {messages.updated} {formatUpdated(note.updated_at)}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      ) : null}
    </section>
  )
}
