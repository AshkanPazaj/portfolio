# Ashkan Pazaj | Portfolio

A modern portfolio for **Ashkan Pazaj**, junior full-stack developer based in Toronto.

**Full-Stack Development:** George Brown Computer Programming (T186) graduate, currently building production software for clients (ASP.NET Core, Java, JavaScript, SQL).

## Tech stack

Pure HTML, CSS and vanilla JavaScript. No build step, no dependencies.

- `index.html`: main portfolio page
- `projects.html`: project showcase
- `styles.css`: portfolio design system, layout and animations
- `script.js`: mobile nav, parallax photo
- `projects/`: self-contained project demos (Chrome Dino, Cafe X, etc.)
- `assets/`: shared site assets (favicon, profile photo)

## Run locally

Just open `index.html` in your browser. That's it.

For best results (and so the smooth-scroll / image paths behave consistently), serve via a tiny local server:

```bash
# Python 3
python -m http.server 5500

# Or with Node
npx serve .
```

Then visit `http://localhost:5500`.

## Customizing

- **Content**: edit `index.html` directly.
- **Colors / theme**: adjust the CSS variables at the top of `styles.css` (`--brand`, `--accent`, etc.).
- **Photo**: replace `assets/ashkan.png` with any square-ish portrait.

## Contact

- Email: **AshkanPazaj@gmail.com**
- Phone: **(437) 552-4742**
- Location: Toronto, Ontario
