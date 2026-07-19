// generator/lib/mdxld-transform.mjs
//
// VENDORED MINIMAL @mdxld/jsonld SUBSTITUTE.
//
// ADR 0002 R6 rules that @mdxld/jsonld stays UNABSORBED and is consumed as a
// dependency (the serialization bridge, Engine archetype, homed in mdx.org.ai).
// It is NOT published to npm yet (`npm view @mdxld/jsonld` -> 404 as of
// 2026-07-18), so this file vendors the *minimal* slice the context pipeline
// needs, and nothing more. When @mdxld/jsonld ships, delete this file and
// `import { parseFrontmatter, mdxldToJsonldKeys } from '@mdxld/jsonld'`.
//
// Scope of this vendored slice (deliberately tiny):
//   1. parseFrontmatter(text)  — read the YAML-subset front-matter block of an
//      MDX Thing. Supports `key: value`, quoted scalars, and simple block/flow
//      lists (the only shapes our things/*.mdx front-matter uses).
//   2. mdxldToJsonldKeys(obj)  — the R2 "pure key rename" for the MDXLD `$`
//      serialization <-> JSON-LD `@` serialization at the document top level:
//      $id -> @id, $type -> @type. `$context` is intentionally NOT renamed to
//      `@context` here (R2: `@context` cannot be aliased, so a document carrying
//      `$context` is definitionally MDXLD — that asymmetry is the format
//      boundary, not a bug). The generator emits a JSON-LD document that *uses*
//      `@context` directly and *declares* the `$id`/`$type` aliases.
//
// No third-party deps. Deterministic. Pure functions.

/**
 * Parse the leading `---\n ... \n---` front-matter of an MDX/MDXLD file.
 * Returns a plain object. Values are strings, numbers, booleans, or arrays of
 * strings. This is a YAML *subset* — sufficient for schema.org.ai Thing
 * front-matter and nothing else; it is not a general YAML parser.
 * @param {string} text
 * @returns {Record<string, unknown>}
 */
export function parseFrontmatter(text) {
  const m = /^---\n([\s\S]*?)\n---/.exec(text)
  if (!m) return {}
  const body = m[1]
  const out = {}
  const lines = body.split('\n')
  let i = 0
  while (i < lines.length) {
    const line = lines[i]
    if (!line.trim() || line.trim().startsWith('#')) {
      i++
      continue
    }
    // block list item under the previous key: "  - value"
    const kv = /^([$A-Za-z][\w.$-]*):\s*(.*)$/.exec(line)
    if (!kv) {
      i++
      continue
    }
    const key = kv[1]
    let rest = kv[2].trim()
    if (rest === '') {
      // possible block list on following indented "- " lines
      const items = []
      let j = i + 1
      while (j < lines.length && /^\s*-\s+/.test(lines[j])) {
        items.push(unquote(lines[j].replace(/^\s*-\s+/, '').trim()))
        j++
      }
      out[key] = items
      i = j
      continue
    }
    if (rest.startsWith('[') && rest.endsWith(']')) {
      // flow list: [a, b, c]
      const inner = rest.slice(1, -1).trim()
      out[key] = inner === '' ? [] : inner.split(',').map((s) => unquote(s.trim()))
      i++
      continue
    }
    out[key] = coerce(unquote(rest))
    i++
  }
  return out
}

function unquote(s) {
  if (
    (s.startsWith('"') && s.endsWith('"')) ||
    (s.startsWith("'") && s.endsWith("'"))
  ) {
    return s.slice(1, -1)
  }
  return s
}

function coerce(s) {
  if (s === 'true') return true
  if (s === 'false') return false
  if (s !== '' && !Number.isNaN(Number(s)) && /^-?\d/.test(s)) return Number(s)
  return s
}

/**
 * R2 pure key rename for document-top-level MDXLD `$` keys -> JSON-LD `@` keys.
 * Only `$id`/`$type` are renamed (aliasable keywords). `$context` is left as-is
 * by design (see file header).
 * @param {Record<string, unknown>} obj
 * @returns {Record<string, unknown>}
 */
export function mdxldToJsonldKeys(obj) {
  const rename = { $id: '@id', $type: '@type' }
  const out = {}
  for (const [k, v] of Object.entries(obj)) {
    out[rename[k] ?? k] = v
  }
  return out
}

/**
 * Deterministic recursive key-sort so generated JSON is byte-stable across runs
 * regardless of input insertion order. Arrays keep order (order is meaningful).
 * @template T
 * @param {T} value
 * @returns {T}
 */
export function sortKeysDeep(value) {
  if (Array.isArray(value)) return value.map(sortKeysDeep)
  if (value && typeof value === 'object') {
    const sorted = {}
    for (const k of Object.keys(value).sort()) {
      sorted[k] = sortKeysDeep(value[k])
    }
    return sorted
  }
  return value
}
