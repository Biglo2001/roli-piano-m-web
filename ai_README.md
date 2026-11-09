# AI Agent Handoff

## Purpose

This repository is a small, dependency-free web app that lets a ROLI Piano M send MIDI notes to a browser-based synthesizer, without requiring the ROLI app. The intended setup is an Android device, the Piano M connected by USB-OTG, and the site opened in a browser with Web MIDI support.

Live site: https://biglo2001.github.io/roli-piano-m-web/

## How it works

1. `index.html` loads the page markup, both stylesheets, and both scripts.
2. The user presses **Connect & Start Audio**. This click creates/resumes the Web Audio context (important because browsers require a user gesture) and requests MIDI access.
3. `script.js` connects available MIDI inputs to a handler for Note On and Note Off messages. Note numbers are converted to frequencies; triangle-wave oscillators are created per active note, with velocity controlling volume. Note release fades briefly before stopping the oscillator.
4. The speaker button in `script-snow.js` dispatches a `piano-mute-change` event. `script.js` applies it to the master gain.
5. `script-snow.js` also adds decorative snowflakes to `#snow`.

## Files

- `index.html` — document structure, user-facing status/connect controls, and asset/script loading order.
- `script.js` — Web MIDI access, MIDI parsing, Web Audio synthesis, note lifecycle, logging, and mute handling.
- `styles.css` — app-specific styles for the heading, status card, connect button, and log.
- `script-snow.js` — mute control and decorative snowflake creation.
- `style-snow.css` — base layout, button styling, and snow animation styles.
- `README.md` — short visitor-facing description and link to the live site.
- `.github/workflows/static.yml` — deploys the repository contents to GitHub Pages when code is pushed to `main` (or manually dispatched).

## Development notes

- This is a static site: there is no package manager, build step, or server-side code. Edit the source files directly.
- Preserve the Web Audio initialization in the connect button's user-gesture path; moving it to automatic page load can cause browsers to block audio.
- Web MIDI availability and USB MIDI permissions depend on the browser, device, and secure context. GitHub Pages serves HTTPS. The original prototype notes that Android may block MIDI permissions on a local `file:///` page; test through an HTTP(S) origin.
- MIDI device connection state is monitored after access is granted. If changing the MIDI flow, keep both initially connected inputs and later connected inputs wired to `handleMIDIMessage`.
- The displayed status and log are useful for diagnosing browser permission and device issues. Keep them in sync when changing connection behavior.
- There are currently no automated tests or build scripts. Validate browser-facing changes on a MIDI-capable browser/device when possible.

## Deployment

Push changes to `main` to trigger the GitHub Pages workflow in `.github/workflows/static.yml`. The workflow publishes the repository root as the site artifact.

## AI commit attribution

Every commit created by an AI agent must include a co-author trailer. For OpenAI Codex, use exactly:

``text
Co-authored-by: OpenAI Codex <codex@openai.com>
``
