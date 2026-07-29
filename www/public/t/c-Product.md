# Product

Ours, and a kind of schema.org’s.

    https://schema.org.ai/Product

A product the platform's businesses make, sell, or use — spanning instance-grain products and the UNSPSC-seeded product-category taxonomy. ADMITTED EXTENSION per Nathan's F5 ruling (org.ai#11, 2026-07-18): 'Product, Service, Offer = extension (subClassOf schema:Product / schema:Service / schema:Offer)' — org.ai ADR 0004 Q2; category grain tolerated (grain diverges, nothing false).

*The definition this document carries.*

- Kind of: https://schema.org/Product

## How to write it

```json
{
  "@context": "https://schema.org.ai",
  "$id": "https://example.com/product/1",
  "$type": "Product",
  "schema:name": "Product"
}
```

```yaml
'@context': https://schema.org.ai
$id: https://example.com/product/1
$type: Product
schema:name: Product
```

```mdx
---
$context: https://schema.org.ai
$id: https://example.com/product/1
$type: Product
schema:name: Product
---
```

The Org.AI Foundation · schema.org.ai · For machines: /llms.txt
