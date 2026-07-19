# The disposition table — seam rulings, the native delta, and layer assignments

**Status:** authority-split per row. Every row carries an **Authority** mark:

- **RATIFIED** — the ruling was already made, by merged org.ai canon or by Nathan's explicit approval on [org.ai issue #11](https://github.com/dot-org-ai/org.ai/issues/11); the citation is on the row. **Merging this PR ratifies ONLY the rows marked RATIFIED** (and, for those implemented here, ships their implementation).
- **SESSION** — ruled by Nathan in the 2026-07-19 grill session and **recorded on [#11, comment 2026-07-19](https://github.com/dot-org-ai/org.ai/issues/11#issuecomment-5017554806)** — SESSION rows are ratified as of that comment; the mark is kept for provenance. The constitutional principles are additionally filed as **org.ai ADR 0011** ([PR #18](https://github.com/dot-org-ai/org.ai/pull/18), merge = ratification). The same comment carries the **proceed-rulings**: §2 batch ratified except Action; Dataset = extension; Stage = split; the Place/Location/Jurisdiction triangle deferred to the EPCIS grill.
- **PROPOSED** — the tree has been run but the admission is **not yet ruled**. PROPOSED rows await explicit admission per org.ai ADR 0004's procedure. **Merging this PR does NOT ratify any PROPOSED row.** No PROPOSED type is admitted in the generated context: each stays exactly in its pre-ruling state until ruled.

**Procedure:** org.ai ADR 0004 — the admission decision tree (`Q1-borrow` / `Q2-extension` + lineage veto / `Q3-shadow` / `Q4-native` / `+R17-seam`; register-proximity tie-break; conservative default = native + ruling stub), composed with the two ADR 0011 principles:

> **The mandate (the TypeScript principle).** schema.org.ai's mandate is to not have to exist: an AI-native superset over schema.org whose native delta is shaped as an upstream proposal — if schema.org adopts it, it stops being a superset, and that is success. Every native addition must pass "could schema.org plausibly adopt this?"
>
> **Seam-only membership.** A class enters schema.org.ai iff schema.org forces a ruling on it (Q1 borrows; Q2 extensions — the `subClassOf` edge is the point; Q3 shadows — the bare-term rebinding is the point) plus the deliberately tiny native delta (§0). **Q4-plain natives (no counterpart, no collision) never need the seam and live at their claiming layer.** Bucket rulings are unaffected — "native" stays native; the layer principle only assigns *where the class lives*.

**The layer stack** (most-specific claiming dimension wins; org.ai CONTEXT.md canonical-home rule): **schema.org.ai** (seam + native delta, small by construction) · **business.org.ai** (general-business Nouns; already hosts industries/occupations/departments/processes at ~5× schema.org's type count) · **startups.org.ai** (the studio abstraction: lifecycle@1/primitives, LeanCanvas, StoryBrand) · **id.org.ai** (Agent + Human identity and delegated authorization; shipped: WorkOS humans, Ed25519 agents, claim-by-commit, L0–L4 tiers, `AgentMode: delegated | autonomous`) · other Tier-2 dimensions per R7/R8.

**Census source:** explore.startups.studio `app/_lib/canon/grammar.data.ts` `NODE_TYPES` (~60 registered node types, read 2026-07-19).

**Event-layer context (analysis input, not authority):** stack vault `specs/drivly-rebuild/W0-EVT.md` (frozen 2026-07-19). Its lens doctrine informs the Action-adjacent rows: `schema:Action` is a legal *rendering* of past events — a lens, never a lineage.

---

## 0 — The native delta over schema.org (one property, five classes)

The grill census closed the superset addition at exactly this set; the repo baseline already anticipated most of it.

| Addition | Kind | Definition | Evidence | Authority |
|---|---|---|---|---|
| `digital` | property on `schema:Thing` | Marks digital-native things — the axis the atlas kept rediscovering (digital≈0 physical tools vs digital=1.0 actions; DataNouns; the digital-twin seam) | Recurred across ADR 0065, the DataNoun dimension, digital ingest | SESSION (recorded) |
| **Agent** | class | The autonomous actor; Q4 (schema.org defines no Agent). Identity plane: id.org.ai | RATIFIED bucket (§1); shipped `src/things/agent.ts` | RATIFIED + SESSION |
| **Model** | class | The AI model (weights + capability; `claude-fable-5`) — the AI-native sense | Repo-baseline native already carries this sense; the atlas census "Model" (indeterminate referent) is a *different sense* → §3 stub. Sense-level discipline per domain-vocab spike amendment 9 | SESSION (recorded) |
| **Tool** | class | The callable capability an agent wields (MCP / function-calling sense) | Repo-baseline native already carries this sense. NOT in tension with atlas ADR 0065 (tombstoned Tool@instrument → Product and Tool@software → `usesTool` edge — different senses) | SESSION (recorded) |
| **Worker** | class | The Human \| Agent interface, discriminated by `workerType: 'agent' \| 'human'` (R12 id-token prefixes; "species" retired permanently — session-6 ruling) | RATIFIED bucket (§1); the actor triangle {Agent, Human ⊂ Person, Worker} ships complete | RATIFIED + SESSION |
| **Mandate** | naming ruling open | Delegation/authority — an actor operating under granted scope | Three binders under three names: id.org.ai `AgentMode: delegated \| autonomous` (shipped), W0-EVT `authority: mandate_…` (frozen), kestrel `deputized \| self-principal` (ratified). **Queued as its own grill session** per the #11 proceed-rulings; recommendation on record: Mandate names the grant, authority = citing field, AgentMode = derived view, Capability@authorization = what a Mandate grants; claiming dimension id.org.ai | PROPOSED (session queued) |

**Capability** is deliberately NOT in the census — the three-way conflict (ADR 0002 R3 native exemplar vs atlas tombstone-into-Action vs census omission) rules **inside the queued Mandate session** (§4 ⚠).

---

## 1 — RATIFIED rows (already ruled; citations on each row)

Implemented in this PR where marked ⚙; rows without ⚙ ride a follow-up census PR. **Layer notes** (in brackets, now recorded) assign homes without touching buckets; re-homing edits are §6.

| Noun | Verdict | Branch | External counterpart | Authority (citation) |
|---|---|---|---|---|
| Person | BORROW | Q1 | `https://schema.org/Person` | **RATIFIED** — ADR 0002 R3 borrow exemplar; ADR 0004 Q1 exemplar + second application ⚙ |
| Company | EXTENSION | Q2 | `subClassOf schema:Organization` | **RATIFIED** — [#11 approval 2](https://github.com/dot-org-ai/org.ai/issues/11#issuecomment-5013244753); ADR 0004 Q2 ⚙ |
| Team | EXTENSION | Q2 | `subClassOf schema:Organization` | **RATIFIED** — ADR 0002 R3 third ruling; ADR 0004 Q2 exemplar ⚙ |
| Product | EXTENSION | Q2 | `subClassOf schema:Product` | **RATIFIED** — #11 approval 2; ADR 0004 Q2 (F5). Lumber category-grain tolerated ⚙ |
| Service | EXTENSION | Q2 | `subClassOf schema:Service` | **RATIFIED** — same ⚙ |
| Offer | EXTENSION | Q2 | `subClassOf schema:Offer` | **RATIFIED** — same ⚙ |
| Human | EXTENSION | Q2 | `subClassOf schema:Person` | **RATIFIED** — ADR 0004 second application. Class emission queued for the census follow-up |
| Task | NATIVE | Q2-veto → Q4 | — (veto vs `schema:Action`) | **RATIFIED** — ADR 0002 R3 first ruling; ADR 0004 lineage veto ⚙ *(layer: class → business.org.ai; veto record stays at seam — recorded)* |
| Role | NATIVE + shadow | Q3 | shadows `schema:Role` | **RATIFIED** — ADR 0002 R3 second ruling; ADR 0004 Q3 exemplar ⚙ *(seam member)* |
| Event | NATIVE + shadow | Q3 +R17-seam | shadows `schema:Event`; seam-mapped EPCIS 2.0 | **RATIFIED** — ADR 0004 first application ⚙ *(seam member)* |
| Agent | NATIVE | Q4 | — | **RATIFIED** — ADR 0002 R3; ADR 0004 second application corollary ⚙ *(native delta, §0)* |
| Startup | NATIVE | Q4 | — | **RATIFIED** — ADR 0002 R3 ⚙ *(layer: class → startups.org.ai — recorded)* |
| ICP, JTBD, Hypothesis, Idea | NATIVE | Q4 | — | **RATIFIED** — ADR 0002 R3 ⚙ *(layer: ICP, JTBD → business.org.ai; Hypothesis, Idea → startups.org.ai; ICP referent per §5 — recorded)* |
| Worker | NATIVE | Q4 | — | **RATIFIED** — ADR 0002 R3; ADR 0004 second application ⚙ *(native delta with `workerType`, §0)* |
| Capability | NATIVE | Q4 | — | **RATIFIED** — ADR 0002 R3 native exemplar. ⚠ Three-way conflict → rules in the queued Mandate session (§0) ⚙ |
| Problem | NATIVE | Q4 | — | **RATIFIED** — #11 approval 3 ⚙ *(layer: class → business.org.ai — recorded)* |
| Thesis | NATIVE (+ mechanical shadow) | Q3 | shadows `schema:Thesis` | **RATIFIED** (native) — #11 approval 3; shadow = mechanical Q3 consequence ⚙ *(layer: class → startups.org.ai; shadow record stays at seam — recorded)* |
| Opportunity, Market | OVERLAY-FIRST | — | — | **RATIFIED** — #11 approval 3; demoted to the startups.studio overlay in this PR ⚙ |
| Business | NOT ADMITTED | — | — | **RATIFIED** — #11 approval 2 ⚙ |

---

## 2 — The census batch: **RATIFIED except Action** ([#11 proceed-rulings, 2026-07-19](https://github.com/dot-org-ai/org.ai/issues/11#issuecomment-5017554806))

Every row below is ratified at its stated bucket + home **except Action** (PROPOSED — rides the ADR 0008 Verb-naming-lock moment; held at its borrow baseline). **Explicit ratified baseline change: Occupation borrow → extension.** Place is not in this section (held at borrow baseline pending the EPCIS-grill triangle, §3). Implementation (class emission, re-homing) rides the census follow-up PR — merging *this* PR still ships only the §1 ⚙ set.

### 2a — O\*NET / standards work-spine → home: business.org.ai (except seam rows)

| Noun | Verdict | Branch | External counterpart | Evidence (one line) | Authority |
|---|---|---|---|---|---|
| Industry | NATIVE @ business.org.ai | Q4 +R17-seam | — (`schema:naics` is a property) | No schema Industry class; NAICS by identifier at the seam | RATIFIED — #11 2026-07-19 |
| Occupation | EXTENSION @ seam | Q2 | `schema:Occupation` | Q1 fails (descriptor tail homeless); every SOC occupation truthfully theirs (`occupationalCategory` points at O\*NET-SOC). **Baseline change: borrow → extension** | RATIFIED — #11 2026-07-19 |
| Activity | NATIVE + shadow @ seam | Q3 (+ Q2-veto cited) | shadows `as:Activity` | Occurrent in flight ("creating") — schema:Action veto a fortiori of Task; as:Activity records past events (our Event wearing our other word's name) | RATIFIED — #11 2026-07-19 |
| Process | NATIVE @ business.org.ai | Q2-veto → Q4 | — (veto vs `schema:HowTo`) | A PCF process category is neither an instruction document nor a performed Action | RATIFIED — #11 2026-07-19 |
| Skill, Knowledge, Ability, WorkContext, WorkStyle, WorkValue, Interest, JobZone | NATIVE @ business.org.ai | Q4 | — (ESCO Skill = seam candidate by `sameAs` only) | O\*NET descriptor taxonomy; no schema.org classes | RATIFIED — #11 2026-07-19 |
| Education | NATIVE @ business.org.ai | Q4 | — (distinct from E.O.C.) | O\*NET required-education *level category*, not an awarded credential | RATIFIED — #11 2026-07-19 |
| Metric, MetricCategory | NATIVE @ business.org.ai | Q4 | — (`schema:StatisticalVariable` seam candidate only) | APQC OSB measure definitions | RATIFIED — #11 2026-07-19 |

### 2b — Derived archetypes → home: business.org.ai

| Noun | Verdict | Branch | External counterpart | Evidence (one line) | Authority |
|---|---|---|---|---|---|
| CompanyType | NATIVE @ business.org.ai | Q4 | — | A firm archetype is a category of organizations (metaclass, not grain divergence) | RATIFIED — #11 2026-07-19 |
| JobType | NATIVE @ business.org.ai | Q4 | — (`schema:JobPosting` is the ad) | The G2 role archetype; the bare-Role spine of §5 | RATIFIED — #11 2026-07-19 |
| Department | NATIVE @ business.org.ai | Q4 | — (`schema:department` is a property) | Department archetype across firms is a category | RATIFIED — #11 2026-07-19 |

### 2c — Digital / GS1 tail

| Noun | Verdict | Branch | External counterpart | Evidence (one line) | Authority |
|---|---|---|---|---|---|
| Action | NATIVE + shadow @ seam | Q3 +R17-seam | shadows `schema:Action` | The verb manifold's capability form; the wild's schema:Action is the perfective = our Event; rendering seam lives on Event's lens. ⚠ Rides ADR 0008's Verb-naming lock. (Held as borrow until ruled.) | **PROPOSED** — excluded from the batch |
| DataNoun | NATIVE @ business.org.ai | Q4 | — | Metaclass of SVO data objects; per-instance seams by identifier | RATIFIED — #11 2026-07-19 |
| Software | EXTENSION @ seam | Q2 | `subClassOf schema:SoftwareApplication` | Adds exposes → Action, operatesOn → DataNoun | RATIFIED — #11 2026-07-19 |
| Credential | EXTENSION @ seam | Q2 | `subClassOf schema:EducationalOccupationalCredential` | Licenses/certs truthfully E.O.C.s | RATIFIED — #11 2026-07-19 |
| Regulator | EXTENSION @ seam | Q2 | `subClassOf schema:Organization` (NOT GovernmentOrganization) | FINRA/SROs/ISO TCs falsify GovernmentOrganization (veto) | RATIFIED — #11 2026-07-19 |
| Formula | NATIVE @ business.org.ai | Q4 | — (`Recipe` alias = false friend; note at seam) | Industrial formulation ≠ food recipe | RATIFIED — #11 2026-07-19 |
| Shipment | NATIVE @ business.org.ai | Q4 +R17-seam | — (EPCIS `parentID` seam) | W0-EVT law 6 binds the seam | RATIFIED — #11 2026-07-19 |
| CapitalEquipment | NATIVE @ business.org.ai | Q4 | — (alias `Asset`) | No counterpart claims name or referent | RATIFIED — #11 2026-07-19 |
| Country | BORROW @ seam | Q1 | `schema:Country` | ISO 3166-1 merges truth-preservingly; legal edges live on Jurisdiction (§3) | RATIFIED — #11 2026-07-19 |
| Subdivision | EXTENSION @ seam | Q2 | `subClassOf schema:AdministrativeArea` | `schema:State` false for ISO 3166-2 municipalities/dependencies | RATIFIED — #11 2026-07-19 |
| Regulation | NATIVE @ business.org.ai | Q2-veto → Q4 | — (statutory instances `sameAs` ELI) | One private rulebook falsifies Legislation lineage; claiming later is free | RATIFIED — #11 2026-07-19 |

### 2d — ICP firmographic axes

| Noun | Disposition | Evidence | Authority |
|---|---|---|---|
| CompanySize, OperationalModel, DecisionStructure | **Phase-B reference vocabularies @ business.org.ai** — closed seeded value-sets, never classes | Closed enums with `hasSize`/`hasOperationalModel`/`hasGovernanceModel` edges; DecisionStructure = 3 active values | SESSION (recorded) |
| EconomicBuyerRole | **Retired as a Dimension** — the deal-role attribute on the Offer/Opportunity↔Persona edge (§5) | Pin-only in live data; five-lens poll unanimous | SESSION (recorded) |
| Stage | **SPLIT** — funding ladder (Pre_Seed…Series A/B) → startups.org.ai reference vocabulary; firm lifecycle **derived, never stored**; transition use rides the WHEN/Trigger family | #11 proceed-rulings 2026-07-19; post-state-never-stored doctrine; load-bearing use was the `R-stage` trigger | RATIFIED — #11 2026-07-19 |
| Trigger, Stake, DataSubstrate | Census-gap candidates @ business.org.ai; deferred on the fixation gate. **Watch-condition: the Stage split routes stage-transitions into the WHEN family — Trigger gains its second binder there and is ruled at that moment** | core×rescuer path grammar pins on them; one experiment old | PROPOSED (gated) |
| Agent-segment axes ("agent-graphics") | kestrel venue overlay until the second binder (headless.ly). On graduation use the **R-ah lens vocabulary**: `workerType · activity · authority · presence (local \| relay \| absent)` — not ADR 0049's Species/Tether | kestrel ADR 0049; session-6 + R-ah rulings | PROPOSED (gated) |

---

## 3 — Remaining stubs

| Noun | State | Evidence / gate | Authority |
|---|---|---|---|
| Document | Conservative native; **waits on the documents unit's referent** (record vs instrument — wet-ink title falsifies DigitalDocument lineage) | `Signature.captured@1` is the seed | PROPOSED (referent-gated) |
| Model (atlas census sense) | Conservative native; **waits on the atlas census disambiguation task** (classify the live "Models" instances, then the row resolves mechanically) | Superset Model@AI-sense (§0) is unaffected | PROPOSED (referent-gated) |
| Dataset | **EXTENSION** (`subClassOf schema:Dataset`) — ruled, reversing the provisional borrow: the never-claim asymmetry; crawler comprehension rides the subclass edge; the `DataAsset` widening can never force an un-borrow | #11 proceed-rulings 2026-07-19 | RATIFIED — #11 2026-07-19 |
| Place / Location / Jurisdiction | **DEFERRED to the EPCIS grill** (running separately; rules the triangle as one set). Place holds its borrow baseline; Location/Jurisdiction stay omitted | readPoint (where observed) vs bizLocation (where it is) is the forcing distinction | DEFERRED (EPCIS grill) |

---

## 4 — Non-admissions of atlas node-types

- **Frame-alias junctions (9)** — Customers, Suppliers, Partners, Competitors, Channels, Resources, Employers, Buyers, + the `ICPs` junction slug: verb-manifold actor/object renderings; derive from the lemma table at Phase C. — PROPOSED
- **Infra (2)** — `Verb`: non-admission today is the **ratified** state (org.ai ADR 0008 defers the Verb-class naming lock). `Locale`: PROPOSED.
- **Tombstones — sense-scoped after §0:** Tool@instrument and Tool@software stay retired (atlas ADR 0065); **Tool@agent-sense stands in the native delta**. **Capability** rules in the queued Mandate session. — PROPOSED (Capability ⚠)
- **Refused names — recorded:** **Business** (RATIFIED, #11 approval 2) · **Segment** (SESSION recorded — ICP *is* the segment word; bare Segment would mint a synonym).

---

## 5 — The ICP/Persona structural model (SESSION — recorded on #11, 2026-07-19)

Canonical prose enters CONTEXT.md/business.org.ai in the PR that ships the classes (ground rule 2).

1. **ICP** = an org/principal-grain **Segment**: a hashable conjunction of firmographic axes (industry × archetype × size × capital-structure × regime, + optional trigger). Exists offer-free; becomes "the ICP *of* an offer" via `Offer —targets→ Segment`. Principal-grain across the route matrix: Business → firmographics; Consumer → demographics; Agent (B2A self-principal) → agent-graphics (§2d, gated).
2. **Role** = the bare title spine (JobType; org-independent, intrinsic facts held once).
3. **Persona** = the associative entity `(Role × ICP)` storing **only the delta** (ADR 0055 bivalence as a normalization rule; a Persona is real iff its delta is non-empty). Carries `workerType`. The StoryBrand hero = an offer's **primary Persona**; agent-era personas = machine spec-matcher + upstream human mandate-author. **Persona admission: NEW, Q4-plain → class @ business.org.ai.** — recorded
4. **Deal-roles** = attributes on the Persona↔Opportunity edge, never identity (the EconomicBuyerRole retirement, §2d).
5. **Cardinality:** Offer targets 1 ICP, addresses 2–4 Personas, exactly 1 primary; Startup 1—N Offers; two-sided = one offer per side. The vertical firm-bundle is *product scope / expansion footprint*, never an ICP.
6. **Routes are derived, never stored** — `persona.workerType × principal-kind × mandate-present` (W0-EVT law 2; id.org.ai `AgentMode` is the identity-plane binder of the same split).
7. **The reality gate:** emitted ICP ⟺ `firm_count ≥ threshold` against a real firm table AND ≥1 active trigger AND ≥1 budget-bearing Persona. **Open dependency: the firm-instance table** — scheduled as a business.org.ai data-plane workstream (#11 proceed-rulings; sourcing fork open: Census SUSB vs commercial feed); gates any parquet regeneration.

---

## 6 — Pre-merge edits for PR #1 (recorded; branch edits today, identity events after merge)

1. Re-home classes per §1 layer notes: ICP, JTBD, Problem, Task → business.org.ai; Hypothesis, Idea, Startup, Thesis → startups.org.ai (seam records for Task/Thesis stay).
2. Worker and Agent stay — native delta (§0), Worker gaining `workerType`.
3. Migrate the stray `StoryBrand.mdx` (repo root) → startups.org.ai with a canonical pointer.
4. Shadow machinery (shipped for Role/Event/Thesis) extends to Activity (+ the Formula/Recipe alias note); Action's shadow waits with its row.
5. Implement the §2 ratified batch (Occupation borrow → extension; business.org.ai class emissions ride the census follow-up).

---

## 7 — What remains open

1. **The queued Mandate grill session** — Mandate vs Authority vs AgentMode + Capability@authorization (claiming dimension id.org.ai).
2. **The EPCIS grill** rules the Place/Location/Jurisdiction triangle (Nathan, separately).
3. **Action** — rules at the ADR 0008 Verb-naming-lock moment.
4. **Document / atlas-sense Model** — referent-gated (documents unit; atlas disambiguation task).
5. **Trigger** — rules when the Stage-split gives it its second binder; Stake/DataSubstrate stay fixation-gated.
6. **Firm-instance table** — sourcing decision, then build (business.org.ai data plane).
7. **org.ai ADR 0011** (PR #18) — merge = ratification of the constitutional principles.

Every extension composes with R17: external identifiers (NAICS, ISO 3166, GS1 keys, ELI URIs) ride as identifiers at seams regardless of bucket. Terms enter CONTEXT.md in the PR that ships them (ground rule 2).
