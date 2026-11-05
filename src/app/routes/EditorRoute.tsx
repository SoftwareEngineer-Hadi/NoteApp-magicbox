import { useParams } from 'react-router-dom'
import { EditorScreen } from '../../features/notes/EditorScreen'
import { useEditorViewModel } from '../../features/notes/useEditorViewModel'

export function EditorRoute() {
  const { id } = useParams()
  return <EditorScreen {...useEditorViewModel(id)} />
}
