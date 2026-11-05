# Smart Notes

A local notes app with four screens: the note list, the editor, a note with a summary, and one question across the saved notes.

Notes are stored in SQLite. Summaries and answers are built from the note text. If `OPENAI_API_KEY` and `OPENAI_BASE_URL` are both set, those two jobs can use the model. The key stays on the server. Without a key, the same screens still answer in demo mode.

This app follows the Smart Notes build-ready package and the Magic Box React, web, testing, and security guides. Decisions are recorded in `PROJECT_LOCK.md`.

## Develop

```bash
cp .env.example .env
```

Set `VITE_API_BASE_URL` to the local API origin (`http://127.0.0.1:3001`) and leave the key blank for demo mode. Then:

```bash
npm install
npm run dev
```

Open the Vite site on port 5173. The browser talks only to that origin. Vite proxies `/api` to the API.

## Production build

```bash
npm install
npm run build
npm start
```

The API serves `dist/` and the JSON API on `PORT` (default 3001).

## Model answers

Copy `.env.example` to `.env`. Set `OPENAI_API_KEY` only on the server. Set `OPENAI_BASE_URL` to the provider base from the product contract, `https://api.openai.com/v1`. Do not put the key in a `VITE_` variable.

## Checks

```bash
npm test
npm run test:server
npm run lint
npm run build
```
