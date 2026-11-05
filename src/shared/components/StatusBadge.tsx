import type { AnswerSource } from '../../core/domain/note'
import { messages } from '../../core/i18n/messages'

const labels: Record<AnswerSource, string> = {
  demo: messages.sourceDemo,
  openai: messages.sourceModel,
}

export function StatusBadge({ source }: { source: AnswerSource }) {
  return (
    <p className="meta">
      <span className={source === 'openai' ? 'status-badge status-info' : 'status-badge'}>
        {messages.source}: {labels[source]}
      </span>
    </p>
  )
}

export function SourceLabel({ source }: { source: AnswerSource }) {
  return <StatusBadge source={source} />
}
