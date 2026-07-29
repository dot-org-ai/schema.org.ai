# Event

Ours. schema.org defines this name too, meaning something else.

    https://schema.org.ai/Event

A business occurrence: the immutable, past-tense record that something happened, carrying What/Who/When/Where/Why/How dimensions. NATIVE, SHADOWING schema.org/Event, and SEAM-MAPPED to GS1 EPCIS 2.0 per org.ai ADR 0004 (first application): Q1 fails (merging occurrence records into concert listings is meaning-destroying), Q2 lineage veto (an EPCIS-shaped receiving event is not truthfully a schema:Event, so NO subClassOf edge), Q3 shadow (bare term binds here; schema.org/Event stays one full IRI away), and EPCIS integrates per R17 as a protocol seam.

*The definition this document carries.*

- Shadows: https://schema.org/Event

## How to write it

```json
{
  "@context": "https://schema.org.ai",
  "$id": "https://example.com/event/1",
  "$type": "Event",
  "schema:name": "Event"
}
```

```yaml
'@context': https://schema.org.ai
$id: https://example.com/event/1
$type: Event
schema:name: Event
```

```mdx
---
$context: https://schema.org.ai
$id: https://example.com/event/1
$type: Event
schema:name: Event
---
```

The Org.AI Foundation · schema.org.ai · For machines: /llms.txt
