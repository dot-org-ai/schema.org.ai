/**
 * schema.org.ai — Schema.org vocabulary plus the .org.ai superset.
 *
 * 0.1.x ships the load-bearing types that the rest of the .org.ai stack
 * depends on (Thing, ThingRef, Person, Agent, Organization, plus the
 * Agent-adjacent types Capability/Tool/Model/Workflow). The full 871-type
 * export — codegened from `things/*.mdx` via mdxe — follows in 1.0.0.
 *
 * Convention: `$id`, `$type`, `$context` (JSON-LD with $-prefix to avoid
 * the `@`-prefix's ergonomic friction in TypeScript).
 *
 * @example
 * ```ts
 * import type { Person, Agent } from 'schema.org.ai'
 *
 * const martha: Person = {
 *   $id: 'https://id.org.ai/u/martha',
 *   $type: 'Person',
 *   $context: 'https://schema.org',
 *   name: 'Martha',
 *   email: 'martha@do.industries',
 * }
 * ```
 */

export type { Thing, ThingRef, PropertyValue } from './things/thing'
export { refId, refType } from './things/thing'

export type { Person } from './things/person'
export type { Organization } from './things/organization'
export type { Agent, Capability, Tool, Model, Workflow } from './things/agent'

/** Canonical IRIs for the types this package ships. */
export const IRIS = {
  Thing: 'https://schema.org/Thing',
  Person: 'https://schema.org/Person',
  Organization: 'https://schema.org/Organization',
  Agent: 'https://schema.org.ai/Agent',
  Capability: 'https://schema.org.ai/Capability',
  Tool: 'https://schema.org.ai/Tool',
  Model: 'https://schema.org.ai/Model',
  Workflow: 'https://schema.org.ai/Workflow',
} as const

/** The npm package name — published at this exact identifier. */
export const PACKAGE_NAME = 'schema.org.ai' as const
