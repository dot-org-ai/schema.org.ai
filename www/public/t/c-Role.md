# Role

Ours. schema.org defines this name too, meaning something else.

    https://schema.org.ai/Role

A job role definition: a named position/function with required skills, responsibilities, permissions, tool grants, delegation/approval/escalation edges, and a preferred worker type (agent or human). NATIVE and SHADOWS per the ADR 0002 R3 bucket ruling: schema.org/Role is a reified edge-qualifier — a different concept sharing the name. The context term Role maps here; schema.org's Role stays reachable by full IRI.

*The definition this document carries.*

- Shadows: https://schema.org/Role

## How to write it

```json
{
  "@context": "https://schema.org.ai",
  "$id": "https://example.com/role/1",
  "$type": "Role",
  "schema:name": "Role"
}
```

```yaml
'@context': https://schema.org.ai
$id: https://example.com/role/1
$type: Role
schema:name: Role
```

```mdx
---
$context: https://schema.org.ai
$id: https://example.com/role/1
$type: Role
schema:name: Role
---
```

The Org.AI Foundation · schema.org.ai · For machines: /llms.txt
