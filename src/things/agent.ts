/**
 * Agent — the schema.org.ai superset extension for autonomous AI actors.
 *
 * Schema.org has no top-level `Agent`. The canonical hierarchy this draws
 * from is W3C PROV-O (`prov:Agent` with subclasses `prov:Person`,
 * `prov:SoftwareAgent`, `prov:Organization`). schema.org.ai's `Agent`
 * corresponds to `prov:SoftwareAgent` plus AI-native fields (model,
 * capabilities, public key for claim-by-commit).
 */
import type { Thing, ThingRef } from './thing'

/**
 * A capability the Agent possesses — typically a verb the Agent can
 * perform, optionally narrowed by a domain or scope.
 */
export interface Capability extends Thing<'Capability' | 'https://schema.org.ai/Capability'> {
  /** Free-form name (e.g. 'Code Review'). */
  name: string

  /** What the capability does. */
  description?: string
}

/**
 * A Tool the Agent can dispatch (HTTP API, MCP server, internal verb).
 */
export interface Tool extends Thing<'Tool' | 'https://schema.org.ai/Tool'> {
  name: string

  /** Endpoint or service URL the tool exposes. */
  url?: string
}

/**
 * The AI/ML model powering the Agent. Models are referenced by name +
 * version pair (e.g. `claude-opus-4-7`).
 */
export interface Model extends Thing<'Model' | 'https://schema.org.ai/Model'> {
  /** Canonical model name (`claude-opus-4-7`, `gpt-5`). */
  name: string

  /** Model version / training cutoff. */
  version?: string

  /** Provider (`anthropic`, `openai`, `google`). */
  provider?: string
}

/**
 * A Workflow definition — a sequence of actions the Agent can execute. The
 * concrete shape is defined downstream in process.org.ai / verbs.org.ai;
 * here we only carry the reference fields.
 */
export interface Workflow extends Thing<'Workflow' | 'https://schema.org.ai/Workflow'> {
  name: string
  description?: string
}

/**
 * Agent — an autonomous AI actor.
 *
 * Operating model: an Agent has an `operator` (the Person or Organization
 * legally responsible for it), a `model` powering it, declared
 * `capabilities` and `tools`, and (in id.org.ai's claim-by-commit flow) a
 * `publicKey` for cryptographic identity.
 */
export interface Agent extends Thing<'Agent' | 'https://schema.org.ai/Agent'> {
  /** Person or Organization that runs / is responsible for this Agent. */
  operator?: ThingRef

  /** The AI model powering this Agent. */
  model?: Model | ThingRef

  /** Verbs / skills this Agent can perform. */
  capabilities?: Array<Capability | ThingRef | string>

  /** Tools this Agent has access to. */
  tools?: Array<Tool | ThingRef | string>

  /** Workflows this Agent can execute. */
  workflows?: Array<Workflow | ThingRef | string>

  /** Goal or stated objective in free-form text. */
  goal?: string

  /**
   * Ed25519 public key (base64 / multibase). Used by id.org.ai's
   * claim-by-commit flow to bind an Agent to a GitHub identity.
   */
  publicKey?: string

  /** Whether this Agent can act without human approval. */
  autonomous?: boolean

  /**
   * Digital maturity score (0.0–1.0) — extension property used by the
   * .org.ai vocabulary to grade how machine-native a Thing is.
   */
  digital?: number

  /** Default system prompt / persona. */
  systemPrompt?: string
}
