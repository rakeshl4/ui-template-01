# Brand tokens

Source of truth for every design token used in this app, where it came from, and why. All tokens live in [`src/styles/globals.css`](../src/styles/globals.css) — there is no separate `theme.css` file, to keep a single CSS entry point for Vite/shadcn. No component should hard-code a brand hex value; if you need a new shade, add it here first.

## How these were extracted

Rather than inventing a palette, the values below were pulled directly from the live [nucleusnetwork.com](https://www.nucleusnetwork.com) site's WordPress theme stylesheet (`wp-content/themes/bw-base/assets/css/base.min.css`), specifically its `:root` custom-property block. Every "real" value in the tables below is a verbatim copy of a value found there — nothing was eyeballed from a screenshot.

## Colour tokens

### Primary (brand blue) — anchored on real values, interpolated between them

| Step | Hex | Source |
|---|---|---|
| 50 | `#ebf5fa` | **Real** — theme's `--color-primary-lightest` |
| 100 | `#c7e3f0` | Interpolated (linear RGB, between 50 and 300) |
| 200 | `#a4d0e6` | Interpolated (between 50 and 300) |
| 300 | `#80bedc` | **Real** — theme's `--color-primary-lighter` |
| 400 | `#3397c8` | **Real** — theme's `--color-primary-light` |
| 500 | `#0175af` | **Real** — theme's `--color-primary` (the site's main brand blue) |
| 600 | `#01669d` | Interpolated (between 500 and 950) |
| 700 | `#01568b` | Interpolated (between 500 and 950) |
| 800 | `#004779` | Interpolated (between 500 and 950) |
| 900 | `#003767` | Interpolated (between 500 and 950) |
| 950 | `#002855` | **Real** — theme's `--color-primary-dark`, which the theme also reuses as its `--color-black` (body text colour) |

### Secondary (brand green) — anchored on real values, interpolated between them

| Step | Hex | Source |
|---|---|---|
| 50 | `#d1f8f1` | Interpolated (between white and 200) |
| 100 | `#a2f0e2` | Interpolated (between white and 200) |
| 200 | `#74e9d4` | **Real** — theme's `--color-secondary-light` |
| 300 | `#4dc9a1` | Interpolated (between 200 and 500) |
| 400 | `#27a86f` | Interpolated (between 200 and 500) |
| 500 | `#00883c` | **Real** — theme's `--color-secondary` |
| 600 | `#007947` | Interpolated (between 500 and 700) |
| 700 | `#006a52` | **Real** — theme's `--color-secondary-dark`. Note this shifts toward teal rather than a simple darkening of 500 — that's the real brand value, kept as-is rather than "corrected" |
| 800 | `#004d3c` | Interpolated (between 700 and 950) |
| 900 | `#003126` | Interpolated (between 700 and 950) |
| 950 | `#001410` | Interpolated — generated near-black anchor, no real value exists this dark |

These are **linear RGB interpolations**, not a perceptually-uniform ramp (e.g. OKLCH). They're a pragmatic fill-in for the steps the real site never needed; if a designer wants a perceptually even ramp later, regenerate 100/200/600/700/800/900 (primary) and 50/100/300/400/600/800/900/950 (secondary) through an OKLCH tool, keeping the "Real" rows fixed as anchors.

### Neutrals & border — used directly, no ramp needed

| Token | Hex | Source |
|---|---|---|
| `--grey-darkest` | `#333333` | Real |
| `--grey-dark` | `#666666` | Real |
| `--grey` | `#999999` | Real |
| `--grey-light` | `#cccccc` | Real |
| `--grey-lighter` | `#eeeeee` | Real |
| `--grey-lightest` | `#fafafa` | Real |
| `--grey-ultralight` | `#fcfcfc` | Real (defined, currently unused) |
| `--brand-border` | `#bfc9d4` | Real — the theme's generic `--border` value (`0.1rem solid #bfc9d4`) |

### Off-brand semantics (amber, red)

The brand palette has no warning or error hue. `--amber-*` and `--red-*` tokens are standard, off-brand utility colours (Tailwind's amber/red scale) used only for the "Ready" status and form validation error states. These are deliberately **not** derived from the brand ramps.

## Typography

| Role | Font | Source |
|---|---|---|
| Body (`--font-sans`) | **Lato** | Real — the theme loads `Lato:wght@100;300;400;500;600` from Google Fonts. Self-hosted here via `@fontsource/lato` instead of an external `<link>`, weights 300/400/700 (Lato doesn't ship a real 500/600 weight; those numbers in the theme's Google Fonts URL don't correspond to distinct static files) |
| Heading (`--font-serif`) | **Fraunces** | **Substitution.** The real theme's `--font-primary` is `"aurea-ultra"`, served via Adobe Typekit — proprietary and unavailable outside their account. Fraunces (Google Fonts / `@fontsource/fraunces`) was chosen as the closest open alternative: an elegant, slightly editorial serif that pairs with a sans body the same way the original pairing does. Weights 600/700 imported |
| Display/numeral accents | *(not implemented)* | The theme's `--font-secondary` (`"Bogue"`, also Typekit) is used on the real site only for numerals and decorative quote marks — a minor, low-frequency use we didn't reproduce. If needed later, treat it the same way as the heading font (pick an open substitute, document it here) |

## Shape & elevation

| Token | Value | Source |
|---|---|---|
| `--radius` and all `--radius-*` (xs–4xl, full) | `0` | Deliberate: square corners everywhere, no rounded borders (overrides the real site's `1rem` / `2rem` / `99rem`) |
| `--shadow-brand` | `0 4px 6px -1px rgb(0 0 0 / .1), 0 2px 4px -1px rgb(0 0 0 / .06)` | Real — theme's `--box-shadow` |

**Deliberate deviation:** the real site's buttons are pill-shaped and its cards/inputs are rounded. This template uses square corners everywhere: every radius token in `src/styles/globals.css` is `0`, so any `rounded-*` utility (including `rounded-full`) renders square. Don't reintroduce radius values.

## WCAG AA contrast — calculated, not assumed

All ratios below are the standard WCAG relative-luminance formula, calculated directly (not estimated).

| Pair | Ratio | Verdict |
|---|---|---|
| `primary-500` (`#0175af`) on white | 5.04:1 | Passes AA normal text (≥4.5), but thin margin |
| `secondary-500` (`#00883c`) on white | 4.58:1 | Passes AA normal text, also thin margin |
| `primary-400` (`#3397c8`) on white | 3.28:1 | Fails normal text AA; passes large-text/UI (≥3:1) only |
| `primary-300` (`#80bedc`) on brand navy `#002855` | 7.19:1 | Passes AAA |
| `primary-400` (`#3397c8`) on brand navy `#002855` | 4.46:1 | Passes large-text/UI, just under normal-text AA |
| `primary-500` (`#0175af`) on brand navy `#002855` | 2.90:1 | **Fails** even large-text/UI — never use as text/icon colour on the dark theme |
| `red-600` (`#dc2626`) vs white text | 4.83:1 | Passes AA — used as `--destructive` in both themes |

**Rule of thumb applied throughout the app:** raw `primary-500` / `secondary-500` are fine for **fills** (buttons, filled badges) and **large text/icons**, because those thresholds are ≥3:1. For **small body text or links** that need to be brand-coloured, step up to `primary-600`/`secondary-700` for a safer margin above 4.5:1.

## Dark mode — implemented (not skipped)

The spec only asked for a dark theme if a brand-primary variant passes AA on a dark background. It does (see the contrast table above), so dark mode is implemented rather than omitted:

- `--background` is the **real** brand navy (`#002855`), used as-is — this is an actual brand colour, not an invented dark surface.
- `--card` / elevated surfaces use `primary-900` (`#003767`) for depth separation from the base background.
- Foreground text defaults to near-white; anywhere brand-blue text is needed, `primary-300` is used (7.19:1) — never `primary-500` (fails at 2.90:1).
- Toggle defaults to light (the spec's primary target), persisted to `localStorage` under the key `ui-theme`.

## Status colour mapping (a spec deviation, approved during scaffolding)

The status set is `Submitted`, `In Progress`, `Ready`, `Approved`. Each gets its own hue so no two statuses share a hue family, with green reserved exclusively for `Approved`:

| Status | Colour | Note |
|---|---|---|
| Submitted | Neutral grey | No brand hue involved |
| In Progress | Brand **primary** blue | |
| Ready | Amber (off-brand) | Brand has no warning hue |
| Approved | Brand **secondary** green | Kept on-brand — the one unambiguous "success" state |

Every badge renders status text plus colour (never colour alone).
