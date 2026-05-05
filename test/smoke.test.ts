/**
 * Smoke tests — confirm the public seam exports what we say it does.
 * Type-shape checks live alongside the runtime exports they protect.
 */
import { describe, it, expect } from 'vitest'
import {
  IRIS,
  PACKAGE_NAME,
  refId,
  refType,
  type Thing,
  type ThingRef,
  type Person,
  type Agent,
  type Organization,
} from '../src/index'

describe('package metadata', () => {
  it('exports the canonical package name', () => {
    expect(PACKAGE_NAME).toBe('schema.org.ai')
  })

  it('Person canonicalises to schema.org (not schema.org.ai/Human)', () => {
    expect(IRIS.Person).toBe('https://schema.org/Person')
  })

  it('Agent lives in the .org.ai superset', () => {
    expect(IRIS.Agent).toBe('https://schema.org.ai/Agent')
  })
})

describe('ThingRef helpers', () => {
  it('refId reads the $id from both bare-string and typed refs', () => {
    expect(refId('https://id.org.ai/u/martha')).toBe('https://id.org.ai/u/martha')
    expect(refId({ $id: 'https://id.org.ai/u/martha', $type: 'Person' })).toBe(
      'https://id.org.ai/u/martha',
    )
  })

  it('refType returns undefined for bare-string refs (type unknown without a fetch)', () => {
    expect(refType('https://id.org.ai/u/martha')).toBeUndefined()
  })

  it('refType returns the typed $type when present', () => {
    expect(refType({ $id: 'https://id.org.ai/u/martha', $type: 'Person' })).toBe('Person')
  })
})

describe('type shapes (compile-time checks)', () => {
  it('Person is constructable with the documented fields', () => {
    const martha: Person = {
      $id: 'https://id.org.ai/u/martha',
      $type: 'Person',
      $context: 'https://schema.org',
      name: 'Martha',
      email: 'martha@do.industries',
      worksFor: 'https://do.industries',
    }
    expect(martha.$type).toBe('Person')
  })

  it('Agent carries .org.ai-specific fields (publicKey, model, capabilities)', () => {
    const cody: Agent = {
      $id: 'https://Cody.do',
      $type: 'Agent',
      $context: 'https://schema.org.ai',
      name: 'Cody',
      autonomous: true,
      digital: 1.0,
      publicKey: 'ed25519:base64key',
      model: { $id: 'https://schema.org.ai/Model/claude-opus-4-7', $type: 'Model', name: 'claude-opus-4-7' },
      capabilities: ['Code Review', 'Architecture Design'],
    }
    expect(cody.publicKey).toMatch(/^ed25519:/)
  })

  it('Organization is a valid worksFor target', () => {
    const org: Organization = {
      $id: 'https://do.industries',
      $type: 'Organization',
      name: 'do.industries',
      domain: 'do.industries',
    }
    const martha: Person = {
      $id: 'https://id.org.ai/u/martha',
      $type: 'Person',
      worksFor: { $id: org.$id, $type: 'Organization', name: org.name },
    }
    expect(refId(martha.worksFor!)).toBe('https://do.industries')
  })

  it('Thing is the structural root — every shipped subtype assigns to it', () => {
    const things: Thing[] = [
      { $id: 'a', $type: 'Person' },
      { $id: 'b', $type: 'Agent' },
      { $id: 'c', $type: 'Organization' },
    ]
    expect(things).toHaveLength(3)
  })

  it('ThingRef accepts both bare-string and typed shapes', () => {
    const a: ThingRef = 'https://schema.org.ai/x'
    const b: ThingRef = { $id: 'https://schema.org.ai/x', $type: 'Thing' }
    expect(refId(a)).toBe(refId(b))
  })
})
