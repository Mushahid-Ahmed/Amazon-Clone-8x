# Shopday storefront

Shopday is a polished, responsive Amazon-inspired storefront demo built with plain HTML, CSS, and JavaScript. It uses public Unsplash image URLs for product photography and has no build step, credentials, or proprietary assets.

## Run locally

From the repository root, start any static HTTP server:

```bash
python -m http.server 8000
```

Then open <http://localhost:8000>. (Opening `index.html` directly also works, though a local server is recommended.)

## Included interactions

- Responsive navigation, search, category filtering, and sorting
- Product cards with details modal and quantity selection
- Persistent cart drawer with quantity controls and subtotal
- Checkout/toast feedback, favorites affordance, and mobile layout

The cart is stored in `localStorage` so it survives a page refresh. This is a frontend-only demo; checkout and account actions are intentionally non-transactional.
