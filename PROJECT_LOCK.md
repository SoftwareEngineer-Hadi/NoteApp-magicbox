# PROJECT_LOCK — Smart Notes

**Status:** agent-default, from the user instruction to build the app now  
**Updated:** 2026-11-05  
**Sources:** `smart-notes/build-ready-package` 0.1.0, Magic Box frontend guidebook (web + React + testing + security)

## Product
- Name: Smart Notes
- Type: local web app for one note owner
- Platforms now: web, desktop and phone widths
- Users: the note owner. No second role. Sign-in accepts any email and password; the API still requires that session

## Stack
- Framework: Vite + React + TypeScript strict
- Architecture: feature folders. Routes are thin. Screens are presentational. Hooks are the view models. HTTP lives in one repository
- Data: TanStack Query. No Redux
- Routing: React Router
- Forms: controlled fields. Shared sanitizers and validators. Limits from the PRD
- API: REST as specified in the PRD. Express + `node:sqlite`
- UI kit: none. The package has no design system. Styling is CSS variables in `src/core/theme/global.css`
- Icons: none named. Text buttons
- Language: English, LTR. No RTL
- Theme: light only. System fonts. Reduced motion honored
- Tests: Vitest + Testing Library + MSW, and `node --test` for the API. Commands: `npm test`, `npm run test:server`

## Open design items, resolved here
- After a successful save, the app opens the saved note (flow F-02 was open)
- Delete lives on the note detail screen and asks for confirmation (placement and confirm were open). The web guide requires a confirm step for a permanent delete
- Search is debounced and capped at 200 characters

## Security lock
- Browser calls same-origin `/api` paths. `VITE_API_BASE_URL` is read only by the Vite dev proxy, so the origin is not compiled into the client bundle
- Dev proxy refuses a cleartext target that is not loopback
- `OPENAI_API_KEY` and `OPENAI_BASE_URL` stay on the server. If a key is set and the base URL is missing, the API falls back to demo mode and sets `notice`. The provider host is not hardcoded
- Production responses use Helmet, including a content security policy. CORS allows `CLIENT_ORIGIN`, or the local Vite origins when that variable is empty
- JSON bodies are limited to 200kb. Summarize and ask are rate limited. Note ids must be UUIDs. SQL uses parameters. Note text is rendered as text
- The model prompt treats note text as untrusted data. Model output is shape-checked, length-bounded, and stripped of the API key if it appears
- No `console` in `src/`. Server logs do not include note text or the key
- Sign-in stores only an httpOnly `__Host-session` cookie. The password is not stored or logged. State-changing API calls require `X-Smart-Notes: 1`. Logout clears the cookie and the client note cache
- The full enterprise AI control plane (Presidio, session gates, content policing) is not in this release. The product does not police the owner’s own note text

## Guides used
`00_OPERATING_SYSTEM.md`, `03_WEB_GUIDE.md`, `03_REACT_GUIDE.md`, `04_TESTING_GUIDE.md`, `05_SECURITY_GUIDE.md`, plus the Smart Notes PRD, stories, AI spec, and UX package.
