import { useEffect, useRef } from 'react'
import { messages } from '../../core/i18n/messages'

type ConfirmDialogProps = {
  title: string
  body: string
  confirmLabel: string
  pending: boolean
  onConfirm: () => void
  onCancel: () => void
}

export function ConfirmDialog({
  title,
  body,
  confirmLabel,
  pending,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const ref = useRef<HTMLDialogElement>(null)

  useEffect(() => {
    const dialog = ref.current
    if (!dialog) return
    dialog.showModal()
    return () => {
      dialog.close()
    }
  }, [])

  return (
    <dialog
      ref={ref}
      aria-labelledby="confirm-title"
      onCancel={(event) => {
        event.preventDefault()
        onCancel()
      }}
    >
      <div className="stack">
        <h2 id="confirm-title">{title}</h2>
        <p>{body}</p>
        <div className="row-actions">
          <button type="button" className="button-ghost" onClick={onCancel}>
            {messages.cancel}
          </button>
          <button type="button" className="button-danger" onClick={onConfirm} disabled={pending}>
            {confirmLabel}
          </button>
        </div>
      </div>
    </dialog>
  )
}
