import { Link } from 'react-router-dom'
import type { Answer } from '../../core/domain/note'
import { messages } from '../../core/i18n/messages'
import { limits } from '../../core/validation/sanitize'
import { SourceLabel } from '../../shared/components/SourceLabel'

export type AskView = {
  question: string
  asking: boolean
  error: string | null
  answer: Answer | null
  onQuestion: (value: string) => void
  onSubmit: () => void
}

export function AskScreen(props: AskView) {
  return (
    <section className="stack">
      <div>
        <h1>{messages.askHeading}</h1>
        <p className="lede">{messages.askHint}</p>
      </div>
      <form
        className="panel stack"
        onSubmit={(event) => {
          event.preventDefault()
          props.onSubmit()
        }}
      >
        <label className="field">
          <span>
            {messages.questionLabel} ({props.question.trim().length}/{limits.questionMax})
          </span>
          <textarea
            name="question"
            value={props.question}
            onChange={(event) => props.onQuestion(event.target.value)}
            autoComplete="off"
            aria-invalid={Boolean(props.error)}
          />
        </label>
        {props.error ? (
          <div role="alert" className="alert">
            {props.error}
          </div>
        ) : null}
        <div className="row-actions">
          <button type="submit" className="button-primary" disabled={props.asking}>
            {props.asking ? messages.asking : messages.ask}
          </button>
        </div>
      </form>
      {props.asking ? <p role="status">{messages.asking}</p> : null}
      {props.answer ? (
        <section className="panel stack" aria-label={messages.askHeading}>
          <p className="prose">{props.answer.answer}</p>
          <SourceLabel source={props.answer.source} />
          {props.answer.notice ? (
            <div role="status" className="notice">
              <strong>{messages.noticeLabel}. </strong>
              {props.answer.notice}
            </div>
          ) : null}
          {props.answer.notes.length > 0 ? (
            <div className="stack">
              <h2>{messages.relatedNotes}</h2>
              <ul className="note-list">
                {props.answer.notes.map((note) => (
                  <li key={note.id}>
                    <Link className="note-link" to={`/notes/${note.id}`}>
                      <strong>{note.title}</strong>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </section>
      ) : null}
    </section>
  )
}
