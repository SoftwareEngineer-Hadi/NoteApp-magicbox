import { useParams } from 'react-router-dom'
import { AskScreen } from '../features/ask/AskScreen'
import { useAskViewModel } from '../features/ask/useAskViewModel'
import { EditorScreen } from '../features/notes/EditorScreen'
import { NoteDetailScreen } from '../features/notes/NoteDetailScreen'
import { NoteListScreen } from '../features/notes/NoteListScreen'
import { useEditorViewModel } from '../features/notes/useEditorViewModel'
import { useNoteDetailViewModel } from '../features/notes/useNoteDetailViewModel'
import { useNoteListViewModel } from '../features/notes/useNoteListViewModel'
import { NotFoundScreen } from '../shared/components/NotFoundScreen'

export function NoteListRoute() {
  return <NoteListScreen {...useNoteListViewModel()} />
}

export function EditorRoute() {
  const { id } = useParams()
  return <EditorScreen {...useEditorViewModel(id)} />
}

export function NoteDetailRoute() {
  const { id = '' } = useParams()
  const model = useNoteDetailViewModel(id)
  if (!id) return <NotFoundScreen />
  return <NoteDetailScreen {...model} />
}

export function AskRoute() {
  return <AskScreen {...useAskViewModel()} />
}
