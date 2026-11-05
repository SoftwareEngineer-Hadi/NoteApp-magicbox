import { NoteListScreen } from '../../features/notes/NoteListScreen'
import { useNoteListViewModel } from '../../features/notes/useNoteListViewModel'

export function NoteListRoute() {
  return <NoteListScreen {...useNoteListViewModel()} />
}
