import { messages } from '../../core/i18n/messages'
import type { AnswerSource } from '../../core/domain/note'

export function SourceLabel({ source }: { source: AnswerSource }) {
  return (
    <p className="meta">
      <span>
        {messages.source}: {source === 'demo' ? messages.sourceDemo : messages.sourceModel}
      </span>
    </p>
  )
}
