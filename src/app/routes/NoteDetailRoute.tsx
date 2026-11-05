import { useParams } from 'react-router-dom'
import { NoteDetailScreen } from '../../features/notes/NoteDetailScreen'
import { useNoteDetailViewModel } from '../../features/notes/useNoteDetailViewModel'
import { NotFoundScreen } from '../../shared/components/NotFoundScreen'

export function NoteDetailRoute() {
  const { id = '' } = useParams()
  const model = useNoteDetailViewModel(id)
  if (!id) return <NotFoundScreen />
  return <NoteDetailScreen {...model} />
}
