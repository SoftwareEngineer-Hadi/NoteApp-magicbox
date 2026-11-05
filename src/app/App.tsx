import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { AskRoute, EditorRoute, NoteDetailRoute, NoteListRoute } from './routes'
import { AppShell } from '../shared/components/AppShell'
import { NotFoundScreen } from '../shared/components/NotFoundScreen'

export function AppRoutes() {
  return (
    <Routes>
      <Route element={<AppShell />}>
        <Route index element={<NoteListRoute />} />
        <Route path="notes/new" element={<EditorRoute />} />
        <Route path="notes/:id" element={<NoteDetailRoute />} />
        <Route path="notes/:id/edit" element={<EditorRoute />} />
        <Route path="ask" element={<AskRoute />} />
        <Route path="*" element={<NotFoundScreen />} />
      </Route>
    </Routes>
  )
}

export function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  )
}
