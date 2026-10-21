# Ellen Ivanovic — personal site

One-page site in plain HTML, CSS and a little JavaScript. No framework, no build step.

## Files

| File | What it is |
| --- | --- |
| `index.html` | All the text and links on the page. Edit this to change copy. |
| `styles.css` | Colours (at the top, in `:root`), fonts and layout. |
| `script.js` | Accordions, the About panel, the phone menu and hero slides. |
| `assets/img/` | The optimised images the page uses. |
| `assets/originals/` | Full-size originals extracted from the Claude Design mockup (not used by the page). |
| `assets/og-image.jpg` | The 1200×630 image shown when the link is shared. |
| `favicon.ico`, `favicon-32.png`, `apple-touch-icon.png`, `icon-512.png` | BYB monogram icons. |

## Editing the text

1. Open `index.html` and find the words you want to change (Ctrl+F).
2. Change them. Text is typed in normal sentence case; the site shows it in capitals automatically.
3. Save, then commit and push to `main` on GitHub. Vercel redeploys the live site on its own within about a minute.

Search for `TODO` in `index.html` to find the things still to fill in.

## Preview locally

```bash
python -m http.server 5173
```

Then open http://localhost:5173.

## Fonts

Body: Plus Jakarta Sans. Headings: Six Caps (Google Fonts), with Humane listed first so it takes over once licensed font files are added. See the commented `@font-face` block near the top of `styles.css`.
