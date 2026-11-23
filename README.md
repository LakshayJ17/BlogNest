# BlogNest

BlogNest is a blogging platform where people write, publish, and discover stories, with optional AI help for drafting and summarizing.

Live site: [blognest.bylakshayjain.online](https://blognest.bylakshayjain.online)

## Features

- Email and Google sign-in
- Rich text editor with drafts, topics, and editing of published stories
- Search, topic filters, and sorting by latest or most liked
- Likes, sharing, and reporting
- AI first drafts and one-click article summaries, using Groq, Gemini, OpenRouter, or OpenAI
- An automatic content check before a post goes public
- A moderation dashboard for admins

## Tech stack

| Part | Tools | Hosting |
| --- | --- | --- |
| Frontend | React 19, Vite, Tailwind CSS 4, React Router, Zustand, Tiptap | Vercel |
| Backend | Express 5, Prisma, PostgreSQL, Zod, `openai` SDK (works with any OpenAI-compatible provider) | Render |

## Getting started

You need Node.js 20 or newer and a PostgreSQL database.

**1. Backend**

```sh
cd backend
npm install
cp .env.example .env      # then fill in DATABASE_URL and JWT_SECRET
npx prisma migrate deploy
npm run dev               # http://localhost:8787
```

**2. Frontend**

```sh
cd frontend
npm install
cp .env.example .env      # optional locally; see the file for details
npm run dev               # http://localhost:5173
```

## AI providers

The AI features (drafting, summaries, and the pre-publish content check) work with any provider that speaks the OpenAI API. Set one key in `backend/.env`:

| Provider | Variable | Cost | Get a key |
| --- | --- | --- | --- |
| Groq (default) | `GROQ_API_KEY` | Free tier, no card | [console.groq.com/keys](https://console.groq.com/keys) |
| Google Gemini | `GEMINI_API_KEY` | Free tier | [aistudio.google.com/apikey](https://aistudio.google.com/apikey) |
| OpenRouter | `OPENROUTER_API_KEY` | Free models | [openrouter.ai/keys](https://openrouter.ai/keys) |
| OpenAI | `OPENAI_API_KEY` | Paid | [platform.openai.com](https://platform.openai.com/api-keys) |

You can also run a local model with Ollama by setting `AI_PROVIDER=custom`, `AI_BASE_URL`, and `AI_MODEL`. With no key at all, the site still works: AI buttons show a friendly "not set up" message and posts publish without the content check. All options are documented in [`backend/.env.example`](backend/.env.example).

## Security

- Post HTML is sanitized when saved (server) and again when shown (browser), so scripts in posts never run.
- Google sign-in tokens are verified with Google on the server.
- Login tokens expire after 7 days by default, and every API route is rate limited.
- AI endpoints require a post ID or a signed-in user, so they can't be used as an open AI proxy.

Never commit `.env` files. If a secret is ever committed, rotate it, because removing the file later doesn't remove it from git history.
