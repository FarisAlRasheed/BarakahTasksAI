<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

---

# Study Flow — Architecture Rules

These rules are **mandatory** for all code in this project. Any PR or commit that violates them must be rejected.

## 1. API Key Security

The Groq API key (`GROQ_API_KEY`) must **never** be sent to or used in the browser.

- The key is stored in `.env.local` and accessed only via `process.env.GROQ_API_KEY`
- All Groq API calls happen **exclusively** inside `app/api/schedule/route.ts` (a server-side Route Handler)
- No client component, page, or utility imported by a client component may reference the key
- The `.env.local` file is listed in `.gitignore` and must never be committed

## 2. Server-Side Input Validation

All incoming user input (`city`, `taskText`) must be validated on the **server side** inside the API route before being used.

- `city` must be checked against the allowed list in `lib/cities.ts`
- `taskText` must be a non-empty string, maximum 2000 characters
- Invalid input returns a 400 response with a descriptive error message
- Never trust client-side validation alone

## 3. Separation of Scheduling Logic

Scheduling and merging logic must live in a **separate, pure, testable utility file** (`lib/schedule.ts`).

- `mergeScheduleWithPrayerTimes()` — merges AI study blocks with prayer time blocks
- `prayerTimesToBlocks()` — converts Aladhan API timings to internal `TimeBlock` format
- `hasOverlap()` — checks if two blocks overlap considering a buffer window
- `parseTime()` — converts "HH:mm" strings to minutes since midnight

These functions:
- Must be **pure** (no side effects, no API calls, no state)
- Must be covered by **unit tests** (`lib/__tests__/schedule.test.ts`)
- Must **not** be inlined in API routes or React components
