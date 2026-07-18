# Claude Code kickoff prompt — mylastbite

Paste everything below the line into Claude Code, run from an empty directory `mylastbite/` containing `SPEC_mylastbite.md` and `icon.svg`.

Invocation:

claude --model claude-sonnet-5 --dangerously-skip-permissions

---

Read SPEC_mylastbite.md in this directory. Build the entire app to that spec. Rules:

1. Scaffold with Vite (react-ts template). Dependencies: react, react-dom, recharts, zustand, @supabase/supabase-js, vite-plugin-pwa. Dev: vitest, sharp, @types/node. Nothing else.
2. Follow the architecture in §8 exactly: components / state / services / api layers. Services are pure functions, no React or supabase imports. No file over 300 lines.
3. Copy icon.svg to src/assets/icon.svg. Write scripts/generate-icons.mjs (sharp) producing the four PNGs in §9 into public/. Run it.
4. Write supabase/migration.sql containing the table + RLS from §3. Do not attempt to run it — I will run it myself.
5. Write api/log.ts as a Vercel serverless function per §6.
6. Create .env.example listing all six vars from §11 with placeholder values.
7. Write the Vitest suite for services/dayLogic.ts and services/stats.ts covering every rule in §4, including the 00:00–03:59 previous-day attribution and the 23:59 clamp.
8. Write a short README.md: what it is, local dev, deploy steps.
9. When done: run npm run test and npm run build. Both must pass. Then verify no source file exceeds 300 lines and report the line counts of the five largest files.
10. Do not deploy. Do not init git. Stop after the checks in step 9 and print a summary of what was built.
