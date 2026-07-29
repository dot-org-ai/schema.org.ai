# Worker

Ours. schema.org does not define this name.

    https://schema.org.ai/Worker

The base work-executor type over the agent/human duality: Worker { type: 'agent' | 'human' } with status, capabilities, and current task. Agents and humans are Workers; the interface is uniform (notify/ask/approve/decide/do).

*The definition this document carries.*

- Kind of: https://schema.org/Thing

## How to write it

```json
{
  "@context": "https://schema.org.ai",
  "$id": "https://example.com/worker/1",
  "$type": "Worker",
  "schema:name": "Worker"
}
```

```yaml
'@context': https://schema.org.ai
$id: https://example.com/worker/1
$type: Worker
schema:name: Worker
```

```mdx
---
$context: https://schema.org.ai
$id: https://example.com/worker/1
$type: Worker
schema:name: Worker
---
```

The Org.AI Foundation · schema.org.ai · For machines: /llms.txt
