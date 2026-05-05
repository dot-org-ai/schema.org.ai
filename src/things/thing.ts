/**
 * Thing — the JSON-LD root type for the schema.org.ai vocabulary.
 *
 * Every Person, Agent, Organization, etc. extends Thing. Property names
 * follow the `$`-prefixed JSON-LD-style convention used across the
 * primitives.org.ai monorepo (`$id`, `$type`, `$context`).
 */

/** Identifier-as-property — the JSON-LD `PropertyValue` shape. */
export interface PropertyValue {
  propertyID: string
  value: string
}

/**
 * Thing — base of the type hierarchy.
 *
 * Subtypes narrow `$type` to a string literal (e.g. `'Person'`). Callers may
 * pass either the compact form (`'Person'`) when a `$context` is set, or the
 * full IRI (`'https://schema.org/Person'`) for context-free interchange.
 */
export interface Thing<T extends string = string> {
  /** Unique IRI for this instance (e.g. `https://id.org.ai/u/martha`). */
  $id: string

  /** The Thing's class — short name (`Person`) or full IRI. */
  $type: T

  /**
   * JSON-LD context — the namespace `$type` resolves against. Defaults to
   * `https://schema.org` for canonical Schema.org types, or
   * `https://schema.org.ai` for the .org.ai superset.
   */
  $context?: string | string[]

  /** Human-readable name. */
  name?: string

  /** External identifiers (DIDs, GitHub user IDs, WorkOS user IDs, …). */
  identifier?: PropertyValue[]

  /** Canonical URL for the Thing (homepage, profile). */
  url?: string

  /** Image URL. */
  image?: string

  /** Free-form description. */
  description?: string

  /** Equivalent canonical URLs (Twitter, LinkedIn, GitHub profiles). */
  sameAs?: string[]

  /** Domain payload — typed by subclass implementations as needed. */
  data?: unknown

  createdAt?: Date | string
  updatedAt?: Date | string
}

/**
 * ThingRef — a lightweight reference to a Thing.
 *
 * Two shapes are accepted:
 *   - bare string `$id` (back-compat with `digital-objects` `ThingRef = string`)
 *   - `{ $type, $id }` typed reference, so callers can route by class without
 *     first resolving the Thing.
 *
 * The typed form mirrors JSON-LD's `{ "@type", "@id" }` idiom and lets
 * `Worker.resolve()` skip a fetch when `$type` is already known.
 */
export type ThingRef =
  | string
  | {
      $id: string
      $type: string
      name?: string
    }

/**
 * Pull the IRI out of a ThingRef regardless of which shape it is.
 * Pure helper; no I/O.
 */
export function refId(ref: ThingRef): string {
  return typeof ref === 'string' ? ref : ref.$id
}

/**
 * Pull the type out of a typed ThingRef. Returns `undefined` for bare-string
 * refs since the type is unknown without a fetch.
 */
export function refType(ref: ThingRef): string | undefined {
  return typeof ref === 'string' ? undefined : ref.$type
}
