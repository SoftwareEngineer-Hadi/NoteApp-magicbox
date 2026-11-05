import { AskScreen } from '../../features/ask/AskScreen'
import { useAskViewModel } from '../../features/ask/useAskViewModel'

export function AskRoute() {
  return <AskScreen {...useAskViewModel()} />
}
