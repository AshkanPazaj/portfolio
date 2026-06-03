# Eva Beauty Clinic — Display & Booking Website

An elegant, modern, fully responsive website for **Eva Beauty Clinic** with a
beautiful display landing page and a multi-step booking flow.

Built with vanilla **HTML, CSS, and JavaScript** — no build tools, no
dependencies. Just open the files in a browser.

## Features

### Display Site (`index.html`)
- Sticky navigation with mobile-friendly hamburger menu
- Hero section with stats and live "open now" badge
- About section with feature list
- Services grid (6 treatments with prices & durations)
- Photo gallery
- Client testimonials
- Contact / hours / map section
- Polished footer

### Booking System (`booking.html`)
- 3-step flow: **Service → Date & Time → Your Details**
- Service selection cards (icons, names, durations, prices)
- Specialist preference dropdown
- Date picker (defaults to tomorrow, can't pick the past)
- Smart time-slot grid (some slots marked unavailable per date)
- Live "Booking Summary" sidebar that updates as you go
- Inline validation + toast messages
- Confirmation modal with a generated booking ID
- Bookings persisted to `localStorage` (so the demo feels real)
- Deep-linkable: open `booking.html?service=hydrafacial` to pre-select a service

### Design
- Warm rose / blush / cream palette
- Serif headings (Cormorant Garamond) + clean sans body (Inter)
- Soft shadows, subtle animations, rounded shapes
- Mobile-first, responsive down to ~360px

## File Structure

```
eva/
├── index.html      # Main display page
├── booking.html    # Multi-step booking page
├── styles.css      # All styling (one file, organized by section)
├── script.js       # All interactivity + booking logic + services data
└── README.md       # This file
```

## How to Run

Just open `index.html` in any modern browser — no server, no install needed.

```
double-click index.html
```

### Or serve locally (optional)
If you'd like to serve it via a local web server:

```powershell
# Python (if installed)
python -m http.server 8000

# Node (if installed)
npx serve .
```

Then visit `http://localhost:8000`.

## Customizing

### Update services
Edit the `SERVICES` array near the top of `script.js`. It powers both the home
page grid and the booking page selector:

```js
const SERVICES = [
    { id: 'hydrafacial', icon: '💧', name: 'Signature HydraFacial', ... },
    // add more here
];
```

### Update colors
Open `styles.css` and tweak the CSS variables at the top:

```css
:root {
    --rose: #c98a8e;
    --rose-dark: #a8666b;
    --cream: #faf6f2;
    --ink: #2a1f22;
    /* ... */
}
```

### Update clinic info
Open `index.html` and edit the **Contact** and **Hero** sections directly.

### Replace gallery / hero images
Currently using Unsplash CDN URLs in `styles.css`. Replace them with your own
photos (drop them in an `images/` folder and update the `background-image`
URLs).

## Connecting a real backend

The current booking flow saves submissions to `localStorage`. To wire it to a
real backend, replace the `saveBooking()` function in `script.js` with a
`fetch()` call to your API, or integrate a service like:

- **Formspree / Getform** — receive bookings via email (no backend code)
- **EmailJS** — send confirmation emails from the browser
- **Calendly / Cal.com** — replace the booking page entirely with an embed
- **Supabase / Firebase** — store bookings in a real database

## License

Free to use, modify, and adapt for Eva Beauty Clinic.
