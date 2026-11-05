import { Link } from 'react-router-dom'
import { limits } from '../../core/validation/sanitize'
import { messages } from '../../core/i18n/messages'
import { LoadingSkeleton } from '../../shared/components/LoadingSkeleton'

export type EditorView = {
  mode: 'create' | 'edit'
  title: string
  body: string
  error: string | null
  saving: boolean
  loading: boolean
  missing: boolean
  loadError: string | null
  onTitle: (value: string) => void
  onBody: (value: string) => void
  onSubmit: () => void
}

export function EditorScreen(props: EditorView) {
  if (props.loading) return <LoadingSkeleton label={messages.loadingNote} rows={2} />
  if (props.missing) {
    return (
      <section className="panel stack">
        <h1>{messages.missingNote}</h1>
        <Link className="button" to="/">
          {messages.backToNotes}
        </Link>
      </section>
    )
  }

  return (
    <section className="stack">
      <div className="page-header">
        <h1>{props.mode === 'create' ? messages.newNote : messages.edit}</h1>
        <Link className="button-ghost" to="/">
          {messages.backToNotes}
        </Link>
      </div>
      {props.loadError ? (
        <div role="alert" className="alert">
          {props.loadError}
        </div>
      ) : null}
      <form
        className="panel stack"
        onSubmit={(event) => {
          event.preventDefault()
          props.onSubmit()
        }}
      >
        <label className="field">
          <span>
            {messages.titleLabel} ({props.title.trim().length}/{limits.titleMax})
          </span>
          <input
            name="title"
            value={props.title}
            onChange={(event) => props.onTitle(event.target.value)}
            autoComplete="off"
            aria-invalid={Boolean(props.error)}
          />
        </label>
        <label className="field">
          <span>
            {messages.bodyLabel} ({props.body.trim().length}/{limits.bodyMax})
          </span>
          <textarea
            name="body"
            value={props.body}
            onChange={(event) => props.onBody(event.target.value)}
            autoComplete="off"
          />
        </label>
        {props.error ? (
          <div role="alert" className="alert">
            {props.error}
          </div>
        ) : null}
        <div className="row-actions">
          <button type="submit" className="button-primary" disabled={props.saving}>
            {props.saving ? messages.saving : messages.save}
          </button>
        </div>
      </form>
    </section>
  )
}
