# schema.org.ai, the website

Every Schema.org term, copied word for word, and the .org.ai superset the Org.AI Foundation adds, in the Foundation's design (the one foundation.org.ai, standards.org.ai, law.org.ai and insurance.org.ai use).

Each term has a page at `https://schema.org.ai/<Name>`, with its JSON-LD at `/<Name>.json` and Markdown at `/<Name>.md` (also `/api/<Name>/json` and `/api/<Name>/md`). Every address the previous site served still answers, with JSON in the same shape.

## Where the words come from

| Source | File | Licence |
|---|---|---|
| Schema.org 30.1, released 16 September 2026 | `data/schemaorg-30.1.jsonld`, as published at schema.org/version/30.1 | CC BY-SA 3.0 |
| The .org.ai superset | `../extensions.jsonld` | CC BY-SA 4.0 |

`things/` is not read: its MDX files are summaries of the same data. To move to a newer Schema.org release, add its file to `data/`, point `RELEASE` in `build.mjs` at it, and build.

## Build, preview, deploy

```sh
npm install
npm run build      # scripts/og.mjs (the share cards; needs Google Chrome) then build.mjs, into public/
npm run deploy     # build, then wrangler deploy: the Worker schema-org-ai, route schema.org.ai/* on the workers.do zone
```

The first build renders about 3,000 share cards (two minutes); later builds render only what changed, from `.og-cache/`.

To preview locally, leave the share cards out: `wrangler dev` cannot hold all 12,000 files of `public/`.

```sh
rsync -a --delete --exclude og public/ /tmp/schema-preview/
npx wrangler dev --assets /tmp/schema-preview
```

Rollback to the site this replaced: `npx wrangler rollback a7a789ae-320d-4995-a018-5c93b023a935`.

## How it is put together

- `lib/vocab.mjs` reads both vocabularies into one set of terms and works out every relationship. It resolves references by full IRI, and it stops the build on any reference it cannot resolve, any cycle, or two terms of a kind whose names differ only in case.
- `lib/describe.mjs` turns a description, as Schema.org writes it (Markdown links, `[[Term]]` references, some HTML), into HTML, Markdown and plain text, changing no words.
- `build.mjs` writes the pages. Terms are filed under `public/t/`, `p/` and `v/` (types, properties, values): Schema.org has names that differ only in case, such as Brand and brand, and a case-insensitive disk would keep one of each pair.
- `worker.js` maps each address to its file, redirects a name in the wrong case when it matches one term, and sets the headers.
- `src/find.js` is the Foundation's search (⌘K), the same file on every Foundation site. It is built in dot-org-ai/foundation.org.ai: change it there and copy the built file here. It reads the occupations from foundation.org.ai, the one other address these pages connect to.
- `src/base.css` is the Foundation's design, copied from foundation.org.ai's built occupation pages and standards.org.ai's lockup; `src/schema.css` and `src/schema.js` are this site's own.

## Decisions for the owners

- **Names the superset shares with Schema.org.** Event, Role and Thesis (which the superset shadows), Product, Offer and Service (narrower kinds), and the properties model and tool. Their address keeps showing the Schema.org term, as it always has; the superset's term is on the same page at `#org-ai`, and in `/<Name>.md`. ADR 0004 binds the bare term to the superset in data; whether the page should lead with it instead is open.
- **The superset's descriptions are shown as written in `extensions.jsonld`**, including the ruling notes some carry ("ADMITTED EXTENSION per …", "per org.ai ADR 0004 …"). Trimming them is an edit to that file.
- **`/context.jsonld`, `/profile.json` and `/overlays/` are not served.** Publishing the context document is the one-way step in `generator/README.md` (Nathan only).
