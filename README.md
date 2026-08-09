# Philosotribe Website

Static HTML/CSS/JS website for `philosotribe.org`, ready for GitHub Pages.

## Pages

- `index.html`
- `plants.html`
- `plant-care.html`
- `crafts.html`
- `calendar.html`
- `about.html`
- `contact.html`
- `credits.html`
- `404.html`

## Launch Files

- `CNAME` points GitHub Pages to `philosotribe.org`.
- `robots.txt` allows search engines to crawl the site and points them to the sitemap.
- `sitemap.xml` lists the public pages search engines should index.
- `404.html` is the GitHub Pages fallback for broken or missing URLs.

## Placeholder Images

Placeholder artwork lives in `assets/img/placeholders/`.

To replace one later:

1. Add your real image to `assets/img/`.
2. Update the matching `<img src="...">` path in the HTML page.
3. Remove the nearby `Placeholder image` badge if the replacement is final.

## Site Icon and Share Image

The favicon/header mark is:

```text
assets/img/PhilosotribeIcon.png
```

The social sharing preview image is:

```text
assets/img/OpenGraph.jpg
```

If either image is replaced later, keep the same filename or update the matching `<link>` and Open Graph tags in each HTML page.

## Plant Care Sheets

Plant care sheets are generated from:

```text
assets/js/plant-care-data.js
```

To add a plant, duplicate one object in `window.plantCareItems`, then edit:

- `label`
- `lifeCycle` (`Annual` or `Perennial`)
- `name`
- `description`
- `image`
- `imageAlt`
- `harvestLabel` optional, used for flowers or other non-food harvest wording
- `harvestTime`
- `light`
- `water`
- `soil`
- `notes`

Keep the comma between objects so the page can read the list.

The detailed care boxes are controlled by the `plantCareDetails` section near the bottom of `plant-care-data.js`. Add a matching entry there when a plant needs instructions beyond the basic object fields.

Use `harvestTime` for the bold timing line on each card. Timing should be written from the customer's perspective after transplanting a starter outdoors. Most vegetable cards use the default label, `Days till harvest`. Add `harvestLabel` when a different label reads better, such as `Days to bloom` for flowers.

The Plant Care dropdown is generated from the `label` values. Plants with the same `label` appear together when that label is selected. The Annual/Perennial buttons use the `lifeCycle` value, and the plant-name search reads from each plant card.

Each plant card gets a direct link based on its name, such as:

```text
plant-care.html#jalapeno-peppers
```

Current plant care photos live in `assets/img/plants/`. Image attribution details are saved in:

```text
assets/img/plants/credits.json
```

The visible credits page reads from this file:

```text
credits.html
```

Some plant photos are representative matches where an exact cultivar photo was not practical.

For plant photos, add the image file to `assets/img/plants/`, then set `image` to that path. Example:

```js
image: "assets/img/plants/tomato-start.jpg",
imageAlt: "Young tomato plant in a small pot."
```

## Merchant Calendar

The calendar page is:

```text
calendar.html
```

It reads public Google Calendar events from:

```text
assets/js/calendar.js
```

The custom calendar uses the Google Calendar API to render a themed next-sale banner, month grid, and upcoming sale list.
To replace the calendar later:

1. Make the replacement calendar public if you want website visitors to see it.
2. Update `CALENDAR_ID` in `assets/js/calendar.js`.
3. Use a Google API key restricted to the Google Calendar API and the public website domains.
4. Update `CALENDAR_API_KEY` only when rotating or replacing that restricted key.

New public events added to that Google Calendar will appear on the website without editing the site.

## GitHub Pages

The `CNAME` file is already set to:

```text
philosotribe.org
```

After pushing this folder to a GitHub repository, enable GitHub Pages from the repository settings and point the domain DNS records to GitHub Pages.

## Cache busting for GitHub Pages

The site now uses a single cache-busting version in `assets/js/site-version.js`.

Whenever you publish any website update, change:

```js
window.PHILOSOTRIBE_SITE_VERSION = "2026-08-08-1";
```

to a new value (for example, `2026-08-15-1`). The HTML always requests this tiny version file with a one-time cache bypass. When the value changes, CSS, local JavaScript, plant images, image credits, logos, and other local images are requested with the new version. Pages previously seen by a visitor also trigger a one-time versioned reload, which prevents an old cached HTML shell from continuing to show stale assets.

Use a unique version for each deployment. A date plus revision number is easy to maintain: `YYYY-MM-DD-1`, `YYYY-MM-DD-2`, and so on.

## First-visit newsletter popup

The site shows a themed newsletter invitation once per browser. Dismissing it by the X button, **Not now**, the backdrop, Escape, or the sign-up button stores a long-lived dismissal in localStorage with a cookie fallback, so ordinary site updates do not make it reappear. The dedicated `/sign-up/` page never shows the popup and counts as dismissed.
