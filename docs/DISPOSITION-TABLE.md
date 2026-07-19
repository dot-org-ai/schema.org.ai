# The Phase-A disposition table — per-Noun admission rulings under ADR 0004

**Status:** authority-split per row. Every row carries an **Authority** mark:

- **RATIFIED** — the ruling was already made, by merged org.ai canon or by Nathan's explicit approval on [org.ai issue #11](https://github.com/dot-org-ai/org.ai/issues/11); the citation is on the row. **Merging this PR ratifies ONLY the rows marked RATIFIED** (and, for those implemented here, ships their implementation).
- **PROPOSED** — the tree has been run but the admission is **not yet ruled**. PROPOSED rows await explicit admission per org.ai ADR 0004's procedure (maintainer ratification of the row, or a ruling-stub session). **Merging this PR does NOT ratify any PROPOSED row.** No PROPOSED type is admitted in the generated context: each stays exactly in its pre-ruling state — held as borrow, kept at its pre-existing repo-baseline bucket, or omitted — until ruled.

**Procedure:** org.ai ADR 0004 — the admission decision tree. Every row cites a branch: `Q1-borrow` / `Q2-extension` (with the lineage veto) / `Q3-shadow` (native + bare-term shadow) / `Q4-native` / `+R17-seam` (protocol seam composes with any bucket). Cross-canon collisions tie-break on **register proximity** (business/operational canons — GS1/EPCIS, O\*NET, APQC, UNSPSC — outrank consumer-web canons for the bare term). Where genuinely ambiguous: **conservative default = native + ruling stub** — never claiming a lineage is free; un-claiming one is an identity event.

**Census source:** explore.startups.studio `app/_lib/canon/grammar.data.ts` `NODE_TYPES` (~60 registered node types, read 2026-07-19).

**Event-layer context (analysis input, not authority):** stack vault `specs/drivly-rebuild/W0-EVT.md` (frozen 2026-07-19). Its lens doctrine informs the Action-adjacent PROPOSED rows: `schema:Action` is a legal *rendering* of past events — a lens, never a lineage. The ratified Task lineage veto (work-to-be-done is not a performed `schema:Action`) is the canon anchor; extending the veto across the whole verb-conjugation manifold is part of the PROPOSED analysis below, not yet ruled.

---

## 1 — RATIFIED rows (already ruled; citations on each row)

Implemented in this PR where marked ⚙; rows without ⚙ are ratified rulings whose class emission (if any) rides a follow-up census PR.

| Noun | Verdict | Branch | External counterpart | Authority (citation) |
|---|---|---|---|---|
| Person | BORROW | Q1 | `https://schema.org/Person` | **RATIFIED** — ADR 0002 R3 borrow exemplar; ADR 0004 Q1 exemplar + second application ("Person remains a Q1 borrow") ⚙ |
| Company | EXTENSION | Q2 | `subClassOf schema:Organization` | **RATIFIED** — [#11 approval 2](https://github.com/dot-org-ai/org.ai/issues/11#issuecomment-5013244753): "Company = extension (subClassOf schema:Organization, per the R3 exemplar)"; ADR 0004 Q2 ⚙ |
| Team | EXTENSION | Q2 | `subClassOf schema:Organization` | **RATIFIED** — ADR 0002 R3 third ruling; ADR 0004 Q2 exemplar ⚙ |
| Product | EXTENSION | Q2 | `subClassOf schema:Product` | **RATIFIED** — [#11 approval 2](https://github.com/dot-org-ai/org.ai/issues/11#issuecomment-5013244753): "Product, Service, Offer = extension (subClassOf schema:Product / schema:Service / schema:Offer)"; ADR 0004 Q2 cites F5. Lumber category-grain tolerated (ADR 0004: grain diverges, nothing false) ⚙ |
| Service | EXTENSION | Q2 | `subClassOf schema:Service` | **RATIFIED** — same #11 approval 2 + ADR 0004 Q2 (F5) ⚙ |
| Offer | EXTENSION | Q2 | `subClassOf schema:Offer` | **RATIFIED** — same #11 approval 2 + ADR 0004 Q2 (F5) ⚙ |
| Human | EXTENSION | Q2 | `subClassOf schema:Person` | **RATIFIED** — ADR 0004 second application (Q1 fails: attestation, id.org.ai identity, worker-loop homeless on civil-web Person; Q2 passes, no veto). Class emission queued for the census follow-up — not yet in this PR's profile |
| Task | NATIVE | Q2-veto → Q4 | — (veto vs `schema:Action`) | **RATIFIED** — ADR 0002 R3 first ruling; ADR 0004 lineage veto ("work-to-be-done is not a performed schema:Action; Task is native") ⚙ |
| Role | NATIVE + shadow | Q3 | shadows `schema:Role` (reified edge-qualifier — false friend) | **RATIFIED** — ADR 0002 R3 second ruling; ADR 0004 Q3 exemplar ⚙ |
| Event | NATIVE + shadow | Q3 +R17-seam | shadows `schema:Event`; seam-mapped to GS1 EPCIS 2.0 | **RATIFIED** — ADR 0004 first application (the precedent-setter: exercises every branch) ⚙ |
| Agent | NATIVE | Q4 | — (schema.org defines no Agent) | **RATIFIED** — ADR 0002 R3 native exemplar; ADR 0004 second application corollary ⚙ |
| Startup | NATIVE | Q4 | — | **RATIFIED** — ADR 0002 R3 native exemplar (also live atlas emission cited in its ground truth) ⚙ |
| ICP, JTBD, Hypothesis, Idea | NATIVE | Q4 | — | **RATIFIED** — ADR 0002 R3 native exemplars ⚙ |
| Worker | NATIVE | Q4 | — | **RATIFIED** — ADR 0002 R3 native exemplar; ADR 0004 second application ("Worker (admitted flagship native)") ⚙ |
| Capability | NATIVE | Q4 | — | **RATIFIED** — ADR 0002 R3 native exemplar. ⚠ The atlas census marks Capability a deleted-Noun tombstone (reified as `bears`/`realizedBy`) — that conflict with merged ADR 0002 needs a Nathan ruling before any demotion here; see §4 ⚙ |
| Problem | NATIVE | Q4 | — | **RATIFIED** — [#11 approval 3](https://github.com/dot-org-ai/org.ai/issues/11#issuecomment-5013244753): "Problem, Thesis → native now (recurrence-proven, live-emitted)" ⚙ |
| Thesis | NATIVE (+ mechanical shadow) | Q3 | shadows `schema:Thesis` (dissertation document — false friend) | **RATIFIED** (native) — same #11 approval 3. The shadow marker is the mechanical consequence of ADR 0004 Q3 once the native admission exists (bare name collides); no bucket change ⚙ |
| Opportunity, Market | OVERLAY-FIRST | — (bucket TBD at graduation) | — | **RATIFIED** — [#11 approval 3](https://github.com/dot-org-ai/org.ai/issues/11#issuecomment-5013244753): "Opportunity, Market → overlay-first (once demoted in-monorepo per ADR 0057 = negative fixation evidence; graduate per R5)". Demoted to the startups.studio overlay in this PR ⚙ |
| Business | NOT ADMITTED | — | — | **RATIFIED** — [#11 approval 2](https://github.com/dot-org-ai/org.ai/issues/11#issuecomment-5013244753): "Business = not admitted (Company carries the referent; 'business' stays the Register-1 thesis word)" ⚙ |

---

## 2 — PROPOSED rows: tree run, CONFIDENT, awaiting ratification

Every row in this section is **PROPOSED**. The tree resolves mechanically in the analyst's judgment, but none of these admissions has been ruled by merged canon or an explicit #11 approval — they await batch ratification per ADR 0004's consequence ("the maintainer's role shrinks to ratifying disposition tables"). **None is emitted by this PR's generated context.** Pre-ruling states: Industry, CompanyType, JobType, Department, Process remain repo-baseline natives (pre-PR `extensions.jsonld`); Occupation, Action, Place remain blessed borrows; everything else is omitted until ruled.

### 2a — O\*NET / standards work-spine (atlas "G1")

| Noun | Proposed verdict | Branch | External counterpart | Evidence (one line) | Authority |
|---|---|---|---|---|---|
| Industry | NATIVE | Q4 +R17-seam | — (`schema:naics` is a property, not a class) | schema.org has no Industry class; NAICS codes ride as identifiers at the seam, never as lineage. (Repo-baseline native today.) | PROPOSED |
| Occupation | EXTENSION | Q2 | `schema:Occupation` | Q1 fails (O\*NET descriptor tail + work-spine edges homeless); every SOC occupation is truthfully a `schema:Occupation` — schema.org itself points `occupationalCategory` at O\*NET-SOC. (Held as borrow until ruled.) | PROPOSED |
| Activity | NATIVE + shadow | Q3 (+ Q2-veto cited) | shadows `as:Activity` (ActivityStreams) | Occurrent in flight ("creating"), not performed — `schema:Action` lineage vetoed a fortiori of Task; as:Activity is a social-feed record — same name, different referent. (Omitted until ruled.) | PROPOSED |
| Process | NATIVE | Q2-veto → Q4 | — (veto vs `schema:HowTo`) | An APQC PCF process category is neither an instruction document nor a performed Action. (Repo-baseline native today.) | PROPOSED |
| Skill | NATIVE | Q4 | — (`schema:skills` is a text property; ESCO Skill = seam candidate) | No schema.org Skill class; ESCO integrates by `sameAs` at the seam if ever needed. (Omitted until ruled.) | PROPOSED |
| Knowledge | NATIVE | Q4 | — | O\*NET knowledge-domain descriptor; schema.org offers only `knowsAbout`. (Omitted until ruled.) | PROPOSED |
| Ability | NATIVE | Q4 | — | O\*NET ability descriptor; no external class shares name or referent. (Omitted until ruled.) | PROPOSED |
| WorkContext | NATIVE | Q4 | — | O\*NET work-context descriptor; no counterpart. (Omitted until ruled.) | PROPOSED |
| WorkStyle | NATIVE | Q4 | — | O\*NET work-style descriptor; no counterpart. (Omitted until ruled.) | PROPOSED |
| WorkValue | NATIVE | Q4 | — | O\*NET work-value descriptor; no counterpart. (Omitted until ruled.) | PROPOSED |
| Interest | NATIVE | Q4 | — | O\*NET RIASEC interest descriptor; no schema.org Interest class. (Omitted until ruled.) | PROPOSED |
| JobZone | NATIVE | Q4 | — | O\*NET job-zone preparation tier; O\*NET-only concept. (Omitted until ruled.) | PROPOSED |
| Education | NATIVE | Q4 | — (distinct from `schema:EducationalOccupationalCredential`) | Our Education is the O\*NET required-education level category, not an awarded credential. (Omitted until ruled.) | PROPOSED |
| Metric | NATIVE | Q4 | — (`schema:StatisticalVariable` = seam candidate, not collision) | APQC OSB measure definition; no schema class named Metric. (Omitted until ruled.) | PROPOSED |
| MetricCategory | NATIVE | Q4 | — | APQC OSB metric-category tier; standard-internal. (Omitted until ruled.) | PROPOSED |

*(Place — atlas G1 — is deliberately pulled into the NEEDS-NATHAN triangle, §3.)*

### 2b — Derived archetypes (atlas "G2-core")

| Noun | Proposed verdict | Branch | External counterpart | Evidence (one line) | Authority |
|---|---|---|---|---|---|
| CompanyType | NATIVE | Q4 | — | A firm archetype ("Dental Practice") is a category of organizations, not an organization; no metaclass in schema.org. (Repo-baseline native today.) | PROPOSED |
| JobType | NATIVE | Q4 | — (`schema:JobPosting` is the ad, not the role archetype) | The G2 role archetype; relates to ruled-native Role. (Repo-baseline native today.) | PROPOSED |
| Department | NATIVE | Q4 | — (`schema:department` is a property) | A department archetype ("Marketing") across firms is a category; Organization lineage would be metaclass falsity. (Repo-baseline native today.) | PROPOSED |

### 2c — Digital / GS1 tail (atlas "G2-tail")

| Noun | Proposed verdict | Branch | External counterpart | Evidence (one line) | Authority |
|---|---|---|---|---|---|
| Action | NATIVE + shadow | Q3 +R17-seam | shadows `schema:Action` | The verb manifold's **action** form — the standing capability a Software exposes; `schema:Action` (performed/potential act) is a false friend; the legal seam is on Event (completed events render as performed Actions). ⚠ Ruling this row also touches ADR 0008's deferred naming lock. (Held as borrow until ruled.) | PROPOSED |
| DataNoun | NATIVE | Q4 | — | A metaclass (the Lead/Contact/Order/Invoice SVO Objects an Action `operatesOn`); individual data-nouns may seam to schema.org kin per instance. (Omitted until ruled.) | PROPOSED |
| Software | EXTENSION | Q2 | `subClassOf schema:SoftwareApplication` | Every ingested Software node is truthfully a software application; shape adds exposes → Action, operatesOn → DataNoun. (Omitted until ruled.) | PROPOSED |
| Credential | EXTENSION | Q2 | `subClassOf schema:EducationalOccupationalCredential` | Occupational licenses/certifications are truthfully E.O.C.s; adds issuedBy → Regulator, requiredFor → JobType. (Omitted until ruled.) | PROPOSED |
| Regulator | EXTENSION | Q2 | `subClassOf schema:Organization` (NOT GovernmentOrganization) | Seed prompt names FINRA, SROs, ISO TCs — one SRO falsifies GovernmentOrganization lineage (veto); every regulator is truthfully an Organization. (Omitted until ruled.) | PROPOSED |
| Formula | NATIVE | Q4 | — (alias `Recipe` = false friend of `schema:Recipe`) | An industrial formulation is not a food recipe; if the Recipe alias survives it shadows per Q3. (Omitted until ruled.) | PROPOSED |
| Shipment | NATIVE | Q4 +R17-seam | — (seam: EPCIS aggregation `parentID`; `schema:ParcelDelivery` is a different name + consumer register) | GS1's sense aligns → seam, not bucket. (Omitted until ruled.) | PROPOSED |
| CapitalEquipment | NATIVE | Q4 | — (alias `Asset`; schema.org has no Asset class) | No external counterpart claims name or referent. (Omitted until ruled.) | PROPOSED |
| Country | BORROW | Q1 | `schema:Country` | ISO 3166-1 countries merge truth-preservingly; legal-structure edges live on Jurisdiction (§3). (Omitted until ruled — not in the blessed borrowSeed yet.) | PROPOSED |
| Subdivision | EXTENSION | Q2 | `subClassOf schema:AdministrativeArea` (`schema:State` too narrow) | Every ISO 3166-2 subdivision is truthfully an AdministrativeArea; State lineage false for municipalities/dependencies. (Omitted until ruled.) | PROPOSED |
| Regulation | NATIVE | Q2-veto → Q4, stub | — (statutory instances seam to `schema:Legislation` by `sameAs`) | One private rulebook (ISO standard, PCI-DSS-shaped) falsifies Legislation lineage; claiming later is free. (Omitted until ruled.) | PROPOSED |

*(Event, Company, Product, Service, Offer sit in §1 — ruled. Document, Dataset, Model sit in §3.)*

### 2d — ICP tuple-component axes (ADR 0047 §1)

| Noun | Proposed verdict | Branch | External counterpart | Evidence (one line) | Authority |
|---|---|---|---|---|---|
| CompanySize | overlay-first | — (Q4 if/when graduated) | — (`schema:numberOfEmployees` is a property) | The ICP axis shape is still moving (agent-row axes arriving via the kestrel → headless.ly binder pair; #11 2026-07-19 comment). The Opportunity/Market overlay-first precedent is the route authority, but **these five axes were not named in that ruling** — proposed, not ruled. (Omitted from base until ruled.) | PROPOSED |
| OperationalModel | overlay-first | — | — | Same batch proposal as CompanySize. | PROPOSED |
| DecisionStructure | overlay-first | — | — | Same batch proposal. | PROPOSED |
| EconomicBuyerRole | overlay-first | — | — | Same batch proposal. | PROPOSED |
| Stage | overlay-first | — | — | Same batch proposal. | PROPOSED |

### 2e — Greenfield legal spine (PRD #578) — Country, Subdivision, Regulation proposed in §2c; Jurisdiction in §3

---

## 3 — NEEDS-NATHAN rows (ruling stubs; each ships the conservative branch until ruled) — all PROPOSED

| Noun | Provisional verdict | Branch | External counterpart | Evidence / the open question | Authority |
|---|---|---|---|---|---|
| Document | NATIVE (conservative) | Q4 + stub | `schema:DigitalDocument` / `schema:CreativeWork` candidates | Record-vs-instrument referent call (wet-ink paper title falsifies DigitalDocument lineage) is the maintainer's, not the tree's. (Omitted until ruled.) | PROPOSED |
| Model | NATIVE (conservative) | Q4 + stub | — (no bare `schema:Model`; `3DModel` different name) | The atlas alias set gives no discriminator (ML/data/product model) — veto by indeterminacy. ⚠ Reconciliation: the repo-baseline native `schema.org.ai/Model` is the *AI model* sense (LLM/checkpoint) and remains at baseline; the atlas census "Model" referent question is this stub. | PROPOSED |
| Dataset | BORROW (provisional) | Q1 + stub | `schema:Dataset` | The `DataAsset` alias may widen the referent to commercial data products, pulling toward Q2 — a one-way door worth the maintainer's eyes. (Omitted until ruled.) | PROPOSED |
| Place | EXTENSION (provisional) | Q2 vs Q3 + stub | `schema:Place` | Category grain over instance grain (Lumber precedent) makes Q2 arguable, but the row cannot be ruled alone — one corner of the Place/Location/Jurisdiction triangle. (Held as borrow until ruled.) | PROPOSED |
| Location | not-yet-admitted (candidate) | stub | collides with `schema:Place` (schema.org has no Location class) | EPCIS readPoint (where observed) vs bizLocation (where it is) are different senses; one noun or two, and who shadows whom, is the ruling. (Omitted until ruled.) | PROPOSED |
| Jurisdiction | NATIVE (conservative) | Q4 + stub | `schema:AdministrativeArea` is the extension candidate | Subject-matter jurisdictions (a regulator's mandate scope) falsify territorial lineage (veto risk); must be ruled with the triangle. (Omitted until ruled.) | PROPOSED |

**The Place/Location/Jurisdiction triangle should be ruled as a set** (one grill session), with the EPCIS where-observed/where-it-is distinction as the forcing example: a receiving event's `source` is a readPoint; the shipment's `bizLocation` is where it now sits; the FDA's jurisdiction is neither.

---

## 4 — Non-admissions of atlas node-types (PROPOSED except Business)

Listed per the census for completeness. **Only Business is ruled** (§1: NOT ADMITTED, #11 approval 2 — the one name a builder will reach for that must resolve to Company). The rest are the analyst's mapping of atlas-canon (explore.startups.studio ADRs) onto the vocabulary — org.ai canon has NOT ruled them, so they are PROPOSED and change nothing in this PR:

- **Frame-alias / reverse-rel junctions (9)** — `Customers`, `Suppliers`, `Partners`, `Competitors`, `Channels`, `Resources`, `Employers`, `Buyers`, + the `ICPs` junction slug: predicate-rendering surfaces, proposed derive-from-lemma-table at grammar graduation (Phase C), not admitted as classes. *Reconciliation note:* the atlas `ICPs` slug is the junction Dimension; the ruled-native **ICP** class (§1) types instances. — PROPOSED
- **Infra axes (2)** — `Verb`, `Locale`: machinery of the grammar. **Verb-class admission is explicitly deferred by ratified org.ai ADR 0008** ("the naming lock happens once, at Verb-class admission… No document may fixate Verb-class field names before Nathan's explicit lock") — so Verb non-admission *today* is the ratified state, and its future admission is the ADR 0008 trigger event. Locale: PROPOSED
- **Tombstones (2)** — `Tool` (atlas ADR 0065: the `usesTool` edge, not a Noun) and `Capability` (atlas: reified as `bears`/`realizedBy`). ⚠ **Conflict flag:** merged org.ai ADR 0002 R3 lists **Capability as a native exemplar**, and both Tool and Capability are pre-existing repo-baseline natives here (the AI-vocabulary senses: function-calling tool; agent capability). Demoting either requires a Nathan ruling reconciling atlas canon with ADR 0002; until then the baseline natives stand. — PROPOSED

---

## 5 — The PROPOSED admission queue (asks to Nathan; nothing here is enacted by this PR)

1. Ratify §2 (34 CONFIDENT proposed rows: 15 work-spine, 3 archetypes, 12 digital/GS1 tail, 5 overlay-first axes) — batch review per ADR 0004's consequence.
2. Rule the six §3 stubs — Document, Model, Dataset, and the Place/Location/Jurisdiction triangle (the triangle as one session).
3. Rule the §4 conflicts: Tool and Capability (atlas tombstone vs ADR 0002 R3 Capability-native exemplar / repo-baseline natives).

Every extension proposed here composes with R17: external identifiers (NAICS, ISO 3166, GS1 keys, ELI URIs) ride as identifiers at seams regardless of bucket. Shadow machinery ships in this PR (structural `schemaai:shadows` marker; Role/Event/Thesis are the shipped shadows); the new Q3 proposals (Activity, Action, the Formula/Recipe alias) reuse it on ratification — their terms enter CONTEXT.md in the PR that ships them (ground rule 2).
