# schema.org.ai Documentation Site

Fumadocs-powered static site for schema.org.ai with 878 Schema.org types.

## Setup

```bash
cd site
pnpm install
pnpm dev
```

## Build

```bash
pnpm build  # Generates static site to ./out
```

## Deploy

GitHub Actions automatically deploys to GitHub Pages on push to main.

## Structure

- `content/docs/types/` - 878 Schema.org type MDX files
- `app/` - Next.js app with Fumadocs
- `components/` - React components
- `scripts/` - Build and maintenance utilities

See [SETUP_SUMMARY.md](SETUP_SUMMARY.md) for complete documentation.
