# Team

Ours, and a kind of schema.org’s.

    https://schema.org.ai/Team

A team: a named group of workers (agents and humans) with members, an optional lead, goals, and communication channels. ADMITTED EXTENSION per the ADR 0002 R3 bucket ruling: subClassOf schema:Organization — schema.org has no generic Team; crawlers walking the subclass edge still understand the parent type.

*The definition this document carries.*

- Kind of: https://schema.org/Organization

## How to write it

```json
{
  "@context": "https://schema.org.ai",
  "$id": "https://example.com/team/1",
  "$type": "Team",
  "schema:name": "Team"
}
```

```yaml
'@context': https://schema.org.ai
$id: https://example.com/team/1
$type: Team
schema:name: Team
```

```mdx
---
$context: https://schema.org.ai
$id: https://example.com/team/1
$type: Team
schema:name: Team
---
```

The Org.AI Foundation · schema.org.ai · For machines: /llms.txt
