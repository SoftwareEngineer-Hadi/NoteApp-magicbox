import { lazy, Suspense } from 'react'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { useSessionViewModel } from '../features/auth/useSessionViewModel'
import { messages } from '../core/i18n/messages'
import { AppShell } from '../shared/components/AppShell'
import { LoadingSkeleton } from '../shared/components/LoadingSkeleton'
import { NotFoundScreen } from '../shared/components/NotFoundScreen'

const LoginRoute = lazy(() =>
  import('./routes/LoginRoute').then((module) => ({ default: module.LoginRoute })),
)

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
  const session = useSessionViewModel()
  if (session.status === 'loading') return <LoadingSkeleton label={messages.loadingNotes} />
  if (session.status === 'error') {
    return (
      <div className="page stack">
        <div role="alert" className="alert">
          {session.error}
        </div>
        <button type="button" className="button" onClick={session.onRetry}>
          {messages.retry}
        </button>
      </div>
    )
  }

  return (
    <Suspense fallback={<LoadingSkeleton label={messages.loadingNotes} />}>
      <Routes>
        <Route
          path="login"
          element={session.email ? <Navigate to="/" replace /> : <LoginRoute />}
        />
        <Route
          element={
            session.email ? (
              <AppShell email={session.email} onLogout={session.onLogout} />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        >
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
