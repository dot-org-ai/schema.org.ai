/**
 * Organization — Schema.org's canonical type for companies / teams /
 * non-profits / government bodies.
 *
 * Used as the target of `Person.worksFor` and `Person.memberOf`, and as a
 * possible Agent operator.
 */
import type { Thing, ThingRef } from './thing'

export interface Organization
  extends Thing<'Organization' | 'https://schema.org/Organization'> {
  /** Legal name. */
  legalName?: string

  /** The Organization that owns / contains this one. */
  parentOrganization?: ThingRef

  /** Sub-organizations. */
  subOrganization?: ThingRef[]

  /** Members (typically Persons). */
  member?: ThingRef[]

  /** Founder(s). */
  founder?: ThingRef | ThingRef[]

  /** Domain (e.g. `do.industries`). */
  domain?: string

  /** Free-form address; downstream packages may narrow. */
  address?: string | Record<string, unknown>

  /** Email contact. */
  email?: string

  /** Phone contact, E.164-preferred. */
  telephone?: string
}
