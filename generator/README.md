# schema.org.ai context-document generator

Implements the context-document generation pipeline mandated by **ADR 0002
(dot-org-ai/org.ai) R1–R4** — the RC1 resolution "the semantic substrate."

```
 vocabulary MDX source            @mdxld/jsonld (vendored slice)        context documents
 ───────────────────────          ─────────────────────────────        ─────────────────────
 things/*.mdx  (natives/ext   ->  generator/lib/mdxld-transform.mjs ->  site/public/context.jsonld
   where $context=schema.org.ai;   (front-matter parse + $↔@ rename)     site/public/profile.json
   borrow where =schema.org)                                            site/public/releases/01/*
 extensions.jsonld (structured                                          site/public/overlays/startups.studio/context.jsonld
   projection of those Things)
 generator/config.json (policy)
```

**The context document is GENERATED, never hand-edited.** Every output carries a
`_generated` header. The generator is deterministic and idempotent (keys sorted,
no timestamps) — the same inputs produce byte-identical outputs. `pnpm run
check:context` regenerates and diffs, so a hand-edit fails CI.

## Commands

| Command | What |
|---|---|
| `pnpm run gen:context` | Regenerate all context documents into `site/public/`. |
| `pnpm run check:context` | CI gate: fail on (1) drift from a fresh generation, (2) an altered frozen `releases/*` snapshot, (3) a venue overlay that redefines a base term. |

Zero dependencies — pure Node ESM. Runs in CI with no `pnpm install`.

## What each output is

- **`site/public/context.jsonld`** — the served context document. Its `@context`
  declares the R2 JSON-LD 1.1 aliases (`"$id": "@id"`, `"$type": "@type"`) and
  maps every profile term to an IRI. **This is the R1 binding target**: third
  parties write `"@context": "https://schema.org.ai"` (stable, unversioned,
  forever). See the deploy checklist below for wiring the bare binding string to
  this file.
- **`site/public/profile.json`** — the extensional three-bucket profile census
  (R3): every term listed as native / borrow / extension, plus the
  pending-confirmation set. The profile is *extensional* — membership is exactly
  what these documents contain.
- **`site/public/releases/01/context.jsonld`** + **`manifest.json`** — the R1
  immutable snapshot, served at `https://schema.org.ai/releases/01`. **Write-once**:
  the generator never overwrites an existing `releases/NN/`, and `check:context`
  verifies the snapshot against the `sha256` recorded in its manifest.
- **`site/public/overlays/startups.studio/context.jsonld`** — the first venue
  overlay (R4): `startups.studio` (fast clock) layered over `schema.org.ai`
  (slow clock) over `schema.org` (fixed clock). Extends, never redefines
  (enforced at generation).

## The three-bucket classification rule (R3)

Deterministic, driven by `things/*.mdx` front-matter `$context`, cross-checked
against `extensions.jsonld`:

- **native** — a `things/*.mdx` with `$context: https://schema.org.ai`. schema.org
  has no counterpart of that name; we are the sole authority. Mapped to
  `https://schema.org.ai/<Type>`. (A native MAY still declare `subClassOf` a
  schema.org parent for crawler-compat — that does not make it an extension; the
  bucket is about authority over the *term*.) 25 types + 9 properties today.
- **borrow** — a schema.org term admitted to the profile and mapped to its
  canonical `https://schema.org/<Type>` IRI. We never re-home what schema.org
  defines. The 871-type `things/` mirror is **not** admitted wholesale (R3 demotes
  it to provenance courtesy docs); the profile admits only the blessed
  `borrowSeed` from `config.json` plus any schema.org parent structurally
  referenced by a native. 23 terms today.
- **extension** — a schema.org.ai-homed refinement of a schema.org counterpart
  (`subClassOf` the parent). **The concrete R3 candidates — Product, Offer,
  Service, Company — are ALL pending Nathan's admission call, so this bucket is
  emitted EMPTY.** See below.

### PENDING-NATHAN-CONFIRMATION (R3 admission)

R3 says Product/Offer/Service (and Company) bucket calls are *flagged, not
decided* — Nathan confirms at admission. The generator **never silently admits**
them as extension:

| Term | Held as | On confirmation |
|---|---|---|
| **Product** | borrow → `schema.org/Product` | promote to extension `schema.org.ai/Product subClassOf schema.org/Product` |
| **Offer** | borrow → `schema.org/Offer` | promote to extension `schema.org.ai/Offer subClassOf schema.org/Offer` |
| **Service** | borrow → `schema.org/Service` | promote to extension `schema.org.ai/Service subClassOf schema.org/Service` |
| **Company** | omitted (schema.org has no `Company`) | mint extension `schema.org.ai/Company subClassOf schema.org/Organization` |

To admit one: move it out of `pendingConfirmation.wouldBeExtension` in
`config.json`, add its `things/<Type>.mdx` (with `$context: https://schema.org.ai`
and a `subClassOf`) + an `extensions.jsonld` class entry, then `pnpm run
gen:context`.

**Borderline noted:** `Business` is native today but `subClassOf
schema:Organization` is structurally the same clean-mint-synonym pattern R3 uses
to call `Company` an extension. Kept native pending Nathan's call; flagged so the
Company and Business decisions can be made consistently.

## Blocker: `@mdxld/jsonld` is not on npm

ADR 0002 R6 keeps `@mdxld/jsonld` unabsorbed — the serialization bridge, consumed
as a dependency. **It is not published** (`npm view @mdxld/jsonld` → 404 as of
2026-07-18). Per the lane brief, this pipeline **vendors a minimal internal
transform** (`generator/lib/mdxld-transform.mjs`: front-matter parse + the R2
`$id`/`$type` key rename) rather than publish anything. When `@mdxld/jsonld`
ships (its change may currently be unmerged in mdx.org.ai), delete that file and
import the two functions from the package. Nothing else changes.

## Ready-to-deploy checklist (the ONE-WAY publish — Nathan only)

Everything below the line is **done by the pipeline (this PR)**. Everything above
is **Nathan-only** and must follow merge of ADR 0002 (the publish is one-way per
the inventory; it follows, never precedes, the ADR merge).

**Nathan-only (one-way):**

1. Merge ADR 0002 in `dot-org-ai/org.ai` (ratification), then merge this PR.
2. Run the **pre-flip borrow-IRI migration** in the atlas (R3): rewrite stored
   emissions of borrow types under our domain (`schema.org.ai/Person`,
   `schema.org.ai/BlogPosting`, …) to bare terms or schema.org IRIs. This blocks
   the public flip.
3. Confirm (or defer) the **Product / Offer / Service / Company** admissions
   (table above). If confirming, admit them and regenerate before flipping.
4. **Serve the binding string.** GitHub Pages (this repo's
   `deploy-github-pages.yml`) serves `site/public/` static, so after deploy:
   - `https://schema.org.ai/context.jsonld` — live automatically (file in `site/public/`).
   - `https://schema.org.ai/releases/01/context.jsonld` — live automatically.
   - `https://schema.org.ai/overlays/startups.studio/context.jsonld` — live automatically.
   - **The bare binding string `https://schema.org.ai` needs content negotiation**
     (R2: `Accept: application/ld+json` → the JSON-LD; default → MDXLD/HTML). GitHub
     Pages cannot content-negotiate. Nathan must add an edge layer (Cloudflare
     Worker / redirect rule in front of Pages) that, for
     `GET https://schema.org.ai` with `Accept: application/ld+json`, returns
     `site/public/context.jsonld` (and likewise `/releases/01`). Until that edge
     exists, binders should pin `https://schema.org.ai/context.jsonld` explicitly.
5. Flip the repo public (ADR 0001 standing question) once steps 1–4 are done and
   third parties are invited to bind.

**Done by this PR (no action needed):**

- ✅ Generation pipeline (`generator/`), deterministic + idempotent.
- ✅ `context.jsonld` with R2 aliases + extensional R3 profile.
- ✅ `profile.json` bucket census.
- ✅ Immutable `releases/01/` snapshot + manifest + immutability check.
- ✅ `startups.studio` venue overlay + R4 non-contradiction guard.
- ✅ `check:context` script + `.github/workflows/check-context.yml` CI gate.
- ✅ Product/Offer/Service/Company held, never silently admitted.
