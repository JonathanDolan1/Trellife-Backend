# Trellife
A full-stack web application that replicates the core functionalities of trello app, developed by Yonatan Hershko, Dolev Levy and Jonathan Dolan, as part of our bootcamp in Coding Academy.

https://github.com/user-attachments/assets/b56e52a5-0669-4bfd-ba4a-e46e7d00a1a3

<div>
<img width="940" alt="24" src="https://github.com/user-attachments/assets/4f64395b-33bf-4cf0-affa-5fd11d272f19">
<img width="940" alt="23" src="https://github.com/user-attachments/assets/35b2766a-5dd0-4a56-8c56-bf095a949f3f">
</div>

Built with:

![Tech](https://skillicons.dev/icons?i=js,html,css,sass,react,redux,mongodb,nodejs,vite,&perline=10)

## Features

- Create and customize project boards with an intuitive drag-and-drop interface.
- Add Groups and tasks, use a variety of components such as labels checklists and date picker to manage your tasks.
- Filter your tasks by different parameters.
- Real-time collaboration with team members using socket connections.
- keep track on your project by following the project tasks dashboard.
- Create a project template with tasks by using Chat Trellife an AI generated template with our connection to OpenAI API.
- User login/signup system with auth checks.

## Demo

[Check it Out⭐](https://trellife.onrender.com/)

## Security pass (November 2026)

A review of this public demo, done by Jonathan Dolan with AI-assisted code
review (Codex and Claude) and every finding checked by hand against the code.
Fixes are on the `security-pass` branch of this repo and of
[the frontend](https://github.com/JonathanDolan1/Trellife), one commit per fix,
with tests (`npm test`, Node's built-in runner, no network or database).

**Checked:** secrets in code and git history, env files kept out of git,
password hashing, the login cookie and admin routes, server-side auth on every
API route, whether one user can read or change another user's data, rate
limits, input validation and query injection, XSS and CSRF, CORS and security
headers, debug output in production, outdated dependencies.

**Fixed:**
- Anonymous requests passed the login check as a fake "Guest" (guest mode was
  hard-coded on). It is now off unless `GUEST_MODE=true`; the demo logs in as
  a real Guest account instead.
- Stored XSS: the activity feed rendered stored text as HTML. Everything is
  escaped now. Combined with the first fix, anyone could previously plant
  script that ran in every visitor's browser.
- Board updates ignored the URL id and let callers replace `createdBy` and
  `members`. Now the URL id is used, `createdBy` is fixed, and the only members
  change allowed is joining a board yourself.
- Users could edit other users' profiles, and an unauthenticated route
  changed every user's favorites. Both are restricted now.
- Login cookie is `httpOnly`, `sameSite=lax`, `secure` in production; login
  tokens expire after 7 days.
- Login and signup: rate limit (20 per 15 minutes per IP) and type and length
  checks, so JSON objects cannot act as Mongo operators. Search text is
  regex-escaped.
- No more logging of user objects or password hashes; a `NODE_NEV` typo kept
  debug logs on in production.
- AI route errors no longer return stack traces. Request bodies are capped at
  2 MB. Production CORS and socket.io allow only the deployed origin. Security
  headers via `helmet`. No source maps in the public build.
- Dependencies: backend audit 22 → 2 findings, frontend 15 → 3, without major
  upgrades.

**Out of scope / still open:**
- Old credentials remain in this fork's git history (from 2024). They are
  harmless only once rotated; history was not rewritten.
- Boards are a shared sandbox by design: any logged-in user can edit board
  content. Real per-user privacy would change the product.
- socket.io connections are not authenticated; any socket can join a board's
  update room.
- No content security policy yet; no CSRF tokens (`sameSite=lax` covers the
  common cases).
- Major upgrades still pending: `bcrypt` 6 (install-time `tar` advisory),
  `swiper` 14, `react-router` 7.


## Contributors
- [Yonatan Hershko](https://github.com/yonatanhershko)
- [Dolev Levy](https://github.com/Dolevy97)
- [Jonathan Dolan](https://github.com/JonathanDolan1)

## License

This project is licensed under the [MIT License](LICENSE).

---

Feel free to contact us for any questions! 💻
