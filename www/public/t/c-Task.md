# Task

Ours. schema.org does not define this name.

    https://schema.org.ai/Task

A granular unit of work — typically an O*NET task statement or comparable imperative work action. The typed unit of work itself, addressable as canonical reference. NATIVE per the ADR 0002 R3 bucket ruling: deliberately no subClassOf schema:Action — schema.org's Action means performed events; claiming its lineage for work-to-be-done would be a semantic error.

*The definition this document carries.*

- Kind of:
  Deliberately no subClassOf schema:Action — schema.org's Action means performed events; claiming its lineage for work-to-be-done would be a semantic error.

## How to write it

```json
{
  "@context": "https://schema.org.ai",
  "$id": "https://example.com/task/1",
  "$type": "Task",
  "schema:name": "Task"
}
```

```yaml
'@context': https://schema.org.ai
$id: https://example.com/task/1
$type: Task
schema:name: Task
```

```mdx
---
$context: https://schema.org.ai
$id: https://example.com/task/1
$type: Task
schema:name: Task
---
```

The Org.AI Foundation · schema.org.ai · For machines: /llms.txt
