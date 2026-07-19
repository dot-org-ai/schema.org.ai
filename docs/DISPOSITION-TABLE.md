# The Phase-A disposition table — per-Noun admission rulings under ADR 0004

**Status:** DRAFT for batch ratification (org.ai issue #11, Phase A; merge by Nathan = ratification per org.ai ADR 0000)
**Procedure:** org.ai ADR 0004 — the admission decision tree. Every row cites a branch: `Q1-borrow` / `Q2-extension` (with the lineage veto) / `Q3-shadow` (native + bare-term shadow) / `Q4-native` / `+R17-seam` (protocol seam composes with any bucket). Cross-canon collisions tie-break on **register proximity** (business/operational canons — GS1/EPCIS, O\*NET, APQC, UNSPSC — outrank consumer-web canons for the bare term). Where genuinely ambiguous: **conservative default = native + ruling stub** — never claiming a lineage is free; un-claiming one is an identity event.
**Census source:** explore.startups.studio `app/_lib/canon/grammar.data.ts` `NODE_TYPES` (~60 registered node types, read 2026-07-19).
**Event-layer context:** stack vault `specs/drivly-rebuild/W0-EVT.md` (frozen 2026-07-19). Its lens doctrine governs every Action-adjacent row: `schema:Action` is a **legal rendering of past events** (completed event → performed Action, `CompletedActionStatus`) — a lens, never a lineage. The Task lineage veto (work-to-be-done is not a performed `schema:Action`) extends across the whole verb-conjugation manifold: only the **event** form ("created") is performed; the **action** form ("create", the capability), the **activity** form ("creating", in flight), and the **act** form are not, and none may claim `schema:Action` lineage.

Flags: **CONFIDENT** = the tree resolves mechanically; ratify in batch. **NEEDS-NATHAN** = the tree is ambiguous or the referent itself is unsettled; ruling stub filed, row ships conservative.

---

## 1 — Already-ruled rows (regression baseline; unchanged, listed for completeness)

| Noun | Verdict | Branch | External counterpart | Ruling source |
|---|---|---|---|---|
| Person | BORROW | Q1 | `https://schema.org/Person` | schema.org.ai PR #1 F4; reaffirmed ADR 0004 second application |
| Company | EXTENSION | Q2 | `https://schema.org/Organization` | F4 exemplar |
| Team | EXTENSION | Q2 | `https://schema.org/Organization` | F4 |
| Product | EXTENSION | Q2 | `https://schema.org/Product` | F5 approval 2026-07-18 (Lumber category-grain tolerated — grain diverges, nothing false) |
| Service | EXTENSION | Q2 | `https://schema.org/Service` | F5 |
| Offer | EXTENSION | Q2 | `https://schema.org/Offer` | F5 |
| Human | EXTENSION | Q2 | `https://schema.org/Person` (subClassOf) | ADR 0004 second application — Q1 fails (attestation, id.org.ai identity, worker-loop homeless on civil-web Person); Q2 passes, no veto |
| Task | NATIVE | Q2-veto → Q4 | — (veto vs `https://schema.org/Action`) | The Task lesson: work-to-be-done is not a performed Action; no schema Task class remains |
| Role | NATIVE + shadow | Q3 | `https://schema.org/Role` (false friend — reified edge-qualifier) | F4 |
| Event | NATIVE + shadow | Q3 +R17-seam | shadows `https://schema.org/Event`; seam-mapped to GS1 EPCIS 2.0 | ADR 0004 first application; W0-EVT freezes the envelope + lens table |
| Agent | NATIVE | Q4 | — (schema.org defines no Agent) | ADR 0004 second application corollary |
| Startup, Problem, Thesis | NATIVE | Q4 (Thesis: Q3, see note) | Thesis shadows `https://schema.org/Thesis` (dissertation sense) | Nathan approval #3, 2026-07-18 (recurrence-proven, live-emitted) |
| ICP, JTBD, Hypothesis, Worker, Idea | NATIVE | Q4 | — | PR #1 flagship natives (F3/F4) |
| Opportunity, Market | overlay-first | — (route call, bucket TBD at graduation) | — | Nathan approval #3: ADR 0057 in-monorepo demotion = negative fixation evidence; graduate per R5 |
| Business | NOT ADMITTED | — | — | Nathan approval #2: Company carries the referent; 'business' stays the Register-1 thesis word |

*Thesis note:* the ruling predates ADR 0004; the bare-name collision with `schema:Thesis` (a dissertation document) makes the shadow mechanics apply automatically per Q3 — bucket unchanged, the context generator shadows the bare term. No re-ruling needed.

---

## 2 — New dispositions: CONFIDENT rows

### 2a — O\*NET / standards work-spine (atlas "G1")

| Noun | Verdict | Branch | External counterpart | Evidence (one line) | Flag |
|---|---|---|---|---|---|
| Industry | NATIVE | Q4 +R17-seam | — (`https://schema.org/naics` is a property, not a class) | schema.org has no Industry class; NAICS codes ride as identifiers at the seam, never as lineage | CONFIDENT |
| Occupation | EXTENSION | Q2 | `https://schema.org/Occupation` | Q1 fails (the O\*NET descriptor tail + work-spine edges would be homeless); every SOC occupation is truthfully a `schema:Occupation` — schema.org itself points `occupationalCategory` at O\*NET-SOC, so the grains agree | CONFIDENT |
| Activity | NATIVE + shadow | Q3 (+ Q2-veto cited) | shadows `https://www.w3.org/ns/activitystreams#Activity` | Lens doctrine: Activity is the occurrent **in flight** ("creating"), not performed — `schema:Action` lineage vetoed a fortiori of Task; as:Activity (a W0-EVT lens at our seam) is a social-feed record of a past event — same name, different referent, business register wins the bare term | CONFIDENT |
| Process | NATIVE | Q2-veto → Q4 | — (veto vs `https://schema.org/HowTo`) | An APQC PCF process category is neither an instruction document (`HowTo`) nor a performed `schema:Action` (performed-vs-to-be-done: a process is the repeatable to-be-done); no schema Process class exists | CONFIDENT |
| Skill | NATIVE | Q4 | — (`https://schema.org/skills` is a text property; ESCO Skill is a seam candidate) | No schema.org Skill class; O\*NET descriptor taxonomy is the referent; ESCO integrates by `sameAs` at the seam if ever needed, never by re-homing | CONFIDENT |
| Knowledge | NATIVE | Q4 | — | O\*NET knowledge-domain descriptor; schema.org offers only the `knowsAbout` property | CONFIDENT |
| Ability | NATIVE | Q4 | — | O\*NET ability descriptor; no external class shares name or referent | CONFIDENT |
| WorkContext | NATIVE | Q4 | — | O\*NET work-context descriptor; no counterpart | CONFIDENT |
| WorkStyle | NATIVE | Q4 | — | O\*NET work-style descriptor; no counterpart | CONFIDENT |
| WorkValue | NATIVE | Q4 | — | O\*NET work-value descriptor; no counterpart | CONFIDENT |
| Interest | NATIVE | Q4 | — | O\*NET RIASEC interest descriptor; no schema.org Interest class | CONFIDENT |
| JobZone | NATIVE | Q4 | — | O\*NET job-zone preparation tier; O\*NET-only concept | CONFIDENT |
| Education | NATIVE | Q4 | — (distinct referent from `https://schema.org/EducationalOccupationalCredential`) | Our Education is the O\*NET required-education **level category**, not an awarded credential — no shared referent, no shared name with any schema class | CONFIDENT |
| Metric | NATIVE | Q4 | — (`https://schema.org/StatisticalVariable` is a seam candidate, not a collision) | APQC OSB measure definition; no schema class named Metric; StatisticalVariable integrates by seam if benchmarking data ever needs web rendering | CONFIDENT |
| MetricCategory | NATIVE | Q4 | — | APQC OSB metric-category tier (the 5 thematic categories above Metric); standard-internal, no counterpart | CONFIDENT |

*(Place — atlas G1 — is deliberately pulled out of this section into the NEEDS-NATHAN row pair, §3.)*

### 2b — Derived archetypes (atlas "G2-core")

| Noun | Verdict | Branch | External counterpart | Evidence (one line) | Flag |
|---|---|---|---|---|---|
| CompanyType | NATIVE | Q4 | — | A firm archetype ("Dental Practice") is a category of organizations, not an organization; schema.org has no metaclass for it, and the wild does not use Organization category-ish (no Lumber precedent here) | CONFIDENT |
| JobType | NATIVE | Q4 | — (`https://schema.org/JobPosting` is a different referent — the ad, not the role archetype) | The G2 role archetype; relates to already-ruled native Role, not to any schema class | CONFIDENT |
| Department | NATIVE | Q4 | — (`https://schema.org/department` is a property → Organization) | A department **archetype** ("Marketing") across firms is a category, not an organization instance; claiming Organization lineage would be metaclass falsity, not tolerable grain divergence | CONFIDENT |

### 2c — Digital / GS1 tail (atlas "G2-tail")

| Noun | Verdict | Branch | External counterpart | Evidence (one line) | Flag |
|---|---|---|---|---|---|
| Action | NATIVE + shadow | Q3 +R17-seam | shadows `https://schema.org/Action` | The verb manifold's **action** form — the standing capability a Software exposes ("create"), neither performed nor to-be-done; `schema:Action` (a performed/potential act by an agent on an object) is a false friend, and the legal seam is on **Event**: completed events render as performed Actions (W0-EVT lens table), our Action type never claims the lineage; register proximity: the builder typing `Action` means the capability, the web sense pays the full-IRI tax | CONFIDENT |
| DataNoun | NATIVE | Q4 | — | A metaclass (the Lead/Contact/Order/Invoice SVO Objects an Action `operatesOn`); no external canon types the data-noun dimension itself — individual data-nouns may seam to schema.org kin (`Invoice` → `schema:Invoice`) per instance, by identifier | CONFIDENT |
| Software | EXTENSION | Q2 | `https://schema.org/SoftwareApplication` | Every ingested Software node is truthfully a software application; our shape adds permanent structure (exposes → Action, operatesOn → DataNoun); no veto instance exists | CONFIDENT |
| Credential | EXTENSION | Q2 | `https://schema.org/EducationalOccupationalCredential` | Every License/Credential node (occupational license, certification) is truthfully an E.O.C. — `credentialCategory` even enumerates "license"; our shape adds issuedBy → Regulator and requiredFor → JobType edges | CONFIDENT |
| Regulator | EXTENSION | Q2 | `https://schema.org/Organization` (NOT GovernmentOrganization) | The atlas `regulatedBy` authoring prompt (industry-forces.ts:238) explicitly seeds FINRA, self-regulatory bodies, and ISO technical committees — one SRO falsifies `schema:GovernmentOrganization` lineage (the veto), but every regulator is truthfully an Organization | CONFIDENT |
| Formula | NATIVE | Q4 | — (alias `Recipe` is a false friend of `https://schema.org/Recipe` — food-scoped HowTo) | An industrial formulation is not a food recipe (veto on the alias); no schema class named Formula; if the Recipe alias survives into the vocabulary it shadows per Q3 | CONFIDENT |
| Shipment | NATIVE | Q4 +R17-seam | — (seam: GS1 EPCIS 2.0 aggregation — `parentID`; `https://schema.org/ParcelDelivery` is a different name and a consumer register) | W0-EVT law 6 already binds the seam: subject = the aggregate noun (`shipment_…` = EPCIS parentID), children ride payload; GS1's sense aligns → seam, not bucket | CONFIDENT |
| CapitalEquipment | NATIVE | Q4 | — (alias `Asset`; schema.org has no Asset class) | O\*NET/ingest capital-equipment referent; no external counterpart claims name or referent | CONFIDENT |
| Country | BORROW | Q1 | `https://schema.org/Country` | ISO 3166-1 countries merge truth-preservingly into `schema:Country`; the legal-structure edges that would otherwise be homeless live on Jurisdiction (§3) — the Person/Human split repeated at the geography seam | CONFIDENT |
| Subdivision | EXTENSION | Q2 | `https://schema.org/AdministrativeArea` (subClassOf; `schema:State` too narrow) | Q1 fails (AdministrativeArea's referent is broader — not the same referent); every ISO 3166-2 subdivision is truthfully an AdministrativeArea; `schema:State` lineage would be false for municipalities/dependencies in 3166-2 (veto on the narrower class only) | CONFIDENT |
| Regulation | NATIVE | Q2-veto → Q4, stub | — (statutory instances seam to `https://schema.org/Legislation` by `sameAs`) | The same seed prompt that names ISO TCs as Regulators makes their rulebooks (ISO standards, SRO rules, PCI-DSS-shaped private standards) Regulation instances — one private rulebook falsifies `schema:Legislation` lineage; native now, and claiming the lineage later is free if the census proves all-statutory (the ADR 0004 asymmetry) | CONFIDENT |

*(Event, Company, Product, Service, Offer, Document, Dataset, Model sit elsewhere: ruled (§1) or NEEDS-NATHAN (§3).)*

### 2d — ICP tuple-component axes (ADR 0047 §1)

| Noun | Verdict | Branch | External counterpart | Evidence (one line) | Flag |
|---|---|---|---|---|---|
| CompanySize | overlay-first | — (Q4 if/when graduated) | — (`https://schema.org/numberOfEmployees` is a property) | The ICP axis shape is still moving: kestrel ADR 0049 adds Species (human \| agent), route, and authority axes the canon five lack — the human-B2B-shaped axes predate Agent Customers; per the fixation gate they graduate when a second binder (headless.ly candidate) exercises them | CONFIDENT |
| OperationalModel | overlay-first | — (Q4 if/when graduated) | — | Same batch ruling as CompanySize | CONFIDENT |
| DecisionStructure | overlay-first | — (Q4 if/when graduated) | — | Same batch ruling | CONFIDENT |
| EconomicBuyerRole | overlay-first | — (Q4 if/when graduated) | — | Same batch ruling | CONFIDENT |
| Stage | overlay-first | — (Q4 if/when graduated) | — | Same batch ruling; the Opportunity/Market precedent (Nathan approval #3) is the route authority | CONFIDENT |

### 2e — Greenfield legal spine (PRD #578) — Country, Subdivision, Regulation ruled in §2c; Jurisdiction in §3

---

## 3 — NEEDS-NATHAN rows (ruling stubs filed; each ships the conservative branch until ruled)

| Noun | Provisional verdict | Branch | External counterpart | Evidence / the open question | Flag |
|---|---|---|---|---|---|
| Document | NATIVE (conservative) | Q4 + stub | `https://schema.org/DigitalDocument` and `https://schema.org/CreativeWork` are the live candidates | Platform Documents are act-bearing instruments (the documents unit minted Signature per R-ad; `signature.captured@1` is in the W0-EVT registry seed) — if a Document node can represent a wet-ink paper title, `DigitalDocument` lineage asserts falsity (veto); if Documents are always the digital record **of** the instrument, Q2-extension of DigitalDocument is clean. That referent call — record vs instrument — is the maintainer's, not the tree's | NEEDS-NATHAN |
| Model | NATIVE (conservative) | Q4 + stub | — (no bare `schema:Model`; `https://schema.org/3DModel` is a different name; CreativeWork/SoftwareApplication both loose) | The atlas alias set gives no discriminator: an ingested "Model" may be an ML model, a data model, or a product model — the referent itself is unsettled, so no lineage can be truthfully claimed for **every** instance (veto by indeterminacy); native costs nothing, claiming later is free | NEEDS-NATHAN |
| Dataset | BORROW (provisional) | Q1 + stub | `https://schema.org/Dataset` | Merging our datasets into `schema:Dataset` (DCAT-aligned, business-register-proximate via Dataset Search) looks truth-preserving — but the `DataAsset` alias may widen the referent to commercial data **products** (licensing, offers, access tiers) whose fields pull toward Q2-extension instead; borrow-vs-extension here is a one-way door worth the maintainer's eyes | NEEDS-NATHAN |
| Place | EXTENSION (provisional) | Q2 vs Q3 + stub | `https://schema.org/Place` | The atlas Place is the G1 place-**type** taxonomy (the `Place subtypeOf Place` classificatory ladder) — category grain over schema:Place's instance grain, tolerable per ADR 0004 (the Lumber precedent), so Q2 is arguable; but the row cannot be ruled alone — it is one corner of the Place/Location/Jurisdiction triangle below, and which noun takes the **bare term** is a register call | NEEDS-NATHAN |
| Location | not-yet-admitted (candidate) | stub (queued from grill session 3) | collides with `https://schema.org/Place` (schema.org has no Location class; `schema:location` is a property) | The EPCIS seed evidence: **readPoint (where observed) vs bizLocation (where it is)** are different senses — the W0-EVT envelope already carries `source` (≈ readPoint) and "physical where" rides payload; if the platform needs a "where it is" noun distinct from the place-type taxonomy, Location is it — one noun or two, and who shadows whom against schema:Place, is the ruling | NEEDS-NATHAN |
| Jurisdiction | NATIVE (conservative) | Q4 + stub | `https://schema.org/AdministrativeArea` is the extension candidate | Every geographic jurisdiction is arguably an AdministrativeArea, but jurisdictions defined by subject-matter rather than territory (a regulator's mandate scope) falsify the lineage (veto risk); the Country borrow (§2c) leans on Jurisdiction carrying the legal-structure edges, and Place-vs-Jurisdiction boundary (is a court district a Place?) must be ruled with the triangle above | NEEDS-NATHAN |

**The Place/Location/Jurisdiction triangle should be ruled as a set** (one grill session), with the EPCIS where-observed/where-it-is distinction as the forcing example: a receiving event's `source` is a readPoint; the shipment's `bizLocation` is where it now sits; the FDA's jurisdiction is neither.

---

## 4 — Non-admissions (registered atlas node-types that are NOT vocabulary Nouns)

Listed per the census for completeness; none get classes at schema.org.ai.

**Frame-alias / reverse-rel junctions (9)** — `Customers`, `Suppliers`, `Partners`, `Competitors`, `Channels`, `Resources`, `Employers`, `Buyers`, plus the `ICPs` junction slug. These are predicate-rendering surfaces (`aliasJunction: true`), not Nouns: per the maintainer's verb-manifold model (issue #11 Phase-C comment) they are **actor/object role-noun renderings of verbs** ("customer" is the actor-form of "buy"-side relations) and derive from the lemma table when the grammar graduates — generated, never admitted. *Reconciliation note:* the atlas `ICPs` slug is this junction Dimension; the already-ruled native **ICP** class (§1) is the cascade Noun — both are real, the junction renders edges, the class types instances.

**Infra axes (2)** — `Verb`, `Locale` (`infra: true`). Machinery of the grammar itself, not economy Nouns. Verb in particular is the **generator** (the conjugation manifold), pending Phase C — admitting it as a Noun would freeze what is actually a code-generation source.

**Tombstones (2)** — `Tool`: not a Noun per ADR 0065 — it is the `usesTool` **edge** → Product (physical) \| Action (digital); the slug lingers in valid-noun-types.ts as a render tombstone only. `Capability`: DELETED as a Noun in canon (reified as `bears`/`realizedBy`), registered only so live MANIFEST facets don't trip `unknown-src-type` (`legacyDeletedNoun: true`).

**Business** — already ruled NOT ADMITTED (§1); listed here too since it is the one name a builder will reach for that must resolve to Company.

---

## 5 — Ratification asks

1. Batch-ratify §2 (34 CONFIDENT rows: 15 work-spine, 3 archetypes, 11 digital/GS1 tail, 5 overlay-first axes).
2. Rule the six §3 stubs — Document, Model, Dataset, and the Place/Location/Jurisdiction triangle (the triangle as one session).
3. Confirm the §1 Thesis shadow note (mechanical consequence of ADR 0004 Q3, no bucket change).

Every extension ruled here composes with R17: external identifiers (NAICS, ISO 3166, GS1 keys, ELI URIs) ride as identifiers at seams regardless of bucket. Shadow machinery for the new Q3 rows (Activity, Action, and the Formula/Recipe alias) ships in the context generator alongside the existing Role/Event shadows (ground rule 2: their terms enter CONTEXT.md in the PR that ships them).
