# Barinda Restaurant & Takeaway

Website for Barinda Restaurant & Takeaway — a family-run Bangladeshi and Indian
restaurant and takeaway on Hawthorn Lane in Wilmslow, established 1994.

## Contents

```
public/
  index.html            One-page site (hero, story, kitchen, band, gallery,
                        reservations, hours, visit, footer)
  styles.css            Design system and responsive layout
  app.js                Navigation, mobile drawer, GSAP scroll motion
  fonts/                Self-hosted Cormorant Garamond + Manrope
  vendor/               GSAP 3.12.5 and ScrollTrigger
  img/                  Photography
wrangler.jsonc          Static assets configuration
```

## Running locally

The site is static, so any file server pointed at `public/` will do:

```sh
npx serve public
```

Or use Wrangler to preview it exactly as it is deployed:

```sh
npx wrangler dev
```

## Deployment

`wrangler.jsonc` serves the `public/` directory as static assets, so the project
deploys as-is to Cloudflare Workers:

```sh
npx wrangler deploy
```

## Notes

- Fonts and animation libraries are self-hosted; the page makes no third-party
  requests.
- Motion is progressive enhancement. Without JavaScript, or with reduced motion
  enabled, every section is visible and readable.
- Opening hours, telephone number, address and allergen wording are set in
  `public/index.html`.
