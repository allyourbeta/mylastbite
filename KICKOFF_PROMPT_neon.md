# Claude Code kickoff prompt — Neon refactor

Run from the mylastbite repo root, with SPEC_neon_refactor.md present in the root.

Invocation:

claude --model claude-sonnet-5 --dangerously-skip-permissions

---

Read SPEC_neon_refactor.md in this directory. Execute the refactor exactly as specified. Rules:

1. Read the existing code before changing it. Do not break the graph page, entry page, dayLogic, stats, PWA config, or any passing test.
2. Remove @supabase/supabase-js, add @neondatabase/serverless. No other dependency changes.
3. Implement api/_db.ts, api/meals.ts, rewrite api/log.ts per §3. Parameterized queries only.
4. Extract validation into services/validateLog.ts and write its Vitest suite per §8.
5. Move and adjust the migration per §5. Delete the supabase/ directory.
6. Update .env.example to exactly the three vars in §6. Update README.md per §7.
7. When done: run npm run test and npm run build; both must pass. Then run: grep -ri supabase --exclude-dir=node_modules . and confirm zero hits. Report line counts of the five largest source files.
8. Do not deploy. Do not commit. Stop after the checks and print a summary.
