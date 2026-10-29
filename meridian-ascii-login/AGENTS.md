# AGENTS.md — Meridian ASCII Login

Instructions for AI coding agents (Codex, Claude Code, Cursor and others) working in this folder. The person you are working with always has the final say: when their request and these notes disagree, follow them.

## Project

A passwordless sign-in page: a ringed planet rendered live in monospace characters fills the screen, and the sun rises over it as the visitor moves from email to a 6-digit code to signed in.

- Stack: static HTML, CSS and JavaScript in a single `index.html`, no build step and no libraries; the planet is drawn on a 2D `<canvas>`
- `README.md` is the buyer guide. `CREDITS.md` lists every library and image with its license. `LICENSE.md` (when present) is the HorizonX license.

## Run it

   - With Python (already installed on Mac and Linux): `python3 -m http.server 8080`
   - Or with Node.js: `npx serve .`

Then open `http://localhost:8080` (with `npx serve`, use the address it prints).

## Where things are

- `index.html`: the whole page: markup, styles (in the `<style>` block) and the planet renderer and sign-in logic (in the `<script>` block at the end). The tab icon is an inline SVG data URL in the `<head>`.
- `README.md` (the buyer guide), `CREDITS.md` (fonts and brand notes), and `AGENTS.md` plus `CLAUDE.md` (instructions for AI coding agents).

## How to change things

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

## Rules for this project

- All styles are in the `<style>` block and all scripts in the `<script>` block of `index.html`. Keep it a static site with no build step unless the user asks to port it.
- Colors, corners and spacing come from the `:root` variables. Change those instead of hard-coding new values.
- The planet is shaded per character cell every frame. Change the constants (`WARM`, `COOL`, `SAND`, `RAMP`, `TX`, `TZ`, `R_IN`, `R_OUT`, `SUN`) instead of rewriting `frame()`, and keep the frame cost low: it must stay smooth on phones.
- Keep the accessibility behavior: the canvases are `aria-hidden`, the Pause / Play motion button stays reachable by keyboard, `prefers-reduced-motion` shows a still frame, form errors are announced inline with `aria-invalid`, and step changes move focus and update the live status region.
- Keep the current look and motion unless the user asks to change them. Before a large change, say what you plan to do.
- Every animation you add or change must keep working with `prefers-reduced-motion` and when its script fails to load.
- Fonts are not covered by the HorizonX license. If the user changes the fonts, use ones they own or have a license for, and never download font files they did not provide.
- When you add a library, font or image, add it to `CREDITS.md` with its version and license.
- Do not add analytics, tracking or other third-party scripts unless the user asks for them.

## Check your work

1. Serve the folder and open every section of the page.
2. Make sure the browser console shows no errors and no file returns 404.
3. Check the layout at 390 px and 1440 px wide.
4. Turn on reduced motion in the operating system and check that the content still appears.

## License

The template is licensed to its owner through their HorizonX membership. Building and shipping sites from it is allowed; publishing or reselling the source files as a template is not. Terms: https://horizonx.so/terms
