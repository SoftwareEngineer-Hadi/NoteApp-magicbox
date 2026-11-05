import { lazy, Suspense } from 'react'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { messages } from '../core/i18n/messages'
import { AppShell } from '../shared/components/AppShell'
import { LoadingSkeleton } from '../shared/components/LoadingSkeleton'
import { NotFoundScreen } from '../shared/components/NotFoundScreen'

const NoteListRoute = lazy(() =>
  import('./routes/NoteListRoute').then((module) => ({ default: module.NoteListRoute })),
)
const EditorRoute = lazy(() =>
  import('./routes/EditorRoute').then((module) => ({ default: module.EditorRoute })),
)
const NoteDetailRoute = lazy(() =>
  import('./routes/NoteDetailRoute').then((module) => ({ default: module.NoteDetailRoute })),
)
const AskRoute = lazy(() =>
  import('./routes/AskRoute').then((module) => ({ default: module.AskRoute })),
)

export function AppRoutes() {
  return (
    <Suspense fallback={<LoadingSkeleton label={messages.loadingNotes} />}>
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
    </Suspense>
  )
}

export function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  )
}
