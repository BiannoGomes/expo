# Bianno Gomes — Yachting Portfolio

A single-page portfolio site for **Bianno Gomes**, professional Mediterranean yacht
deckhand / stew. Static, dependency-free, and ready to deploy anywhere.

## What's inside
- `index.html` — the full site
- `assets/css/style.css` — styles (navy / gold / cream luxury theme)
- `assets/js/main.js` — nav, scroll reveals, animated stat counters, gallery lightbox
- `assets/img/` — gallery photos, portrait, and the source CV sheets

## Sections
Hero · Stats · Profile · The Journey (Valencia → Greece / Ionian) · Deck Experience
timeline · Core Skills & Certifications · On-Deck gallery · Captain & Owner feedback ·
Contact & Referees.

## View locally
```bash
cd yachting-site
python3 -m http.server 8000
# open http://localhost:8000
```

## Deploy (GitHub Pages)
Point Pages at this folder, or copy its contents to the repo root / a `docs/` folder.
No build step required.

## Update your details
- Text/experience: edit `index.html`
- Colours/typography: edit the `:root` variables at the top of `assets/css/style.css`
- Photos: drop new images in `assets/img/` and update the `src` / `data-full` attributes
  in the gallery `<figure>` elements.
