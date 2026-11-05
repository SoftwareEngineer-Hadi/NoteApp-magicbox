import { Link } from 'react-router-dom'
import type { Note } from '../../core/domain/note'
import { excerpt, formatUpdated } from '../../core/format/text'
import { messages } from '../../core/i18n/messages'
import { LoadingSkeleton } from '../../shared/components/LoadingSkeleton'

export type NoteListView = {
  query: string
  status: 'loading' | 'error' | 'ready'
  error: string | null
  canRetry: boolean
  notes: Note[]
  page: number
  pageSize: number
  total: number
  onQuery: (value: string) => void
  onPage: (page: number) => void
  onRetry: () => void
}

export function NoteListScreen({
  query,
  status,
  error,
  canRetry,
  notes,
  page,
  pageSize,
  total,
  onQuery,
  onPage,
  onRetry,
}: NoteListView) {
  const pages = Math.max(1, Math.ceil(total / pageSize))
  const showPager = total > pageSize
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
        {query ? (
          <button type="button" className="button-ghost" onClick={() => onQuery('')}>
            {messages.clearSearch}
          </button>
        ) : null}
      </form>
      {error ? (
        <div role="alert" className="alert">
          {error}
        </div>
      ) : null}
      {status === 'loading' ? <LoadingSkeleton label={messages.loadingNotes} /> : null}
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
      {status === 'ready' && showPager ? (
        <nav className="pager" aria-label={messages.pages}>
          <button
            type="button"
            className="button"
            onClick={() => onPage(page - 1)}
            disabled={page <= 1}
          >
            {messages.previousPage}
          </button>
          <p>{messages.pageStatus(page, pages)}</p>
          <button
            type="button"
            className="button"
            onClick={() => onPage(page + 1)}
            disabled={page >= pages}
          >
            {messages.nextPage}
          </button>
        </nav>
      ) : null}
    </section>
  )
}
