# Meridian ASCII Login

A passwordless sign-in page: a ringed planet rendered live in monospace characters fills the screen, and the sun rises over it as the visitor moves from email to a 6-digit code to signed in.

Made by HorizonX · Version 1.0.0 · October 2026

## Start here

1. Unzip this folder.
2. Start a local web server inside it:
   - With Python (already installed on Mac and Linux): `python3 -m http.server 8080`
   - Or with Node.js: `npx serve .`
3. Open `http://localhost:8080` (with `npx serve`, use the address it prints) in your browser.

There is no build step and nothing to install. Opening `index.html` by double-click also works, but a local server matches how the page behaves once it is online.

## What's inside

- `index.html`: the whole page: markup, styles (in the `<style>` block) and the planet renderer and sign-in logic (in the `<script>` block at the end). The tab icon is an inline SVG data URL in the `<head>`.
- `README.md` (the buyer guide), `CREDITS.md` (fonts and brand notes), and `AGENTS.md` plus `CLAUDE.md` (instructions for AI coding agents).

## Page sections

- **Sky** (full screen behind everything): a 3D planet with a tilted ring, city lights on its night side and a glowing edge, drawn on a `<canvas>` as monospace glyphs from the ramp ` .,-~:;=!*#$@`, with a soft bloom layer on top. Each keystroke sends a ring of light out from the planet.
- **Sunrise across the flow:** night with a backlit crescent at the email step, dawn at the code step (each typed digit moves the sun a notch), full day with a flare when the visitor is signed in. A small readout in the corner shows the sun elevation, the clock and Night, Dawn or Day.
- A **Pause motion / Play motion** button in the bottom corner.
- **Form pane** (a solid left pane on desktop, a sheet under the planet below 960 px): logo, a three-step tracker (Email, Code, Sunrise), and three panels:
   - **Email:** heading, lead line, an underline email field with typo suggestions (for example gmial.com to gmail.com), an **Email me a code** button and "Other ways in" rows for Google, GitHub and a passkey.
   - **Code:** six underline code slots (typing, pasting and one-time-code autofill work), a resend timer, Open Gmail and Open Outlook links and a way back to change the email.
   - **Signed in:** a greeting with the account and the sign-in method, an **Open Meridian** button and a **Sign out** link.
- **Top bar** with a Create an account / Sign in switch that changes the heading and copy.

## Make it yours

- **Colors, corners and spacing:** edit the `:root` block at the top of the `<style>` section in `index.html`:
   - `--bg` page background · `--pane-bg` the form pane · `--ink`, `--ink-2`, `--ink-3` text · `--line` field underlines
   - `--amber`, `--amber-hi`, `--amber-ink` the button, accents and links · `--danger` error messages · `--r` corners · `--pane` pane width
- **Planet colors:** the `WARM`, `COOL` and `SAND` lists in the `<script>` block are the color ramps for the lit surface, the night side and the ring.
- **Glyphs:** `RAMP` lists the characters from dim to bright.
- **Planet shape:** `TX` and `TZ` tilt the planet and its ring; `R_IN` and `R_OUT` set the ring's inner and outer radius (in planet radii). The planet's size and position for each layout are in `layout()`.
- **Sun positions:** `SUN` holds the sun position for each step (0 night, 1 full day).
- **Text and logo:** edit the copy directly in the HTML; the heading and lead line for sign in and sign up are in the `MODE` object. Swap the inline logo SVG next to the word Meridian and the data URL icon in the `<head>`.
- **Font:** the page loads Geist and Geist Mono from Google Fonts. To change them, swap the Google Fonts `<link>` in the `<head>` and the `--sans` and `--mono` variables.
- **Breakpoints:** below 60rem (960 px) the planet moves to the top and the form becomes a sheet underneath; short landscape phones keep a narrow side pane; below 30rem some secondary labels hide.

## Motion

- The animation is plain JavaScript on a 2D canvas, with no libraries. `frame()` shades every character cell (planet, ring, stars and keystroke pulses) and `paint()` draws one text run per color.
- It runs at about 30 frames per second and pauses while the tab is hidden.
- If a visitor has **Reduce motion** turned on in their system settings (the `prefers-reduced-motion` setting), the sky shows one still frame and the button offers Play instead.
- Add `?t=<seconds>` to the address to render one still frame at that moment, `?stage=1` or `?stage=2` to open the code or signed-in step, and `?p=0.5` to set the sun position, handy for screenshots.

## Deploy

- Upload the whole folder to any static host: Cloudflare Pages, Netlify, Vercel, GitHub Pages or your own server. No build step is needed.
- Sign-in is a front-end preview: no email is sent and the demo code is `482913`; Google, GitHub and passkey are simulated. Connect the email form (`#f-email`), the code check (`verify()`) and the buttons in `.sso` and `#passkey` to your own auth provider before you go live, and remove the demo code hint.

## Keep building with AI

Open this folder in an AI coding agent such as Claude Code or Codex and ask in plain words. The folder includes `AGENTS.md` (and a `CLAUDE.md` that points to it), so Codex, Claude Code, Cursor and other agents learn how the project is built and how to check their work before they change anything. Some examples:

- "Read README.md and index.html, then change the brand colors to my palette: …"
- "Replace the copy with content for my studio. Keep the layout and the animations."
- "Port this page to Next.js with Tailwind CSS without changing how it looks or moves."

To add more HorizonX components to the page from your agent, connect the HorizonX MCP server (included in your membership): https://horizonx.so/mcp

## License

Your HorizonX membership gives you a commercial license for this template: use it and adapt it in personal, client and commercial projects. You may not resell, redistribute, sublicense or publicly share the original source files. Full terms: https://horizonx.so/terms.
Libraries and images are listed with their own licenses in `CREDITS.md`. Fonts are not covered by the HorizonX license: if you change them, use fonts you own or have a license for.

## Need help?

Write to support@horizonx.so and mention **Meridian ASCII Login**.
