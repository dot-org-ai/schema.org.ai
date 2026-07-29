# model

Ours. A property, not a type.

    https://schema.org.ai/model

The AI model(s) that power this Agent or Generation.

*The definition this document carries.*

- Used on: https://schema.org.ai/Agent, https://schema.org.ai/Generation
- Takes: https://schema.org.ai/Model

## How to write it

```json
{
  "@context": "https://schema.org.ai",
  "$id": "https://example.com/agent/1",
  "$type": "Agent",
  "schema:name": "Agent",
  "model": "https://example.com/model/1"
}
```

```yaml
'@context': https://schema.org.ai
$id: https://example.com/agent/1
$type: Agent
schema:name: Agent
model: https://example.com/model/1
```

```mdx
---
$context: https://schema.org.ai
$id: https://example.com/agent/1
$type: Agent
schema:name: Agent
model: https://example.com/model/1
---
```

The Org.AI Foundation · schema.org.ai · For machines: /llms.txt
