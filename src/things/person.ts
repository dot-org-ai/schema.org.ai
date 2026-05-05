/**
 * Person — Schema.org's canonical `Person` type.
 *
 * Note: this is the chosen name for humans across the .org.ai stack. The
 * older `Human` symbol (`https://schema.org.ai/Human` from primitives'
 * `packages/types`) is being migrated to `Person` to align with Schema.org
 * and the SVO co-design plan.
 */
import type { Thing, ThingRef } from './thing'

/**
 * A Person — a human (alive, dead, undead, or fictional, per Schema.org).
 *
 * Extends `Thing`. Both the short form (`$type: 'Person'`) and the IRI form
 * (`$type: 'https://schema.org/Person'`) are accepted by callers, but the
 * short form is the canonical authored value.
 */
export interface Person extends Thing<'Person' | 'https://schema.org/Person'> {
  /** First / given name. */
  givenName?: string

  /** Last / family name. */
  familyName?: string

  /** Primary email — used for WorkOS / OAuth lookup. */
  email?: string

  /** Phone number, E.164-preferred. */
  telephone?: string

  /** Job title. */
  jobTitle?: string

  /** The Organization this Person works for. */
  worksFor?: ThingRef

  /** Organizations this Person belongs to. */
  memberOf?: ThingRef[]

  /** Other affiliations (advisor roles, board seats, …). */
  affiliation?: ThingRef[]

  /** Other Persons known to this one — peer/social graph. */
  knows?: ThingRef[]

  /** ISO date (YYYY-MM-DD). */
  birthDate?: string

  /** Postal address — kept loose; downstream packages may narrow. */
  address?: string | Record<string, unknown>

  /** Gender — Schema.org leaves this open-string; we follow suit. */
  gender?: string
}
