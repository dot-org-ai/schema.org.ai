# The disposition table — seam rulings, the native delta, and layer assignments

**Status:** authority-split per row. Every row carries an **Authority** mark:

- **RATIFIED** — the ruling was already made, by merged org.ai canon or by Nathan's explicit approval on [org.ai issue #11](https://github.com/dot-org-ai/org.ai/issues/11); the citation is on the row. **Merging this PR ratifies ONLY the rows marked RATIFIED** (and, for those implemented here, ships their implementation).
- **SESSION** — ruled by Nathan **in the 2026-07-19 grill session** (ICP/Persona structure; the layer architecture; the native-delta census). Explicit approvals, but **not yet recorded on #11 or in merged canon** — recording is queue item §7.0. Merging this PR does not ratify SESSION rows; they become RATIFIED when recorded.
- **PROPOSED** — the tree has been run but the admission is **not yet ruled**. PROPOSED rows await explicit admission per org.ai ADR 0004's procedure. **Merging this PR does NOT ratify any PROPOSED row.** No PROPOSED type is admitted in the generated context: each stays exactly in its pre-ruling state — held as borrow, kept at its pre-existing repo-baseline bucket, or omitted — until ruled.

**Procedure:** org.ai ADR 0004 — the admission decision tree (`Q1-borrow` / `Q2-extension` + lineage veto / `Q3-shadow` / `Q4-native` / `+R17-seam`; register-proximity tie-break; conservative default = native + ruling stub), composed with two SESSION principles:

> **The mandate (the TypeScript principle) — SESSION.** schema.org.ai's mandate is to not have to exist: an AI-native superset over schema.org whose native delta is shaped as an upstream proposal — if schema.org adopts it, it stops being a superset, and that is success. Every native addition must pass "could schema.org plausibly adopt this?"
>
> **Seam-only membership — SESSION.** A class enters schema.org.ai iff schema.org forces a ruling on it (Q1 borrows; Q2 extensions — the `subClassOf` edge is the point; Q3 shadows — the bare-term rebinding is the point) plus the deliberately tiny native delta (§0). **Q4-plain natives (no counterpart, no collision) never need the seam and live at their claiming layer.** Bucket rulings are unaffected — "native" stays native; the layer principle only assigns *where the class lives*.

**The layer stack** (most-specific claiming dimension wins; org.ai CONTEXT.md canonical-home rule): **schema.org.ai** (seam + native delta, small by construction) · **business.org.ai** (general-business Nouns; already hosts industries/occupations/departments/processes at ~5× schema.org's type count) · **startups.org.ai** (the studio abstraction: lifecycle@1/primitives, LeanCanvas, StoryBrand) · **id.org.ai** (Agent + Human identity and delegated authorization; shipped: WorkOS humans, Ed25519 agents, claim-by-commit, L0–L4 tiers, `AgentMode: delegated | autonomous`) · other Tier-2 dimensions per R7/R8.

**Census source:** explore.startups.studio `app/_lib/canon/grammar.data.ts` `NODE_TYPES` (~60 registered node types, read 2026-07-19).

**Event-layer context (analysis input, not authority):** stack vault `specs/drivly-rebuild/W0-EVT.md` (frozen 2026-07-19). Its lens doctrine informs the Action-adjacent PROPOSED rows: `schema:Action` is a legal *rendering* of past events — a lens, never a lineage. The ratified Task lineage veto is the canon anchor; extending the veto across the whole verb-conjugation manifold is part of the PROPOSED analysis, not yet ruled.

---

## 0 — The native delta over schema.org (SESSION census: one property, five classes)

The grill census closed the superset addition at exactly this set. Note the repo baseline already anticipated most of it — the census largely *confirms* shipped surface rather than adding to it.

| Addition | Kind | Definition | Evidence | Authority |
|---|---|---|---|---|
| `digital` | property on `schema:Thing` | Marks digital-native things — the axis the atlas kept rediscovering (digital≈0 physical tools vs digital=1.0 actions; DataNouns; the digital-twin seam) | Recurred across ADR 0065, the DataNoun dimension, digital ingest | SESSION |
| **Agent** | class | The autonomous actor; Q4 (schema.org defines no Agent). Identity plane: id.org.ai (claiming dimension for agent-identity content) | RATIFIED bucket (§1); SESSION confirms superset membership; shipped `src/things/agent.ts` | RATIFIED + SESSION |
| **Model** | class | The AI model (weights + capability; `claude-fable-5`) — the AI-native sense | Repo-baseline native already carries this sense; the atlas census "Model" (ML/data/product — indeterminate) is a *different sense* → its stub stays in §3. Sense-level discipline per domain-vocab spike amendment 9 | SESSION (confirms baseline) |
| **Tool** | class | The callable capability an agent wields (MCP / function-calling sense — the dominant AI-native meaning) | Repo-baseline native already carries this sense. NOT in tension with atlas ADR 0065, which tombstoned Tool@instrument (→ Product) and Tool@software (→ `usesTool` edge) — different senses; graduation is sense-level, never lemma-level. Resolves half of §4's ⚠ conflict | SESSION (confirms baseline) |
| **Worker** | class | The Human \| Agent interface, discriminated by `workerType: 'agent' \| 'human'` (R12 id-token prefixes; "species" retired permanently — session-6 ruling). The actor triangle {Agent, Human ⊂ Person, Worker} ships complete or every layer reinvents the union | RATIFIED bucket (§1); SESSION confirms superset membership + workerType | RATIFIED + SESSION |
| **Mandate** | naming ruling open | Delegation/authority — an actor operating under granted scope | **Fixation has three binders under three names:** id.org.ai `AgentMode: delegated \| autonomous` (shipped, tenant-agent-split spec), W0-EVT `authority: mandate_…` + encumbrance (frozen), kestrel Authority `deputized \| self-principal` (ratified). Concept fixed; name not — one unifying ruling needed (Mandate vs Authority vs AgentMode); claiming dimension id.org.ai either way | PROPOSED (stub) |

**Capability is deliberately NOT in the census** — the grill census named Agent/Model/Tool/Worker only, which sharpens §4's ⚠ conflict (ADR 0002 R3 lists Capability as a native exemplar; the atlas tombstones it; the baseline ships it): now three-way, and it needs the Nathan ruling before anything moves.

---

## 1 — RATIFIED rows (already ruled; citations on each row)

Implemented in this PR where marked ⚙; rows without ⚙ ride a follow-up census PR. **SESSION layer notes** (in brackets) assign homes under seam-only membership without touching the ratified bucket; re-homing edits are queue item §7.4.

| Noun | Verdict | Branch | External counterpart | Authority (citation) |
|---|---|---|---|---|
| Person | BORROW | Q1 | `https://schema.org/Person` | **RATIFIED** — ADR 0002 R3 borrow exemplar; ADR 0004 Q1 exemplar + second application ⚙ |
| Company | EXTENSION | Q2 | `subClassOf schema:Organization` | **RATIFIED** — [#11 approval 2](https://github.com/dot-org-ai/org.ai/issues/11#issuecomment-5013244753); ADR 0004 Q2 ⚙ |
| Team | EXTENSION | Q2 | `subClassOf schema:Organization` | **RATIFIED** — ADR 0002 R3 third ruling; ADR 0004 Q2 exemplar ⚙ |
| Product | EXTENSION | Q2 | `subClassOf schema:Product` | **RATIFIED** — #11 approval 2; ADR 0004 Q2 (F5). Lumber category-grain tolerated ⚙ |
| Service | EXTENSION | Q2 | `subClassOf schema:Service` | **RATIFIED** — same ⚙ |
| Offer | EXTENSION | Q2 | `subClassOf schema:Offer` | **RATIFIED** — same ⚙ |
| Human | EXTENSION | Q2 | `subClassOf schema:Person` | **RATIFIED** — ADR 0004 second application. Class emission queued for the census follow-up |
| Task | NATIVE | Q2-veto → Q4 | — (veto vs `schema:Action`) | **RATIFIED** — ADR 0002 R3 first ruling; ADR 0004 lineage veto ⚙ *(SESSION layer: class → business.org.ai; veto record stays at seam)* |
| Role | NATIVE + shadow | Q3 | shadows `schema:Role` | **RATIFIED** — ADR 0002 R3 second ruling; ADR 0004 Q3 exemplar ⚙ *(seam member — shadow)* |
| Event | NATIVE + shadow | Q3 +R17-seam | shadows `schema:Event`; seam-mapped EPCIS 2.0 | **RATIFIED** — ADR 0004 first application ⚙ *(seam member — shadow)* |
| Agent | NATIVE | Q4 | — | **RATIFIED** — ADR 0002 R3 native exemplar; ADR 0004 second application corollary ⚙ *(SESSION: native delta, §0)* |
| Startup | NATIVE | Q4 | — | **RATIFIED** — ADR 0002 R3 native exemplar ⚙ *(SESSION layer: class → startups.org.ai)* |
| ICP, JTBD, Hypothesis, Idea | NATIVE | Q4 | — | **RATIFIED** — ADR 0002 R3 native exemplars ⚙ *(SESSION layer: ICP, JTBD → business.org.ai; Hypothesis, Idea → startups.org.ai; ICP referent per §5)* |
| Worker | NATIVE | Q4 | — | **RATIFIED** — ADR 0002 R3; ADR 0004 second application ⚙ *(SESSION: native delta with `workerType`, §0)* |
| Capability | NATIVE | Q4 | — | **RATIFIED** — ADR 0002 R3 native exemplar. ⚠ Three-way conflict with atlas tombstone + SESSION census omission — see §0 note and §4; needs Nathan before any demotion ⚙ |
| Problem | NATIVE | Q4 | — | **RATIFIED** — #11 approval 3 ⚙ *(SESSION layer: class → business.org.ai — Ulwick-anchored general demand vocabulary)* |
| Thesis | NATIVE (+ mechanical shadow) | Q3 | shadows `schema:Thesis` | **RATIFIED** (native) — #11 approval 3; shadow is the mechanical Q3 consequence ⚙ *(SESSION layer: class → startups.org.ai; shadow record stays at seam)* |
| Opportunity, Market | OVERLAY-FIRST | — | — | **RATIFIED** — #11 approval 3; demoted to the startups.studio overlay in this PR ⚙ |
| Business | NOT ADMITTED | — | — | **RATIFIED** — #11 approval 2 ⚙ |

---

## 2 — PROPOSED rows: tree run, CONFIDENT, awaiting ratification

Every row is **PROPOSED** (none emitted by this PR's context; pre-ruling states preserved — Industry, CompanyType, JobType, Department, Process remain repo-baseline natives; Occupation, Action, Place remain blessed borrows; the rest omitted until ruled). **Under SESSION seam-only membership, each row now proposes a *home* as well as a bucket**: Q4-plain rows propose business.org.ai classes (no schema.org.ai class); seam rows (Q1/Q2/Q3) propose schema.org.ai membership.

### 2a — O\*NET / standards work-spine → proposed home: business.org.ai (except seam rows)

| Noun | Proposed verdict | Branch | External counterpart | Evidence (one line) | Authority |
|---|---|---|---|---|---|
| Industry | NATIVE @ business.org.ai | Q4 +R17-seam | — (`schema:naics` is a property) | No schema Industry class; NAICS by identifier at the seam. (Repo-baseline native today.) | PROPOSED |
| Occupation | EXTENSION @ seam | Q2 | `schema:Occupation` | Q1 fails (descriptor tail homeless — their skills are free text); every SOC occupation truthfully theirs (`occupationalCategory` points at O\*NET-SOC). (Held as borrow until ruled.) | PROPOSED |
| Activity | NATIVE + shadow @ seam | Q3 (+ Q2-veto cited) | shadows `as:Activity` | Occurrent in flight ("creating") — schema:Action veto a fortiori of Task; as:Activity records past events (our Event wearing our other word's name). (Omitted until ruled.) | PROPOSED |
| Process | NATIVE @ business.org.ai | Q2-veto → Q4 | — (veto vs `schema:HowTo`) | A PCF process category is neither an instruction document nor a performed Action. (Repo-baseline native today.) | PROPOSED |
| Skill, Knowledge, Ability, WorkContext, WorkStyle, WorkValue, Interest, JobZone | NATIVE @ business.org.ai | Q4 | — (ESCO Skill = seam candidate by `sameAs` only) | O\*NET descriptor taxonomy; no schema.org classes (text properties at most). (Omitted until ruled.) | PROPOSED |
| Education | NATIVE @ business.org.ai | Q4 | — (distinct from E.O.C.) | O\*NET required-education *level category*, not an awarded credential. (Omitted until ruled.) | PROPOSED |
| Metric, MetricCategory | NATIVE @ business.org.ai | Q4 | — (`schema:StatisticalVariable` seam candidate only) | APQC OSB measure definitions; no schema class named Metric. (Omitted until ruled.) | PROPOSED |

*(Place — atlas G1 — sits in the §3 triangle.)*

### 2b — Derived archetypes → proposed home: business.org.ai

| Noun | Proposed verdict | Branch | External counterpart | Evidence (one line) | Authority |
|---|---|---|---|---|---|
| CompanyType | NATIVE @ business.org.ai | Q4 | — | A firm archetype is a category of organizations, not an organization (metaclass, not grain divergence). (Repo-baseline native today.) | PROPOSED |
| JobType | NATIVE @ business.org.ai | Q4 | — (`schema:JobPosting` is the ad) | The G2 role archetype; the bare-Role spine of §5. (Repo-baseline native today.) | PROPOSED |
| Department | NATIVE @ business.org.ai | Q4 | — (`schema:department` is a property) | Department archetype across firms is a category. (Repo-baseline native today.) | PROPOSED |

### 2c — Digital / GS1 tail

| Noun | Proposed verdict | Branch | External counterpart | Evidence (one line) | Authority |
|---|---|---|---|---|---|
| Action | NATIVE + shadow @ seam | Q3 +R17-seam | shadows `schema:Action` | The verb manifold's capability form; the wild's schema:Action is the perfective = our Event; rendering seam lives on Event's lens. ⚠ Touches ADR 0008's deferred naming lock. (Held as borrow until ruled.) | PROPOSED |
| DataNoun | NATIVE @ business.org.ai | Q4 | — | Metaclass of SVO data objects; per-instance seams to schema.org kin by identifier. (Omitted until ruled.) | PROPOSED |
| Software | EXTENSION @ seam | Q2 | `subClassOf schema:SoftwareApplication` | Truthfully software applications; adds exposes → Action, operatesOn → DataNoun. (Omitted until ruled.) | PROPOSED |
| Credential | EXTENSION @ seam | Q2 | `subClassOf schema:EducationalOccupationalCredential` | Licenses/certs truthfully E.O.C.s (`credentialCategory` enumerates "license"). (Omitted until ruled.) | PROPOSED |
| Regulator | EXTENSION @ seam | Q2 | `subClassOf schema:Organization` (NOT GovernmentOrganization) | `regulatedBy` prompt (industry-forces.ts:238) seeds FINRA/SROs/ISO TCs — one SRO falsifies GovernmentOrganization (veto). (Omitted until ruled.) | PROPOSED |
| Formula | NATIVE @ business.org.ai | Q4 | — (alias `Recipe` = false friend of food-scoped `schema:Recipe`; note at seam) | Industrial formulation ≠ food recipe. (Omitted until ruled.) | PROPOSED |
| Shipment | NATIVE @ business.org.ai | Q4 +R17-seam | — (EPCIS `parentID` seam; `schema:ParcelDelivery` = different name, consumer register) | W0-EVT law 6 already binds the seam (subject = aggregate = parentID). (Omitted until ruled.) | PROPOSED |
| CapitalEquipment | NATIVE @ business.org.ai | Q4 | — (alias `Asset`; no schema Asset class) | No counterpart claims name or referent. (Omitted until ruled.) | PROPOSED |
| Country | BORROW @ seam | Q1 | `schema:Country` | ISO 3166-1 merges truth-preservingly; legal edges live on Jurisdiction (§3) — Person/Human split at the geography seam. (Omitted until ruled.) | PROPOSED |
| Subdivision | EXTENSION @ seam | Q2 | `subClassOf schema:AdministrativeArea` (`schema:State` too narrow) | State lineage false for ISO 3166-2 municipalities/dependencies. (Omitted until ruled.) | PROPOSED |
| Regulation | NATIVE @ business.org.ai | Q2-veto → Q4, stub | — (statutory instances `sameAs` ELI/schema:Legislation) | One private rulebook (ISO/PCI-DSS-shaped) falsifies Legislation lineage; claiming later is free. (Omitted until ruled.) | PROPOSED |

### 2d — ICP firmographic axes (SESSION restructure — supersedes the v1 "overlay-first classes" proposal)

| Noun | Disposition | Evidence | Authority |
|---|---|---|---|
| CompanySize, OperationalModel, DecisionStructure | **Phase-B reference vocabularies @ business.org.ai** — closed seeded value-sets, never classes | Live in the atlas as closed enums with `hasSize`/`hasOperationalModel`/`hasGovernanceModel` edges; DecisionStructure runs 3 active values (`Sales_Led`/`Procurement_Led` already retired in-atlas as vendor-motion leaks) | SESSION |
| EconomicBuyerRole | **Retired as a Dimension** — it is the deal-role attribute on the Offer/Opportunity↔Persona edge (§5), never identity | No scaled emitter exists (pin-only across ~92 Tier-0 seeds); five-lens poll unanimous: deal-roles live on the opportunity edge | SESSION |
| Stage | Stub: split the venture funding ladder (Pre_Seed…Series_A_B) from firm lifecycle (Growth/Mature/Declining); load-bearing current use is the `R-stage` WHEN-trigger; static band vs derived state per post-state-never-stored | No scaled emitter; `firmographics.ts` maps it to `fundingStage` with an unimplemented reach dependency | PROPOSED (stub) |
| Trigger, Stake, DataSubstrate | Census-gap candidates @ business.org.ai — the core×rescuer path grammar pins on them, but they are one experiment old | Second-binder / fixation gate | PROPOSED |
| Agent-segment axes ("agent-graphics": kestrel's 6 classes × Authority × Tether) | kestrel venue overlay until the second binder (headless.ly); takes the `workerType` rename on graduation | kestrel ADR 0049; session-6 rename ruling | PROPOSED |

---

## 3 — NEEDS-NATHAN rows (ruling stubs; conservative until ruled) — all PROPOSED

| Noun | Provisional verdict | Branch | External counterpart | Evidence / the open question | Authority |
|---|---|---|---|---|---|
| Document | NATIVE (conservative) | Q4 + stub | `schema:DigitalDocument` / `schema:CreativeWork` candidates | Record-vs-instrument referent call (wet-ink title falsifies DigitalDocument lineage); `Signature.captured@1` is the seed evidence. (Omitted until ruled.) | PROPOSED |
| Model (atlas census sense) | NATIVE (conservative) | Q4 + stub | — | The atlas alias set gives no discriminator (ML/data/product model) — veto by indeterminacy. The repo-baseline `Model` (AI-model sense, §0) is a different sense and stands; this stub is only the atlas referent. | PROPOSED |
| Dataset | BORROW (provisional) | Q1 + stub | `schema:Dataset` | `DataAsset` alias may widen the referent to commercial data products (→ Q2); a one-way door worth the maintainer's eyes. (Omitted until ruled.) | PROPOSED |
| Place | EXTENSION (provisional) | Q2 vs Q3 + stub | `schema:Place` | Category-over-instance grain arguable (Lumber precedent), but only rulable inside the triangle. (Held as borrow until ruled.) | PROPOSED |
| Location | not-yet-admitted (candidate) | stub | collides with `schema:Place` | EPCIS readPoint (where observed — envelope `source`) vs bizLocation (where it is); one noun or two, and who shadows whom, is the ruling. (Omitted until ruled.) | PROPOSED |
| Jurisdiction | NATIVE (conservative) | Q4 + stub | `schema:AdministrativeArea` is the extension candidate | Subject-matter jurisdictions falsify territorial lineage (veto risk); Country's borrow (§2c) leans on Jurisdiction carrying the legal edges. (Omitted until ruled.) | PROPOSED |

**The Place/Location/Jurisdiction triangle rules as one set** (one grill session): a receiving event's `source` is a readPoint; the shipment's `bizLocation` is where it now sits; the FDA's jurisdiction is neither.

---

## 4 — Non-admissions of atlas node-types (PROPOSED except Business)

**Only Business is ruled** (§1). The rest map atlas-canon onto the vocabulary and change nothing in this PR:

- **Frame-alias junctions (9)** — Customers, Suppliers, Partners, Competitors, Channels, Resources, Employers, Buyers, + the `ICPs` junction slug: verb-manifold actor/object renderings; derive from the lemma table at Phase C. (Atlas `ICPs` junction ≠ the ICP class.) — PROPOSED
- **Infra (2)** — `Verb`: non-admission today is the **ratified** state (org.ai ADR 0008 defers the Verb-class naming lock to Nathan's explicit trigger). `Locale`: PROPOSED.
- **Tombstones — sense-scoped after §0:** atlas ADR 0065 retired Tool@instrument and Tool@software; **Tool@agent-sense stands in the native delta** — the ⚠ Tool half of the old conflict dissolves as a sense split. **Capability remains the live three-way conflict** (ADR 0002 R3 native exemplar vs atlas tombstone vs SESSION census omission) — Nathan ruling required. — PROPOSED (Capability ⚠)
- **Refused names — SESSION:** **Segment** (ICP *is* the segment word in our register; bare Segment would mint a synonym — five-lens poll treats them as one object).

---

## 5 — The ICP/Persona structural model (SESSION — ratified in the 2026-07-19 grill; unanimous five-lens poll)

Recorded here because §1's ICP layer note and the **Persona admission proposal** depend on it; canonical prose enters CONTEXT.md/business.org.ai in the PR that ships the classes (ground rule 2).

1. **ICP** = an org/principal-grain **Segment**: a hashable conjunction of firmographic axes (industry × archetype × size × capital-structure × regime, + optional trigger). Exists offer-free; becomes "the ICP *of* an offer" via `Offer —targets→ Segment`. Generalizes to principal-grain across the route matrix: Business → firmographics; Consumer → demographics; Agent (B2A self-principal) → agent-graphics (§2d, gated).
2. **Role** = the bare title spine (JobType; org-independent, intrinsic facts held once).
3. **Persona** = the associative entity `(Role × ICP)` storing **only the delta** (segment-specific pains/WTP/felt-triggers — ADR 0055 bivalence as a normalization rule; a Persona is real iff its delta is non-empty). Carries `workerType`. The StoryBrand hero = an offer's **primary Persona**; agent-era personas resolve to the machine spec-matcher + the upstream human mandate-author. **Persona admission: NEW, Q4-plain → class @ business.org.ai** (no schema.org Persona class exists; no seam forced). — SESSION
4. **Deal-roles** (champion / economic buyer / user / blocker) = attributes on the Persona↔Opportunity edge, never identity (the EconomicBuyerRole retirement, §2d).
5. **Cardinality:** Offer targets 1 ICP, addresses 2–4 Personas, exactly 1 primary; Startup 1—N Offers (YC's "one ICP" = the founding startup is one offer; two-sided marketplaces = one offer per side). The vertical firm-wide bundle is *product scope / expansion footprint*, never an ICP; land-and-expand = enter at the primary Persona, traverse seats within the account.
6. **Routes (B2B / B2A2B / B2H2A / B2A …) are derived, never stored** — computable from `persona.workerType × principal-kind × mandate-present` (W0-EVT law 2's `who ≠ book.principal` is the intermediation edge; id.org.ai `AgentMode` is the identity-plane binder of the same split).
7. **The reality gate** (the junk-parquet fix): every enumerated ICP must satisfy `firm_count ≥ threshold` against a real firm table AND ≥1 active trigger AND ≥1 budget-bearing Persona. **Open dependency:** the atlas holds archetypes, not firm instances — the firm table this predicate counts against does not exist yet.

---

## 6 — SESSION pre-merge edits proposed for PR #1 (branch edits today; identity events after merge)

1. Re-home classes per the §1 layer notes: ICP, JTBD, Problem, Task → business.org.ai; Hypothesis, Idea, Startup, Thesis → startups.org.ai (seam records for Task/Thesis stay).
2. Worker and Agent stay — native delta (§0), Worker gaining `workerType`.
3. Migrate the stray `StoryBrand.mdx` (repo root) → startups.org.ai with a canonical pointer — the mis-homing that exposed the layer architecture.
4. Shadow machinery (shipped for Role/Event/Thesis) extends to Activity/Action + the Formula/Recipe alias note on their ratification.

---

## 7 — The admission queue (asks to Nathan; nothing here is enacted by this PR)

0. **Record the SESSION rulings** on #11 (or as org.ai ADRs): the TypeScript mandate + seam-only membership are constitutional, not table-local; the ICP/Persona model (§5); the native-delta census (§0); the layer assignments (§1 notes, §2 homes, §6 edits). SESSION → RATIFIED happens there, not by merging this PR.
1. Ratify §2's proposed buckets + homes (batch review per ADR 0004's consequence), including the §2d restructure (reference vocabularies; EconomicBuyerRole retirement).
2. Rule the §3 stubs — Document, Model-(atlas-sense), Dataset, and the Place/Location/Jurisdiction triangle as one session — plus the §0 Mandate naming ruling (Mandate vs Authority vs AgentMode; three binders).
3. Rule the **Capability** three-way conflict (§0/§4).
4. Acknowledge the §5 firm-instance-table dependency as open before any parquet regeneration is attempted.

Every extension proposed here composes with R17: external identifiers (NAICS, ISO 3166, GS1 keys, ELI URIs) ride as identifiers at seams regardless of bucket. Terms enter CONTEXT.md in the PR that ships them (ground rule 2).
