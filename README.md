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
- Lightweight: no build step (static HTML + external CSS/JS assets)

## Tech Stack
- HTML5 + vanilla JavaScript (single-page app style)
- Tailwind CSS via CDN (no build pipeline)
- LocalStorage for offline persistence (data stays in the user’s browser)
- Simple modular separation: `index.html` (structure), `assets/css/styles.css` (custom styles), `assets/js/app.js` (logic & data)

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
- Add / remove KPI labels: edit the `kpis` array in `assets/js/app.js`.
- Update strategic priorities (`strategicPriorities`) or job description areas (`jdAreas`) in `assets/js/app.js`.
- Change rating scale text in `ratingDescriptions` (also in `assets/js/app.js`).
- Adjust minimum required future goals by editing the guard inside `removeFutureGoal()`.
- To persist to a server: in `assets/js/app.js`, replace the submit handler (inside the `DOMContentLoaded` block) with a `fetch()` POST sending the object produced in `saveProgress()`.
- To add autosave: attach a debounced wrapper to `input` / `change` events that calls `saveProgress()`.

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

## Development Workflow
1. Edit HTML structure in `index.html` (avoid inline scripts/styles to keep separation clean).
2. Add logic or data arrays in `assets/js/app.js`.
3. Add or override styles in `assets/css/styles.css` (prefer utility classes first; only add bespoke CSS when utilities are insufficient).
4. Open the file in the browser and use DevTools for quick iteration.
5. Commit with conventional short messages (e.g., `feat: add PDF export`, `fix: restore repeater hydration`).

## Troubleshooting
| Issue | Resolution |
|-------|------------|
| Data not loading after refresh | Ensure `localStorage` still contains key `ceoReviewFormData`; if JSON corrupted, clear it and re-enter data. |
| Buttons unresponsive | Check for console errors—likely a JS syntax error in modified templates. |
| Styles missing | Confirm the path `assets/css/styles.css` is correct relative to `index.html`. |
| Old data after changing arrays | Clear `localStorage` so new structure is generated. |

## Planned (Optional) Enhancements
- Print / PDF export page (CSS print stylesheet or `html2pdf.js`)
- JSON import/export for portability
- Field validation + progress indicator
- Autosave with idle/debounce logic
- Accessibility refinements (labelling dynamic repeater groups)


## Contributing
Small, focused PRs welcome. Keep everything self‑contained unless a build system is introduced. Prefer progressive enhancement and no framework unless justified.

## License
Add appropriate license (e.g., MIT) when distribution requirements are confirmed.

## Contact
For context or review process changes, coordinate with the REAP Marlborough governance team.
