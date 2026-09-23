# Requests

A production-quality React app for creating, viewing and tracking requests, styled to the Nucleus Network brand. There is no backend yet — a [Mock Service Worker](https://mswjs.io/) layer stands in for the API during development and in tests, designed to be swapped for a real backend with no changes to components.

## Stack

- [Vite](https://vite.dev/) + React 18 + TypeScript (strict)
- [Tailwind CSS v4](https://tailwindcss.com/) (CSS-first config, no `tailwind.config.js`) + [shadcn/ui](https://ui.shadcn.com/) + [lucide-react](https://lucide.dev/) icons
- [React Router v6](https://reactrouter.com/) (data router — `createBrowserRouter`)
- [React Hook Form](https://react-hook-form.com/) + [Zod](https://zod.dev/) for form state and validation
- [TanStack Query v5](https://tanstack.com/query) for data fetching/caching
- [MSW](https://mswjs.io/) for API mocking, in both the browser and Vitest
- ESLint (typescript-eslint, react-hooks) + Prettier (with `prettier-plugin-tailwindcss`)
- Vitest + React Testing Library (`happy-dom` environment)
- pnpm

## Getting started

```bash
pnpm install
pnpm dev
```

The dev server runs at `http://localhost:5173`. MSW intercepts every `/api/*` request in the browser — open the Network tab and you'll see requests resolve without hitting a real network, each with a random 400–800ms delay to simulate latency.

### Node version note

This project's Vite/plugin-react versions are pinned to the latest releases that support Node 20.10+ without requiring `crypto.hash` (added in Node 20.12). If your Node version is 20.12+ or 22.12+, feel free to bump `vite` and `@vitejs/plugin-react` back to their newest majors.

### Scripts

| Script | What it does |
|---|---|
| `pnpm dev` | Start the Vite dev server with MSW mocking |
| `pnpm build` | Type-check (`tsc -b`) and build for production |
| `pnpm preview` | Preview the production build locally |
| `pnpm lint` | Run ESLint |
| `pnpm format` | Format the codebase with Prettier |
| `pnpm test` | Run the Vitest suite once |

## Folder structure

```
src/
  app/                    Router, providers (QueryClient, Theme), root layout
  components/
    ui/                   shadcn/ui-generated primitives — treat as vendored
    layout/               AppShell, Header, Sidebar, PageHeader
    theme/                Theme context/provider + toggle
  features/requests/
    api/                  requestsApi.ts (fetch calls), queries.ts (TanStack Query hooks)
    components/           RequestForm, RequestStatusBadge, RequestsTable, etc.
    pages/                RequestsListPage, CreateRequestPage, ViewRequestPage (+ colocated tests)
    schema.ts             Zod schema + inferred types — the single source of truth for the data shape
  mocks/                  MSW handlers, seed data, browser/server setup
  lib/                    utils (cn, formatDate), constants
  styles/globals.css      Design tokens + Tailwind v4 theme mapping (see docs/brand-tokens.md)
  hooks/                  Shared hooks (e.g. useTheme)
  test/                   Vitest setup + a renderWithProviders test helper
docs/brand-tokens.md      Where every colour/font/radius token came from, and why
```

Routes: `/` redirects to `/requests`; `/requests` (list), `/requests/new` (create), `/requests/:id` (view); anything else renders a styled 404.

## Data model

```ts
interface Request {
  id: string
  title: string // 5–120 chars
  description: string // min 20 chars
  status: 'Draft' | 'Submitted' | 'In Review' | 'Approved' | 'Rejected'
  requestedBy: string
  dueDate?: string // ISO
  attachments?: { name: string; size: number }[]
  createdAt: string // ISO
  updatedAt: string // ISO
}
```

Defined in [`src/features/requests/schema.ts`](src/features/requests/schema.ts) as a Zod schema, with a separate, slightly narrower `requestFormSchema` used by the create form (no `id`/`status`/timestamps — those are assigned server-side).

## Swapping MSW for a real API

1. Delete the MSW bootstrap in `src/main.tsx` (the `enableMocking()` call and its `import('@/mocks/browser')`).
2. Point `VITE_API_BASE_URL` (in `.env.development` / `.env.production`) at your real API host.
3. `src/features/requests/api/requestsApi.ts` already talks to `VITE_API_BASE_URL` via `fetch` — as long as your backend implements the same four endpoints with the same shapes, no other code changes:
   - `GET /requests?search=&status=&sort=`
   - `GET /requests/:id`
   - `POST /requests`
   - `PATCH /requests/:id`
4. Delete `src/mocks/` once nothing references it (tests use `src/mocks/server.ts` via `src/test/setup.ts`, so update that too if you remove mocking from tests as well — most teams keep MSW for tests even after wiring a real API for `dev`/`build`).

## Theming

Light mode is the default and primary target, matching the Nucleus Network brand. Dark mode is also implemented — a lightened step of the brand blue (`primary-300`) passes AA (7.19:1) against the brand's own navy used as a dark background, so a dark theme was practical rather than skipped. The toggle lives in the header and persists to `localStorage` (`ui-theme` key).

Every colour, font and radius token — including which are real extracted brand values versus interpolated fills, the WCAG contrast calculations, and the one deliberate deviation (pill-shaped buttons) — is documented in **[`docs/brand-tokens.md`](docs/brand-tokens.md)**. Read that before adding any new colour: the rule is no hard-coded hex values in components, only tokens from `src/styles/globals.css`.

## Testing

```bash
pnpm test
```

Covers: `RequestForm` validation (required-field errors, buttons disabled while a submission is pending), `ViewRequestPage` rendering mocked data (plus its not-found state), and `RequestsListPage` search filtering. All three exercise the real MSW handlers rather than mocking the API client, so they double as a check that the mock API layer itself behaves correctly.

## Accessibility

Semantic HTML throughout, labelled form controls, visible focus rings via the brand ring colour, and every status badge pairs colour with text (never colour alone). See `docs/brand-tokens.md` for the underlying contrast calculations.
