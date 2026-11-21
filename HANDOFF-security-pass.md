# Handoff: Trellife security pass (21 Nov 2026)

Board item #199 (reel-test-trellife-security-pass). Context, not authorization.

## Done
- Phase 0: read-only review. Codex (default model, medium) reviewed backend and
  frontend; Claude checked every finding against the code; gitleaks history
  scan (values redacted); npm audit run locally (Codex sandbox had no network).
- Phase 1 on branch `security-pass` in both forks, pushed, NOT merged, NOT deployed:
  - Backend (JonathanDolan1/Trellife-Backend, 16 commits on top of main 7f6edf4, this handoff included):
    guest bypass off by default; board update uses URL id and protects
    createdBy/members; users edit only themselves; favorites cleanup locked;
    httpOnly/sameSite/secure cookie + 7-day token expiry; input type checks and
    regex escaping; login/signup rate limit; no user objects or hashes in logs,
    NODE_ENV typo fixed; AI route generic errors; 2 MB body cap; one origin
    allowlist for CORS and sockets (trellife-t8ap.onrender.com); helmet
    (CSP off); audit 22 -> 2; rebuilt public/; README "Security pass" section;
    DEPLOY.md lists GUEST_MODE. Tests: `npm test`, 26 passing, no network.
  - Frontend (JonathanDolan1/Trellife, 5 commits on top of main 3bf2891):
    stored XSS in the activity feed escaped; no raw login errors in the
    console; source maps off; audit 15 -> 3; board API only after login (the
    stricter backend exposed a 401 reload loop, found in a local browser check).
    Tests: `npm test`, 10 passing.
- Second opinions (consult): plan round (Codex + Gemini) caught the old-token
  case; backend diff round (Codex) passed with no findings.

## Decisions (Jonathan)
D1 guest bypass off; D2 keep the shared sandbox, lock ownership fields; D3
express-rate-limit; D4 non-breaking dependency fixes only; D5 helmet with CSP
off. README section in the backend repo only.

## Fragile
- Logged-in flows (Guest login, boards, join, favorites, delete) were NOT run
  against a real database. Local checks used a dummy DB URL. Check on the real
  deploy before relying on it.
- Existing users are logged out once after deploy (old tokens have no issue time).
- After a stale session on the home page, the header can show the old user
  until the next click (401 handler no longer reloads `/`).
- Rate limit is in memory, per instance; resets on restart or sleep.
- 2 MB body cap: a very large board could hit it.
- trellifeDB is shared with Dolev's demo, which still runs the old code with
  guest mode on: anyone can still change shared data through that site.

## Still open (needs Jonathan)
- Atlas: narrow or delete users Dolevy and YonaHershko (readWriteAnyDatabase);
  coordinate with Dolev. Consider a separate database for this fork (DB_NAME).
- Confirm every credential in git history is dead (5 Mongo strings, 2024 OpenAI
  key, old SECRET1, Unsplash key in old bundles).
- Render: confirm the service deploys from backend main, NODE_ENV=production,
  no OPENAI_API_KEY, no GUEST_MODE.

## Next step (exact)
Jonathan says yes to deploy -> merge `security-pass` into `main` in both repos
(frontend first; backend main auto-deploys on Render) -> open
https://trellife-t8ap.onrender.com in a private window: Start demo, open a
board, add a card, check the activity feed, log out and in. Roll back = revert
the merge on backend main.
