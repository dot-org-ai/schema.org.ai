

# SatiricalArticle

An Article whose content is primarily satirical(https://en.wikipedia.org/wiki/Satire) in nature, i.e. unlikely to be literally true. A satirical article is sometimes but not necessarily also a NewsArticle. ScholarlyArticles are also sometimes satirized.

## Type Hierarchy

[Thing](Thing.mdx) > [CreativeWork](CreativeWork.mdx) > [Article](Article.mdx) > **SatiricalArticle**



## Properties

See [Schema.org SatiricalArticle properties](https://schema.org/SatiricalArticle#properties)

## Usage in Business-as-Code

```typescript
import { $ } from 'sdk.do'
import type { SatiricalArticle } from 'schema.org.ai'

// Create a SatiricalArticle
const item: SatiricalArticle = {
  $type: 'SatiricalArticle',
  name: 'Example SatiricalArticle'
}

// Use semantic patterns
await $.SatiricalArticle.create(item)
const result = await $.SatiricalArticle.get('item-id')
```

## Resources

- [Schema.org SatiricalArticle](https://schema.org/SatiricalArticle)
- [SatiricalArticle Properties](https://schema.org/SatiricalArticle#properties)

## License

This documentation is based on Schema.org vocabulary, which is licensed under Creative Commons Attribution-ShareAlike License (version 3.0).
