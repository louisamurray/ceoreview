# REAP Marlborough – CEO Self-Review

An interactive, client‑side (no backend) self‑review form for the REAP Marlborough CEO. It captures structured reflections, KPI ratings, strategic priority progress, professional development, and forward planning—designed to be completed prior to a formal review meeting.

## Features
- Structured 7‑part self‑review form (Reflection → Dialogue with Board)
- Dynamic repeatable sections (challenges, past goals, PD, future goals, board requests)
- KPI & competency rating matrix with tooltips for scale definitions
- Strategic priorities & job description alignment sections
- Local persistence via `localStorage` (Save Progress button)
- Minimum enforced future goals (3) with guarded removal
- Accessible, responsive UI using Tailwind CSS (CDN) + Inter font
- Lightweight: single HTML file, no build step

## Tech Stack
- HTML5 + vanilla JavaScript
- Tailwind CSS via CDN (no config required)
- LocalStorage for offline persistence (data stays in the user’s browser)

## Quick Start
1. Open `index.html` directly in a modern browser (Chrome, Edge, Firefox, Safari).
2. Begin entering responses; dynamic sections can be added with the + buttons.
3. Click “Save Progress” periodically (writes a JSON snapshot to `localStorage`).
4. On revisiting/reloading, saved answers auto‑restore if the same browser + device are used.
5. Click “Submit Review” (currently shows a confirmation only—no server post).

## Data Persistence
All content is stored under the key `ceoReviewFormData` in `localStorage`:
```
{
	timestamp: <ISO string>,
	data: { simple: { ... }, repeaters: { ... }, kpis: [...], priorities: [...], jdAlignment: [...] }
}
```
Clearing browser storage or using another device/browser will remove access to saved progress.

## Customisation
- Add / remove KPI labels: edit the `kpis` array in `index.html`.
- Adjust strategic priorities, JD areas, or rating descriptions by modifying the corresponding arrays / object.
- To persist to a server, replace the `submit` handler with a `fetch()` POST containing the assembled structure (see `saveProgress()` for shape).

## Potential Enhancements
- Export to PDF / printable summary
- Server backend (auth + audit trail)
- Import / export JSON file for portability
- Validation rules (e.g., required fields before submission)
- Autosave debounce instead of manual save button
- Accessibility audit (ARIA labels for dynamic items)

## Project Structure
```
index.html               # Markup wiring external assets
assets/
	css/
		styles.css           # Custom styling (animations, tooltips, fonts)
	js/
		app.js               # Core logic (data config, save/load, init)
README.md                # Project documentation
```

If you later modularise templates / components, consider splitting `app.js` into:
`config.js`, `templates.js`, `persistence.js`, `init.js`.

## Contributing
Small, focused PRs welcome. Keep everything self‑contained unless a build system is introduced. Prefer progressive enhancement and no framework unless justified.

## License
Add appropriate license (e.g., MIT) when distribution requirements are confirmed.

## Contact
For context or review process changes, coordinate with the REAP Marlborough governance team.
