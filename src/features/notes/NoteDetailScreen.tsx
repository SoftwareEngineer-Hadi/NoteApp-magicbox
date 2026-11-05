import { useState } from 'react'
import { Link } from 'react-router-dom'
import type { Note, Summary } from '../../core/domain/note'
import { messages } from '../../core/i18n/messages'
import { ConfirmDialog } from '../../shared/components/ConfirmDialog'
import { SourceLabel } from '../../shared/components/SourceLabel'

export type NoteDetailView = {
  status: 'loading' | 'error' | 'ready'
  missing: boolean
  error: string | null
  note: Note | null
  summary: Summary | null
  summaryLoading: boolean
  summaryError: string | null
  deletePending: boolean
  deleteError: string | null
  onSummarize: () => void
  onDelete: () => void
}

export function NoteDetailScreen(props: NoteDetailView) {
  const [confirming, setConfirming] = useState(false)

  if (props.status === 'loading') return <p role="status">{messages.loadingNote}</p>
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
  if (props.status === 'error' || !props.note) {
    return (
      <div role="alert" className="alert">
        {props.error ?? messages.somethingWentWrong}
      </div>
    )
  }

  const note = props.note

  return (
    <article className="stack">
      <div className="page-header">
        <h1>{note.title}</h1>
        <div className="row-actions">
          <Link className="button" to={`/notes/${note.id}/edit`}>
            {messages.edit}
          </Link>
          <button type="button" className="button-danger" onClick={() => setConfirming(true)}>
            {messages.delete}
          </button>
        </div>
      </div>
      <div className="panel prose">{note.body || messages.noTextYet}</div>
      <div className="row-actions">
        <button
          type="button"
          className="button-primary"
          onClick={props.onSummarize}
          disabled={props.summaryLoading}
        >
          {props.summaryLoading ? messages.summarizing : messages.summarize}
        </button>
      </div>
      {props.summaryLoading ? <p role="status">{messages.summarizing}</p> : null}
      {props.summaryError ? (
        <div role="alert" className="alert">
          {props.summaryError}
        </div>
      ) : null}
      {props.deleteError ? (
        <div role="alert" className="alert">
          {props.deleteError}
        </div>
      ) : null}
      {props.summary ? (
        <section className="panel stack" aria-label={messages.summary}>
          <h2>{messages.summary}</h2>
          <p className="prose">{props.summary.summary}</p>
          <h3>{messages.suggestedActions}</h3>
          <p className="muted">{messages.actionsHint}</p>
          <ol className="action-list">
            {props.summary.actions.map((action, index) => (
              <li key={`${index}-${action}`}>{action}</li>
            ))}
          </ol>
          <SourceLabel source={props.summary.source} />
          {props.summary.notice ? (
            <div role="status" className="notice">
              <strong>{messages.noticeLabel}. </strong>
              {props.summary.notice}
            </div>
          ) : null}
        </section>
      ) : null}
      {confirming ? (
        <ConfirmDialog
          title={messages.deleteTitle}
          body={messages.deleteBody}
          confirmLabel={messages.delete}
          pending={props.deletePending}
          onCancel={() => setConfirming(false)}
          onConfirm={props.onDelete}
        />
      ) : null}
    </article>
  )
}
