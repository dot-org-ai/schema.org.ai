#!/usr/bin/env node
// generator/check-context.mjs
//
// CI gate for the generated context documents (ADR 0002 R1-R4). Fails (exit 1)
// if any of the following is true, so hand-edits and drift can never merge:
//
//   1. DRIFT      — regenerating from source does not reproduce the committed
//                   site/public/context.jsonld, profile.json, or the venue
//                   overlay byte-for-byte (a hand-edit, or a stale generator run).
//   2. IMMUTABLE  — a committed releases/NN/ snapshot no longer matches the
//                   sha256 recorded in its manifest.json (someone edited a
//                   frozen release; R1 says releases/* never change).
//   3. CONTRADICT — the venue overlay redefines a base term (R4). This is
//                   already thrown at generation time; re-checked here.
//
// Usage:  node generator/check-context.mjs
//         (wired as `pnpm run check:context`)

import { readFileSync, existsSync, readdirSync } from 'node:fs'
import { execFileSync } from 'node:child_process'
import { createHash } from 'node:crypto'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const HERE = dirname(fileURLToPath(import.meta.url))
const REPO = join(HERE, '..')
const PUBLIC = join(REPO, 'site', 'public')

const failures = []

// --- 1 + 3: regenerate in-memory and diff against committed outputs ---------
let regen
try {
  const raw = execFileSync('node', [join(HERE, 'build-context.mjs'), '--check'], {
    encoding: 'utf8',
    maxBuffer: 64 * 1024 * 1024,
  })
  regen = JSON.parse(raw)
} catch (err) {
  // A generation-time throw (e.g. overlay non-contradiction, or MDX/JSONLD
  // drift) lands here — surface it as a hard failure.
  console.error('FAIL: generator threw during check (see below).\n')
  console.error(err.stderr || err.message)
  process.exit(1)
}

for (const [rel, expected] of Object.entries(regen.outputs)) {
  const committed = readIf(join(PUBLIC, rel))
  if (committed == null) {
    failures.push(`MISSING: site/public/${rel} is not committed — run \`pnpm run gen:context\`.`)
  } else if (committed !== expected) {
    failures.push(
      `DRIFT: site/public/${rel} differs from a fresh generation. ` +
        `The file was hand-edited or the generator is stale. Run \`pnpm run gen:context\` and commit.`,
    )
  }
}

// --- 2: releases/* immutability (sha256 vs manifest) ------------------------
const releasesDir = join(PUBLIC, 'releases')
if (existsSync(releasesDir)) {
  for (const nn of readdirSync(releasesDir)) {
    const ctxPath = join(releasesDir, nn, 'context.jsonld')
    const manifestPath = join(releasesDir, nn, 'manifest.json')
    if (!existsSync(ctxPath) || !existsSync(manifestPath)) {
      failures.push(`RELEASE ${nn}: missing context.jsonld or manifest.json.`)
      continue
    }
    const body = readFileSync(ctxPath, 'utf8')
    const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'))
    const actual = createHash('sha256').update(body).digest('hex')
    if (actual !== manifest.sha256) {
      failures.push(
        `IMMUTABLE VIOLATION: releases/${nn}/context.jsonld sha256 ${actual} ` +
          `does not match manifest ${manifest.sha256}. A frozen release was edited (ADR 0002 R1 — releases/* never change).`,
      )
    }
  }
}

// --- report -----------------------------------------------------------------
if (failures.length) {
  console.error('check:context FAILED\n')
  for (const f of failures) console.error('  ✗ ' + f)
  process.exit(1)
}

console.log('check:context OK')
console.log('  ✓ context.jsonld / profile.json / overlay reproduce from source (no drift)')
console.log('  ✓ releases/* match their recorded sha256 (immutable)')
console.log('  ✓ venue overlay contains no base-term redefinition (R4 non-contradiction)')
console.log('  census: ' + regen.censusLine)

function readIf(p) {
  return existsSync(p) ? readFileSync(p, 'utf8') : null
}
