# سِجل الدراسة — Study Flow

> نظّم جدولك الدراسي حول أوقات الصلاة بذكاء باستخدام الذكاء الاصطناعي

![Next.js](https://img.shields.io/badge/Next.js-16-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-38bdf8)
![Vitest](https://img.shields.io/badge/Vitest-4-729b1b)

---

## 📋 Project Overview

**Study Flow** is a full-stack Next.js web application that helps Saudi students organize their study schedules around daily prayer times. Students type their tasks in natural Arabic, and the app uses AI (Groq/Llama 3.1) to generate an intelligent study plan that respects prayer times with proper buffer intervals.

### Key Features

1. **AI-Powered Scheduling** — Free-text task input in Arabic, processed by Llama 3.1 to create structured study blocks
2. **Real Prayer Times** — Fetches accurate prayer times for 15 Saudi cities via the Aladhan API
3. **Smart Merging** — Combines AI study blocks with prayer blocks, enforcing 30-minute buffers before and after each prayer
4. **Focus Timer** — Pomodoro-style countdown (25 min default, ±5 min adjustable) with start/pause/reset
5. **Manuscript Aesthetic** — Parchment/ink design with Arabic typography (Amiri + Aref Ruqaa fonts)
6. **Dark/Light Mode** — Full theme switching with smooth transitions
7. **RTL Layout** — Complete right-to-left Arabic interface

---

## 🏗️ Architecture

```
src/
├── app/
│   ├── api/
│   │   └── schedule/
│   │       └── route.ts        # Server-side API route (Groq + Aladhan)
│   ├── globals.css             # Parchment theme + animations
│   ├── layout.tsx              # Root layout with Arabic fonts
│   └── page.tsx                # Main page (renders StudyFlow)
├── components/
│   ├── StudyFlow.tsx           # Main client component (UI orchestrator)
│   ├── TimelineCard.tsx        # Individual schedule block card
│   └── FocusTimer.tsx          # Pomodoro countdown timer
└── lib/
    ├── cities.ts               # Saudi cities data + validation
    ├── schedule.ts             # Pure scheduling logic (TDD-tested)
    └── __tests__/
        └── schedule.test.ts    # Unit tests (Vitest)
```

### Architecture Rules (see AGENTS.md)

| Rule | Description |
|------|-------------|
| **API Key Security** | `GROQ_API_KEY` is used ONLY in `app/api/schedule/route.ts`. Never exposed to the browser. |
| **Server-Side Validation** | All user input (city, taskText) validated in the API route before use. |
| **Pure Utility Logic** | Schedule merging/overlap logic lives in `lib/schedule.ts` — no side effects, fully testable. |

---

## 📐 Development Phases

The project was built in 7 sequential phases:

### Phase 1: Project Scaffolding
- Initialized Next.js 16 with TypeScript, Tailwind CSS v4, App Router
- Configured Arabic fonts (Amiri, Aref Ruqaa) via `next/font/google`
- Created `.env.local` for the Groq API key
- Wrote `AGENTS.md` documenting architecture rules

### Phase 2: TDD — Test-Driven Development
This phase followed strict Red-Green TDD:

1. **Set up Vitest** — installed and configured the test framework
2. **Created stub functions** in `lib/schedule.ts` (empty implementations)
3. **Wrote 16 tests** covering:
   - `parseTime()` — time string to minutes conversion
   - `minutesToTime()` — minutes to time string conversion
   - `hasOverlap()` — overlap detection with buffer windows
   - `prayerTimesToBlocks()` — Aladhan API data conversion
   - `mergeScheduleWithPrayerTimes()` — core merge logic
4. **🔴 RED** — Ran tests, confirmed 11 failures against stubs
5. **Implemented** all functions with proper logic
6. **🟢 GREEN** — Ran tests, confirmed 16/16 pass

### Phase 3: Security Scenario
Deliberately introduced a common security vulnerability, then fixed it:

1. **Built insecure version** — Groq API called directly from client-side code with `NEXT_PUBLIC_GROQ_API_KEY`
2. **Identified the risk** — API key visible in browser DevTools and page source
3. **Fixed it** — Moved all Groq calls to a server-side Route Handler
4. **Documented in SECURITY.md** — Full write-up of the vulnerability, discovery, and fix

### Phase 4: Server-Side API Routes
- Created `POST /api/schedule` Route Handler
- Integrated Aladhan API for prayer times (Umm Al-Qura method)
- Integrated Groq API (Llama 3.1 8B Instant) for AI scheduling
- Server-side input validation (city against allowed list, taskText length check)
- Merged AI output with prayer times using `lib/schedule.ts`

### Phase 5: UI Components
- **StudyFlow.tsx** — Main orchestrator with city dropdown, task input, timeline
- **TimelineCard.tsx** — Schedule block cards with type-based icons and styling
- **FocusTimer.tsx** — Pomodoro timer with SVG progress ring

### Phase 6: Styling & Theme
- Parchment color system with CSS custom properties (light + dark)
- Tailwind v4 `@theme inline` integration
- Staggered fade-in animations for timeline items
- Loading skeleton animations
- Smooth dark/light mode transitions

### Phase 7: Polish & Verification
- Build verification (TypeScript compilation, no errors)
- Test suite passes (16/16)
- Dev server runs correctly
- Architecture rules verified against codebase

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm

### Installation

```bash
# Install dependencies
npm install

# Create environment file (already included, but update the API key if needed)
# Edit .env.local and set your Groq API key:
# GROQ_API_KEY=your_key_here
```

### Running

```bash
# Development server
npm run dev

# Open http://localhost:3000
```

### Testing

```bash
# Run all tests
npm test

# Run tests in watch mode
npx vitest
```

### Building

```bash
# Production build
npm run build

# Start production server
npm start
```

---

## 🔌 APIs Used

### Aladhan Prayer Times API
- **Endpoint**: `https://api.aladhan.com/v1/timingsByCity`
- **Authentication**: None required (free public API)
- **Method**: Umm Al-Qura (method 4, used in Saudi Arabia)
- **Called from**: Server-side only (`app/api/schedule/route.ts`)

### Groq AI API
- **Endpoint**: `https://api.groq.com/openai/v1/chat/completions`
- **Model**: `llama-3.1-8b-instant`
- **Authentication**: Bearer token via `GROQ_API_KEY` environment variable
- **Called from**: Server-side only (`app/api/schedule/route.ts`)
- **Purpose**: Generates study schedule blocks from free-text Arabic input

---

## 🔒 Security

See [SECURITY.md](./SECURITY.md) for the full security audit documenting:
- The deliberate client-side API key vulnerability
- How it was discovered
- The server-side proxy fix applied
- Verification steps

---

## 🧪 Testing

The project uses **Vitest** with a Test-Driven Development (TDD) approach.

### Test File
- `src/lib/__tests__/schedule.test.ts` — 16 unit tests

### What's Tested
| Function | Tests | Description |
|----------|-------|-------------|
| `parseTime()` | 1 | Converts "HH:mm" to minutes |
| `minutesToTime()` | 1 | Converts minutes to "HH:mm" |
| `hasOverlap()` | 5 | Overlap detection with buffers |
| `prayerTimesToBlocks()` | 4 | Aladhan data conversion |
| `mergeScheduleWithPrayerTimes()` | 5 | Core merge logic |

### TDD Cycle Evidence
```
🔴 RED   — 11 tests failed against stub implementations
🟢 GREEN — 16/16 tests pass after implementation
```

---

## 🎨 Design System

The app uses a parchment/ink manuscript aesthetic:

| Token | Light Mode | Dark Mode | Usage |
|-------|-----------|-----------|-------|
| `--paper` | `#F3E9D2` | `#2A2118` | Page background |
| `--card` | `#EBDFC0` | `#352A1E` | Card backgrounds |
| `--ink` | `#3B2A1A` | `#EAD9B5` | Primary text |
| `--ink-soft` | `#6B5842` | `#B8A582` | Secondary text |
| `--gold` | `#8C6A3F` | `#C9A15C` | Accents, prayer times |
| `--line` | `#C9B98E` | `#4A3B29` | Borders |

### Fonts
- **Amiri** — Body text (serif Arabic font)
- **Aref Ruqaa** — Display/heading text (calligraphic Arabic font)

---

## 📁 File Structure

```
AITasksManagerWithPrayerTimes/
├── .env.local                  # Groq API key (not committed)
├── .gitignore                  # Ignores .env.local, apikey.txt
├── AGENTS.md                   # Architecture rules
├── SECURITY.md                 # Security audit documentation
├── README.md                   # This file
├── package.json                # Dependencies and scripts
├── tsconfig.json               # TypeScript configuration
├── vitest.config.ts            # Test framework configuration
├── next.config.ts              # Next.js configuration
├── postcss.config.mjs          # PostCSS (Tailwind) configuration
├── src/
│   ├── app/
│   │   ├── api/schedule/route.ts
│   │   ├── globals.css
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── components/
│   │   ├── StudyFlow.tsx
│   │   ├── TimelineCard.tsx
│   │   └── FocusTimer.tsx
│   └── lib/
│       ├── cities.ts
│       ├── schedule.ts
│       └── __tests__/schedule.test.ts
└── public/                     # Static assets
```

---

## 🛠️ Technologies

| Technology | Version | Purpose |
|-----------|---------|---------|
| Next.js | 16 | Full-stack React framework |
| TypeScript | 5 | Type safety |
| Tailwind CSS | 4 | Utility-first CSS |
| Vitest | 4 | Unit testing |
| Lucide React | Latest | Icons |
| Groq SDK | HTTP API | AI text generation |
| Aladhan API | v1 | Prayer times |

---

## 📝 License

This project was built as an educational demonstration for the AI Tasks Manager with Prayer Times course project.
