# Security Audit — Study Flow

## Vulnerability Found: API Key Exposure in Client-Side Code

### What Happened

During the initial implementation, the Groq API call was made **directly from the
browser** inside a React client component. The code looked like this:

```tsx
// ⚠️ INSECURE — This was the initial (broken) implementation
"use client";

async function generateSchedule(taskText: string, prayerTimes: object) {
  const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      // 🚨 API KEY EXPOSED IN THE BROWSER!
      Authorization: `Bearer ${process.env.NEXT_PUBLIC_GROQ_API_KEY}`,
    },
    body: JSON.stringify({
      model: "llama-3.1-8b-instant",
      messages: [
        {
          role: "user",
          content: `Schedule study tasks: ${taskText}`,
        },
      ],
    }),
  });
  return response.json();
}
```

### The Risk

1. **API Key visible in Network tab**: Anyone opening Chrome DevTools → Network
   could see the `Authorization: Bearer gsk_...` header in the request.

2. **API Key in client bundle**: Using `NEXT_PUBLIC_` prefix causes Next.js to
   inline the environment variable into the JavaScript bundle sent to every user's
   browser. Anyone can extract it from the page source.

3. **Abuse potential**: A malicious user could copy the API key and:
   - Make unlimited API calls at the project owner's expense
   - Use the key for purposes that violate the Groq Terms of Service
   - Exhaust the API quota, causing a denial of service for real users

4. **Cannot be revoked easily**: Once an API key is leaked to a browser, it
   should be considered permanently compromised — even after fixing the code,
   the old key must be rotated.

### How It Was Found

1. Opened the application in Chrome and navigated to the main screen
2. Opened DevTools (F12) → Network tab
3. Triggered the "رتّب" (organize) button
4. Inspected the outgoing request to `api.groq.com`
5. Saw the full `Authorization` header containing the API key in plaintext
6. Additionally, viewing the page source (Ctrl+U) and searching for `gsk_`
   revealed the key embedded in the JavaScript bundle

### The Fix

The Groq API call was moved entirely **server-side** into a Next.js Route Handler
at `app/api/schedule/route.ts`. The fix has three parts:

#### 1. Environment Variable — No `NEXT_PUBLIC_` Prefix

```diff
# .env.local
- NEXT_PUBLIC_GROQ_API_KEY=gsk_...
+ GROQ_API_KEY=gsk_...
```

Without the `NEXT_PUBLIC_` prefix, Next.js does NOT expose the variable to the
client bundle. It is only available in server-side code.

#### 2. Server-Side Route Handler

```typescript
// app/api/schedule/route.ts — runs ONLY on the server
export async function POST(request: Request) {
  const { city, taskText } = await request.json();

  // Validate inputs server-side
  // ... validation logic ...

  // Groq API call — key is accessed server-side only
  const response = await fetch(
    "https://api.groq.com/openai/v1/chat/completions",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
      },
      body: JSON.stringify({ /* ... */ }),
    }
  );

  const data = await response.json();
  return Response.json(data);
}
```

#### 3. Client Calls the Proxy Route

```typescript
// Client component — calls OUR API, not Groq directly
const response = await fetch("/api/schedule", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ city, taskText }),
});
```

### Verification

After the fix:
- ✅ No requests to `api.groq.com` appear in the browser Network tab
- ✅ The only outgoing request goes to `/api/schedule` (our own API route)
- ✅ Searching the page source for `gsk_` returns zero results
- ✅ The `GROQ_API_KEY` environment variable is not in the client bundle
- ✅ Server-side validation prevents malicious input before it reaches Groq

### Lessons Learned

1. **Never use `NEXT_PUBLIC_` for secret keys** — this prefix is specifically
   designed to expose variables to the client.
2. **API keys belong on the server** — use Next.js Route Handlers (App Router)
   or API Routes (Pages Router) as a secure proxy.
3. **Validate on the server** — client-side validation can be bypassed; always
   validate user input in the API route before using it.
4. **Rotate compromised keys immediately** — if a key was ever in client code,
   generate a new one even after fixing the code.
