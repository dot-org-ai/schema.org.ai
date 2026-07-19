#!/usr/bin/env node
// generator/build-context.mjs
//
// The schema.org.ai context-document generation pipeline (ADR 0002 R1-R4).
//
//   vocabulary MDX source  ->  @mdxld/jsonld (vendored slice)  ->  context doc
//   (things/*.mdx +           (generator/lib/mdxld-transform)     (site/public/*)
//    extensions.jsonld)
//
// The context document is GENERATED, NEVER HAND-EDITED. Every output carries a
// prominent generated-file header. The generator is deterministic and
// idempotent: same inputs -> byte-identical outputs (keys sorted, no
// timestamps). `pnpm run check:context` regenerates and diffs so a hand-edit
// fails CI.
//
// Outputs (served by GitHub Pages from site/public/, per the repo's existing
// deploy-github-pages.yml workflow):
//   site/public/context.jsonld                        -> https://schema.org.ai/context.jsonld  (the R1 unversioned binding target; content-negotiation wiring to serve it AT https://schema.org.ai is a one-way deploy step, see generator/README.md)
//   site/public/profile.json                          -> the extensional three-bucket profile census (ADR 0002 R3)
//   site/public/releases/01/context.jsonld            -> https://schema.org.ai/releases/01/context.jsonld  (R1 immutable snapshot; write-once)
//   site/public/releases/01/manifest.json             -> immutability manifest (sha256)
//   site/public/overlays/startups.studio/context.jsonld -> the first venue overlay (R4)
//
// Usage:  node generator/build-context.mjs           (write)
//         node generator/build-context.mjs --check    (compute in-memory only, no writes; used by check-context.mjs)

import { readFileSync, writeFileSync, existsSync, mkdirSync, readdirSync } from 'node:fs'
import { createHash } from 'node:crypto'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import { parseFrontmatter, sortKeysDeep } from './lib/mdxld-transform.mjs'

const HERE = dirname(fileURLToPath(import.meta.url))
const REPO = join(HERE, '..')
const PUBLIC = join(REPO, 'site', 'public')

const CHECK_ONLY = process.argv.includes('--check')

// ---------------------------------------------------------------------------
// Load policy + vocabulary source
// ---------------------------------------------------------------------------
const config = readJson(join(HERE, 'config.json'))
const extensions = readJson(join(REPO, 'extensions.jsonld'))

const PREFIXES = extensions['@context'] // { schema, schemaai, rdfs, rdf }
const SCHEMA = config.schemaOrg // https://schema.org/
const SCHEMAAI = config.schemaAi // https://schema.org.ai/
const PENDING = new Set(config.pendingConfirmation.wouldBeExtension)
const ADMITTED_EXTENSIONS = new Set(config.admittedExtensions?.terms ?? [])
// Terms ruled OUT of the profile entirely (no class, no context term, no IRI).
// Business — Nathan, org.ai#11 (2026-07-18): "Business = not admitted (Company
// carries the referent; 'business' stays the Register-1 thesis word)".
const NOT_ADMITTED = new Set(config.notAdmitted?.terms ?? [])

// ---------------------------------------------------------------------------
// 1. Native + extension vocabulary from extensions.jsonld, cross-checked
//    against the MDX Things (things/*.mdx). ADR 0002 R4: the slow clock's
//    source of truth is the MDX Things; extensions.jsonld is their structured
//    projection. We assert the two agree so MDX stays authoritative.
// ---------------------------------------------------------------------------
const graph = extensions['@graph']
const jsonldClasses = graph
  .filter((n) => n['@type'] === 'rdfs:Class')
  .map((n) => localName(n['@id']))
  .sort()

const mdxNativeThings = readdirSync(join(REPO, 'things'))
  .filter((f) => f.endsWith('.mdx'))
  .filter((f) => {
    const fm = parseFrontmatter(readFileSync(join(REPO, 'things', f), 'utf8'))
    return fm.$context === config.bindingIri
  })
  .map((f) => f.replace(/\.mdx$/, ''))
  .sort()

crossCheck(jsonldClasses, mdxNativeThings)

// ---------------------------------------------------------------------------
// 2. Classify every term into native / borrow / extension (ADR 0002 R3).
//
//    - native:    schema.org.ai-homed AI-native term; schema.org has no
//                 counterpart of that name; we are the sole authority. (It MAY
//                 still declare a subClassOf edge upward for crawler-compat —
//                 that does not make it an extension; the bucket is about
//                 authority over the *term*.)
//    - borrow:    a schema.org term, mapped to its canonical schema.org IRI.
//    - extension: schema.org.ai-homed refinement of a schema.org counterpart
//                 term/concept, admitted by ratified ruling only (config
//                 admittedExtensions): Team (ADR 0002 R3 third ruling) and
//                 Product/Offer/Service/Company (Nathan's F5 approval,
//                 org.ai#11, 2026-07-18). Unruled candidates are HELD via
//                 config pendingConfirmation, never silently admitted.
//
//    Terms in config notAdmitted are excluded from the profile entirely
//    (Business — org.ai#11: Company carries the referent).
// ---------------------------------------------------------------------------
const native = [] // { term, iri, comment }
const extension = [] // { term, iri, comment, subClassOf } — ADMITTED extensions only (R3 rulings)
const nativeProps = [] // { term, iri, comment, coerceId }
const referencedSchemaParents = new Set()

for (const node of graph) {
  collectSchemaRefs(node, referencedSchemaParents)
  const term = localName(node['@id'])
  if (node['@type'] === 'rdfs:Class') {
    if (PENDING.has(term)) continue // never silently admit a pending extension
    if (NOT_ADMITTED.has(term)) {
      throw new Error(
        `NOT-ADMITTED VIOLATION: "${term}" is ruled out of the profile (config notAdmitted) ` +
          `but still has a class entry in extensions.jsonld. Remove the class (and its things/*.mdx $context claim).`,
      )
    }
    if (ADMITTED_EXTENSIONS.has(term)) {
      const sub = node['rdfs:subClassOf']
      extension.push({
        term,
        iri: SCHEMAAI + term,
        comment: node['rdfs:comment'],
        subClassOf: expandCurie((Array.isArray(sub) ? sub[0] : sub)?.['@id'] ?? sub ?? null),
      })
      continue
    }
    // Q3 SHADOW machinery (org.ai ADR 0004): a native class MAY declare
    // "schemaai:shadows" — an external same-named type with a DIFFERENT
    // referent (a false friend). The bare context term binds to OUR IRI; the
    // external sense stays reachable by its full IRI (never re-homed, never
    // borrowed, never subClassOf'd). Shadow is metadata on a native, not a
    // fourth bucket. Shipped rulings: Role (F4), Event (ADR 0004 first
    // application), Thesis (org.ai#11 approval + ADR 0004 Q3 mechanics).
    const shadowRef = node['schemaai:shadows']
    const shadows = shadowRef ? expandCurie(shadowRef['@id'] ?? shadowRef) : null
    native.push({ term, iri: SCHEMAAI + term, comment: node['rdfs:comment'], shadows })
  } else if (node['@type'] === 'rdf:Property') {
    nativeProps.push({
      term,
      iri: SCHEMAAI + term,
      comment: node['rdfs:comment'],
      coerceId: rangeIsObjectOnly(node),
    })
  }
}

// borrow = blessed seed ∪ schema.org parents structurally referenced by natives.
// Pending types that exist in the schema.org mirror are served as borrow (safe
// default); pending types with no schema.org counterpart are omitted entirely.
const schemaMirror = new Set(
  readdirSync(join(REPO, 'things'))
    .filter((f) => f.endsWith('.mdx'))
    .filter((f) => {
      const fm = parseFrontmatter(readFileSync(join(REPO, 'things', f), 'utf8'))
      return fm.$context === 'https://schema.org'
    })
    .map((f) => f.replace(/\.mdx$/, '')),
)

const borrowTerms = new Set([...config.borrowSeed.terms])
for (const iri of referencedSchemaParents) borrowTerms.add(localName(iri))

const pendingHeldAsBorrow = []
const pendingOmitted = []
for (const term of PENDING) {
  if (schemaMirror.has(term)) {
    borrowTerms.add(term)
    pendingHeldAsBorrow.push(term)
  } else {
    pendingOmitted.push(term)
  }
}

const borrow = [...borrowTerms]
  // A native or admitted extension wins the bare name it owns: the schema.org
  // parent of an admitted extension (schema:Product under schemaai:Product) is
  // structurally referenced but must NOT re-enter as a same-named borrow — the
  // parent stays reachable by full IRI / schema: prefix only.
  .filter((t) => !native.some((n) => n.term === t) && !extension.some((e) => e.term === t))
  .filter((t) => !NOT_ADMITTED.has(t)) // a not-admitted term gets no borrow either
  .sort()
  .map((term) => ({ term, iri: SCHEMA + term }))

// ---------------------------------------------------------------------------
// 3. Assemble the served context document (R1 target / R2 aliases)
// ---------------------------------------------------------------------------
const GENERATED_HEADER = {
  WARNING: 'GENERATED FILE — DO NOT EDIT BY HAND.',
  regenerate: 'pnpm run gen:context',
  ciCheck: 'pnpm run check:context  (regenerates and diffs; hand-edits fail CI)',
  source: [
    'things/*.mdx  (natives/extensions where $context=https://schema.org.ai; borrow pointers where $context=https://schema.org)',
    'extensions.jsonld  (structured projection of the native/extension MDX Things)',
    'generator/config.json  (policy: borrowSeed, pendingConfirmation, venueOverlay)',
  ],
  spec: 'ADR 0002 (dot-org-ai/org.ai) R1-R4',
  profile:
    'ADR 0002 R3 three-bucket profile is EXTENSIONAL: a term mapped to a https://schema.org.ai/* IRI is native (or an admitted extension); a term mapped to a https://schema.org/* IRI is borrow. Full per-term census: ./profile.json',
  pendingNathanConfirmation: {
    note: 'These terms are NOT admitted as extension until Nathan confirms at profile admission (R3). Held meanwhile, never silently admitted. (The 2026-07-18 F5 holds — Product/Offer/Service/Company — were confirmed by Nathan on org.ai#11 and now sit in the extension bucket.)',
    heldAsBorrow: pendingHeldAsBorrow.sort(),
    omitted: pendingOmitted.sort(),
    borderlineNoted: config.pendingConfirmation.borderlineNoted,
  },
  notAdmitted: {
    note: "Terms ruled OUT of the profile entirely — no class, no context term, no IRI. Business: Nathan, org.ai#11 (2026-07-18): 'Business = not admitted (Company carries the referent)'.",
    terms: [...NOT_ADMITTED].sort(),
  },
  shadowedTerms: {
    note: 'org.ai ADR 0004 Q3 SHADOW: each bare term below binds to its schema.org.ai native; the external same-named sense (a false friend — different referent) stays reachable by its full IRI. Never re-homed, never borrowed.',
    shadows: Object.fromEntries(
      native.filter((n) => n.shadows).map((n) => [n.term, n.shadows]),
    ),
  },
}

function buildContextObject() {
  const ctx = {
    '@version': 1.1,
    // R2 JSON-LD 1.1 keyword aliases: a JSON doc using $id/$type (+ a real
    // @context key) is valid, vanilla-processor-consumable JSON-LD.
    $id: '@id',
    $type: '@type',
    // $context is intentionally NOT aliased (R2: @context is not aliasable;
    // a doc carrying $context is definitionally MDXLD).
    schema: SCHEMA,
    schemaai: SCHEMAAI,
  }
  for (const n of native) ctx[n.term] = n.iri
  for (const e of extension) ctx[e.term] = e.iri // admitted extensions are schema.org.ai-homed (R3)
  for (const p of nativeProps) {
    ctx[p.term] = p.coerceId ? { '@id': p.iri, '@type': '@id' } : { '@id': p.iri }
  }
  for (const b of borrow) ctx[b.term] = b.iri
  return sortKeysDeep(ctx)
}

const contextDoc = {
  _generated: GENERATED_HEADER,
  $id: config.bindingIri,
  $type: 'schemaai:Profile',
  name: 'schema.org.ai',
  description:
    'The schema.org.ai context document — the extensional native/borrow/extension profile (ADR 0002 R3) layered over schema.org (R4 slow clock). Bind with "@context": "https://schema.org.ai" (stable, unversioned — R1).',
  schemaVersion: config.schemaVersion,
  '@context': buildContextObject(),
}

// ---------------------------------------------------------------------------
// 4. Extensional profile census (profile.json) — the auditable per-term view
// ---------------------------------------------------------------------------
const profile = {
  _generated: GENERATED_HEADER,
  $id: config.bindingIri + '/profile',
  schemaVersion: config.schemaVersion,
  spec: 'ADR 0002 R3',
  census: {
    native: native.length,
    nativeProperties: nativeProps.length,
    borrow: borrow.length,
    extensionAdmitted: extension.length,
    extensionPending: [...PENDING].sort(),
  },
  buckets: {
    native: native
      .map((n) => ({ term: n.term, iri: n.iri, ...(n.shadows ? { shadows: n.shadows } : {}) }))
      .sort(byTerm),
    nativeProperties: nativeProps
      .map((p) => ({ term: p.term, iri: p.iri, objectProperty: p.coerceId }))
      .sort(byTerm),
    borrow: borrow.map((b) => ({ term: b.term, iri: b.iri })).sort(byTerm),
    extension: extension
      .map((e) => ({ term: e.term, iri: e.iri, subClassOf: e.subClassOf }))
      .sort(byTerm),
    extensionPending: [...PENDING].sort().map((term) => ({
      term,
      status: schemaMirror.has(term) ? 'held-as-borrow' : 'omitted',
      wouldBeIri: SCHEMAAI + term,
      borrowIri: schemaMirror.has(term) ? SCHEMA + term : null,
    })),
    borderlineNoted: config.pendingConfirmation.borderlineNoted.map((term) => ({
      term,
      currentBucket: 'native',
      reason: config.pendingConfirmation.borderlineReason,
    })),
  },
}

// ---------------------------------------------------------------------------
// 5. Venue overlay (R4) + non-contradiction check
// ---------------------------------------------------------------------------
const overlay = buildOverlay(contextDoc['@context'])

// ---------------------------------------------------------------------------
// 6. Emit
// ---------------------------------------------------------------------------
const outputs = {
  'context.jsonld': stringify(contextDoc),
  'profile.json': stringify(profile),
  'overlays/startups.studio/context.jsonld': stringify(overlay),
}

if (CHECK_ONLY) {
  // Expose in-memory results for check-context.mjs via stdout JSON.
  const release = config.release ? buildReleaseSnapshot(contextDoc) : null
  process.stdout.write(
    JSON.stringify({
      outputs,
      release,
      censusLine: `native=${native.length} nativeProps=${nativeProps.length} borrow=${borrow.length} extension=${extension.length} pending=${[...PENDING].join('/')}`,
    }),
  )
  process.exit(0)
}

for (const [rel, content] of Object.entries(outputs)) {
  const dest = join(PUBLIC, rel)
  mkdirSync(dirname(dest), { recursive: true })
  writeFileSync(dest, content)
  console.log('wrote', rel)
}

// releases/NN is WRITE-ONCE (R1 immutable snapshot). Only create it if missing;
// never overwrite an existing frozen release. With release=null (pre-admission,
// F6) no snapshot is emitted at all — freezing waits for admission-complete.
if (config.release) {
  writeReleaseSnapshot(contextDoc)
} else {
  console.log('release=null — no releases/NN snapshot emitted (frozen only when admission-complete, ADR 0002 R1 write-once).')
}

console.log(
  `\nprofile census: native=${native.length} nativeProps=${nativeProps.length} borrow=${borrow.length} extension=${extension.length} (admitted) pending=${[...PENDING].sort().join(', ')}`,
)

// ===========================================================================
// helpers
// ===========================================================================
function buildOverlay(baseContext) {
  const v = config.venueOverlay
  const inline = {
    '@version': 1.1,
    $id: '@id',
    $type: '@type',
    studio: v.venueIri,
  }
  for (const [term, def] of Object.entries(v.nativeTypes)) {
    inline[term] = v.venueIri + term
  }
  for (const [term, def] of Object.entries(v.nativeProperties)) {
    inline[term] = { '@id': v.venueIri + term, '@type': '@id' }
  }

  // Non-contradiction invariant (R4): an overlay term may EXTEND the base but
  // may never REDEFINE a frozen base term. A base-term key reappearing in the
  // overlay is allowed ONLY if it maps to the identical IRI (pure re-borrow).
  const baseKeys = new Map(
    Object.entries(baseContext).filter(([k]) => !isKeyword(k)),
  )
  for (const [term, def] of Object.entries(inline)) {
    if (isKeyword(term)) continue
    if (baseKeys.has(term)) {
      const baseIri = iriOf(baseKeys.get(term))
      const overlayIri = iriOf(def)
      if (baseIri !== overlayIri) {
        throw new Error(
          `OVERLAY NON-CONTRADICTION VIOLATION (ADR 0002 R4): venue overlay redefines base term "${term}" ` +
            `(base -> ${baseIri}, overlay -> ${overlayIri}). An overlay may extend but never redefine a base-layer term. ` +
            `Fix: rename the venue term, or point it at the identical base IRI to re-borrow it.`,
        )
      }
    }
  }

  return {
    _generated: {
      ...GENERATED_HEADER,
      overlayNote:
        'ADR 0002 R4 venue overlay (fast clock) for startups.studio. EXTENDS schema.org.ai; may add terms, may NEVER redefine a base term (enforced at generation). Venue-homed IRIs are LEASES — no durability promise; durable identity exists only at the frozen layer. Graduation (R5) is the only door into the frozen profile.',
    },
    $id: v.venueId,
    $type: 'schemaai:VenueOverlay',
    name: 'startups.studio venue overlay',
    description:
      'Fast-clock overlay: schema.org.ai (slow clock) over schema.org (fixed clock), plus the alpha types/properties the startups.studio cascade is currently iterating.',
    extends: config.bindingIri,
    schemaVersion: config.schemaVersion + '-studio.alpha',
    // Layered @context: the base binding string first, then the venue inline
    // additions. Processors resolve base terms from schema.org.ai, venue terms
    // from the inline map.
    '@context': [config.bindingIri, sortKeysDeep(inline)],
  }
}

function buildReleaseSnapshot(doc) {
  // The frozen snapshot is the served context doc with its release identity.
  const snapshot = { ...doc, $id: `${config.bindingIri}/releases/${config.release}` }
  const body = stringify(snapshot)
  const sha256 = createHash('sha256').update(body).digest('hex')
  const manifest = stringify({
    _generated: {
      WARNING:
        'IMMUTABLE RELEASE SNAPSHOT — DO NOT EDIT OR REGENERATE. ADR 0002 R1 out-of-band versioning. Once committed, releases/* never changes. `pnpm run check:context` verifies this file against its recorded sha256.',
    },
    release: config.release,
    $id: `${config.bindingIri}/releases/${config.release}`,
    schemaVersion: config.schemaVersion,
    status: 'immutable',
    sha256,
    generatedFrom: GENERATED_HEADER.source,
    spec: 'ADR 0002 R1',
  })
  return { body, manifest }
}

function writeReleaseSnapshot(doc) {
  const dir = join(PUBLIC, 'releases', config.release)
  const ctxPath = join(dir, 'context.jsonld')
  const manifestPath = join(dir, 'manifest.json')
  const { body, manifest } = buildReleaseSnapshot(doc)
  if (existsSync(ctxPath)) {
    console.log(
      `releases/${config.release}/ already exists — WRITE-ONCE, left untouched (immutable per R1).`,
    )
    return
  }
  mkdirSync(dir, { recursive: true })
  writeFileSync(ctxPath, body)
  writeFileSync(manifestPath, manifest)
  console.log(`wrote releases/${config.release}/context.jsonld (frozen) + manifest.json`)
}

function readJson(p) {
  return JSON.parse(readFileSync(p, 'utf8'))
}
function stringify(obj) {
  return JSON.stringify(obj, null, 2) + '\n'
}
function localName(iri) {
  // resolve CURIE (schemaai:Agent) or full IRI to its local name
  if (iri.includes(':') && !iri.startsWith('http')) return iri.split(':')[1]
  return iri.replace(SCHEMA, '').replace(SCHEMAAI, '')
}
function expandCurie(v) {
  if (typeof v !== 'string') return v
  const [pfx, ...rest] = v.split(':')
  if (PREFIXES[pfx] && !v.startsWith('http')) return PREFIXES[pfx] + rest.join(':')
  return v
}
function collectSchemaRefs(node, set) {
  for (const key of ['rdfs:subClassOf', 'schema:domainIncludes', 'schema:rangeIncludes']) {
    const val = node[key]
    if (!val) continue
    const arr = Array.isArray(val) ? val : [val]
    for (const ref of arr) {
      const id = expandCurie(ref['@id'] ?? ref)
      if (typeof id === 'string' && id.startsWith(SCHEMA)) set.add(id)
    }
  }
}
function rangeIsObjectOnly(node) {
  const val = node['schema:rangeIncludes']
  if (!val) return false
  const arr = Array.isArray(val) ? val : [val]
  const literals = new Set([
    SCHEMA + 'Number',
    SCHEMA + 'Integer',
    SCHEMA + 'Text',
    SCHEMA + 'Boolean',
    SCHEMA + 'Date',
    SCHEMA + 'DateTime',
    SCHEMA + 'URL',
  ])
  return arr.every((r) => !literals.has(expandCurie(r['@id'] ?? r)))
}
function iriOf(def) {
  return typeof def === 'string' ? def : def['@id']
}
function isKeyword(k) {
  return k === '@version' || k === '$id' || k === '$type' || k === '@id' || k === '@type'
}
function byTerm(a, b) {
  return a.term < b.term ? -1 : a.term > b.term ? 1 : 0
}
function crossCheck(fromJsonld, fromMdx) {
  const a = new Set(fromJsonld)
  const b = new Set(fromMdx)
  const onlyJsonld = [...a].filter((x) => !b.has(x))
  const onlyMdx = [...b].filter((x) => !a.has(x))
  if (onlyJsonld.length || onlyMdx.length) {
    throw new Error(
      'MDX/JSONLD SOURCE DRIFT (ADR 0002 R4 — MDX Things are the source of truth):\n' +
        (onlyJsonld.length
          ? `  in extensions.jsonld but not an MDX Thing with $context=schema.org.ai: ${onlyJsonld.join(', ')}\n`
          : '') +
        (onlyMdx.length
          ? `  MDX Thing (schema.org.ai $context) but not in extensions.jsonld: ${onlyMdx.join(', ')}\n`
          : '') +
        '  Reconcile things/*.mdx and extensions.jsonld before generating.',
    )
  }
}
