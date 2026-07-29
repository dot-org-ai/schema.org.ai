# The Org.AI Foundation · Schema

Everything schema.org defines keeps schema.org's meaning. Our additions sit above it,
at one address that will never carry a version number.

This address defines 64 terms and nothing else. A term it does not define,
including bare `name` and `description`, is dropped rather than guessed at. Write
`schema:name`.

- In the profile: 64 terms · 45 ours · 19 schema.org's
- Same name, our meaning: Event · Role · Thesis
- Who is using it: Not counted.

## The one address

    https://schema.org.ai

| Accept | Representation |
| --- | --- |
| `application/ld+json` | the context document |
| `text/html` | the human page |
| `text/markdown` | this document |

`$id` is `@id`. `$type` is `@type`. `$context` has no alias and never will: JSON-LD says
the keyword must not be aliased. A document carrying `$context` is definitionally MDXLD,
not JSON-LD. That asymmetry is the format boundary, not a bug.

## Ours — 31 types

- `API` https://schema.org.ai/API
  An API endpoint (REST, RPC, GraphQL) that provides programmatic access to services.
- `Agent` https://schema.org.ai/Agent
  An autonomous AI agent that can perform actions, use tools, and make decisions to accomplish goals.
- `CLI` https://schema.org.ai/CLI
  A Command-Line Interface tool for interacting with services from the terminal.
- `Capability` https://schema.org.ai/Capability
  A capability or skill that an Agent possesses, defining what actions it can perform.
- `CompanyType` https://schema.org.ai/CompanyType
  A company archetype derived from Industry × business model × regulatory regime.
- `Department` https://schema.org.ai/Department
  A functional department within a CompanyType (e.g. Tax, Audit, Engineering).
- `DigitalProperty` https://schema.org.ai/DigitalProperty
  A digital property — a website, app, API, deployed agent, or any addressable entity with a stable digital presence.
- `Event` https://schema.org.ai/Event
  A business occurrence: the immutable, past-tense record that something happened, carrying What/Who/When/Where/Why/How dimensions.
  schema.org uses this name too. Its sense is at https://schema.org/Event.
- `Generation` https://schema.org.ai/Generation
  An AI generation instance, representing output produced by a Model or Agent.
- `Hypothesis` https://schema.org.ai/Hypothesis
  A testable assumption with evidence collection: a statement, the metric it moves, a target value, testing status, and collected evidence — the validation unit behind an Idea.
- `ICP` https://schema.org.ai/ICP
  An Ideal Customer Profile in the as/at/are/using/to framework: who they are (as), where they work (at), their current situation (are), what they use today (using), and the outcome they want (to).
- `Idea` https://schema.org.ai/Idea
  A business concept with a name, an elevator pitch, and a lifecycle status, validated through Hypotheses on its way to becoming a Startup.
- `Industry` https://schema.org.ai/Industry
  An industry classification (e.g. NAICS-coded sector of economic activity).
- `InvestmentThesis` https://schema.org.ai/InvestmentThesis
  An investment or strategic thesis — a structured argument for a particular approach to building (e.g. Service-as-Software, Agent, Headless SaaS).
- `JTBD` https://schema.org.ai/JTBD
  A Job To Be Done in the When/I-want/So-I-can pattern: situation, motivation, outcome — optionally scored on functional, emotional, and social dimensions with priority and frequency.
- `JobType` https://schema.org.ai/JobType
  A job-type archetype — a specific role within a CompanyType.
- `LandingPage` https://schema.org.ai/LandingPage
  A conversion-optimized marketing landing page with hero, features, testimonials, and CTA sections.
- `MCP` https://schema.org.ai/MCP
  A Model Context Protocol server that exposes tools and resources to AI models.
- `Model` https://schema.org.ai/Model
  An AI/ML model that powers an Agent or provides inference capabilities.
- `Problem` https://schema.org.ai/Problem
  A canonical Problem — pain exposed by a sufficiently-pinned Ideal Customer Profile.
- `Process` https://schema.org.ai/Process
  A cross-functional business process — typically an APQC-coded multi-step operation (e.g. Manage Accounts Payable, Onboard New Customer).
- `Prompt` https://schema.org.ai/Prompt
  A prompt or prompt template used to instruct an AI model or Agent.
- `Role` https://schema.org.ai/Role
  A job role definition: a named position/function with required skills, responsibilities, permissions, tool grants, delegation/approval/escalation edges, and a preferred worker type (agent or human).
  schema.org uses this name too. Its sense is at https://schema.org/Role.
- `SDK` https://schema.org.ai/SDK
  A Software Development Kit package that provides programmatic access to a platform or service.
- `Startup` https://schema.org.ai/Startup
  A startup company threading the lifecycle stages idea → validating → building → scaling → established, with pitch, industry, and its ICPs.
- `Task` https://schema.org.ai/Task
  A granular unit of work — typically an O*NET task statement or comparable imperative work action.
- `Thesis` https://schema.org.ai/Thesis
  The strategic bet a startup is founded on — the cascade's thesis noun (Service-as-Software, Agent, Headless SaaS are canonical theses).
  schema.org uses this name too. Its sense is at https://schema.org/Thesis.
- `Tool` https://schema.org.ai/Tool
  A tool that can be used by an Agent to perform actions.
- `Webhook` https://schema.org.ai/Webhook
  A webhook endpoint that receives event-driven notifications.
- `Worker` https://schema.org.ai/Worker
  The base work-executor type over the agent/human duality: Worker { type: 'agent' | 'human' } with status, capabilities, and current task.
- `Workflow` https://schema.org.ai/Workflow
  An autonomous workflow definition that specifies a sequence of actions to be performed by Agents.

## Ours — 9 properties

- `capability` https://schema.org.ai/capability
  A capability or skill that this Agent possesses.
  On Agent. Takes Capability.
- `digital` https://schema.org.ai/digital
  Digital maturity score from 0.0 (fully analog/manual) to 1.0 (fully digital/autonomous).
  On Thing. Takes Number.
- `goal` https://schema.org.ai/goal
  The goal or objective that this Agent is trying to achieve.
  On Agent. Takes Text or Thing.
- `model` https://schema.org.ai/model
  The AI model(s) that power this Agent or Generation.
  On Agent and Generation. Takes Model.
- `prompt` https://schema.org.ai/prompt
  The prompt used to generate this output.
  On Generation. Takes Prompt.
- `temperature` https://schema.org.ai/temperature
  The temperature parameter used for AI generation (0.0-2.0).
  On Generation. Takes Number.
- `tokens` https://schema.org.ai/tokens
  The number of tokens used or generated.
  On Generation. Takes Integer.
- `tool` https://schema.org.ai/tool
  A tool available to this Agent for performing actions.
  On Agent. Takes Tool.
- `workflow` https://schema.org.ai/workflow
  A workflow that this Agent can execute.
  On Agent. Takes Workflow.

## Ours over theirs — 5

- `Company` https://schema.org.ai/Company
  A concrete firm: an organization that operates in an Industry, instantiates a CompanyType archetype, employs workers, and buys and sells.
  A kind of https://schema.org/Organization.
- `Offer` https://schema.org.ai/Offer
  An offer a platform business makes: the packaged promise — what is delivered, to whom (ICP coordinates), how, and on what pricing structure.
  A kind of https://schema.org/Offer.
- `Product` https://schema.org.ai/Product
  A product the platform's businesses make, sell, or use — spanning instance-grain products and the UNSPSC-seeded product-category taxonomy.
  A kind of https://schema.org/Product.
- `Service` https://schema.org.ai/Service
  A service a platform business provides — including services-as-software (services delivered by agents with software economics).
  A kind of https://schema.org/Service.
- `Team` https://schema.org.ai/Team
  A team: a named group of workers (agents and humans) with members, an optional lead, goals, and communication channels.
  A kind of https://schema.org/Organization.

## Theirs, unchanged — 19

- `Action` https://schema.org/Action
  An action performed by a direct agent and indirect participants upon a direct object.
- `Article` https://schema.org/Article
  An article, such as a news article or piece of investigative report.
- `BlogPosting` https://schema.org/BlogPosting
  A blog post.
- `CreativeWork` https://schema.org/CreativeWork
  The most generic kind of creative work, including books, movies, photographs, software programs, etc.
- `HowTo` https://schema.org/HowTo
  Instructions that explain how to achieve a result by performing a sequence of steps.
- `ImageObject` https://schema.org/ImageObject
  An image file.
- `Intangible` https://schema.org/Intangible
  (this host holds no copy of schema.org's definition for this name)
- `Integer` https://schema.org/Integer
  Data type: Integer.
- `Number` https://schema.org/Number
  (this host holds no copy of schema.org's definition for this name)
- `Occupation` https://schema.org/Occupation
  A profession, may involve prolonged training and/or a formal qualification.
- `Organization` https://schema.org/Organization
  An organization such as a school, NGO, corporation, club, etc.
- `Person` https://schema.org/Person
  A person (alive, dead, undead, or fictional).
- `Place` https://schema.org/Place
  Entities that have a somewhat fixed, physical extension.
- `SoftwareApplication` https://schema.org/SoftwareApplication
  A software application.
- `Text` https://schema.org/Text
  Data type: Text.
- `Thing` https://schema.org/Thing
  The most generic type of item.
- `WebAPI` https://schema.org/WebAPI
  An application programming interface accessible over Web/Internet technologies.
- `WebPage` https://schema.org/WebPage
  A web page.
- `WebSite` https://schema.org/WebSite
  A WebSite is a set of related web pages and other items typically served from a single web domain and accessible via URLs.

## One name we refused

- `Business` — no address here, and it never had one. Ruled out at admission.
  A builder reaching for Business types Company.

## If you need more

schema.org does not move. schema.org.ai moves slowly. A venue moves fast, and what it
adds are leases. One venue overlay exists and this host serves it at
/overlays/startups.studio/context.jsonld. Its own address, https://startups.studio,
is not ours to serve.

## Three ways to write it

```json
{
  "@context": "https://schema.org.ai",
  "$id": "https://example.com/agents/cody",
  "$type": "Agent",
  "schema:name": "Cody",
  "goal": "Triage inbound support mail"
}
```

```yaml
'@context': https://schema.org.ai
$id: https://example.com/agents/cody
$type: Agent
schema:name: Cody
goal: Triage inbound support mail
```

```mdx
---
$context: https://schema.org.ai
$id: https://example.com/agents/cody
$type: Agent
schema:name: Cody
goal: Triage inbound support mail
---
```

`$context` becomes `@context`, once, at the top of the file. `$id` and `$type` are
aliases this address declares. `schema:name` is a prefix this address declares. `name`
is not defined here.

---

Sixty-four terms, counted from the document this address serves on 29 July 2026. Some rulings have been made that this document does not yet carry. The document is the profile, and what it carries is what this page shows. No release snapshot has been cut, so there is nothing to pin to by choice yet.

Served here: /context.jsonld · /profile.json · /overlays/startups.studio/context.jsonld
The Org.AI Foundation · schema.org.ai · For machines: /llms.txt
