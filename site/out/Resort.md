

# Resort

A resort is a place used for relaxation or recreation, attracting visitors for holidays or vacations. Resorts are places, towns or sometimes commercial establishments operated by a single company (source: Wikipedia, the free encyclopedia, see http://en.wikipedia.org/wiki/Resort). 

 See also the dedicated document on the use of schema.org for marking up hotels and other forms of accommodations.

## Type Hierarchy

[Thing](Thing.mdx) > [Place](Place.mdx) > [LocalBusiness](LocalBusiness.mdx) > [LodgingBusiness](LodgingBusiness.mdx) > **Resort**

## Direct Subclasses

- **[SkiResort](SkiResort.mdx)**: A ski resort

## Properties

See [Schema.org Resort properties](https://schema.org/Resort#properties)

## Usage in Business-as-Code

```typescript
import { $ } from 'sdk.do'
import type { Resort } from 'schema.org.ai'

// Create a Resort
const item: Resort = {
  $type: 'Resort',
  name: 'Example Resort'
}

// Use semantic patterns
await $.Resort.create(item)
const result = await $.Resort.get('item-id')
```

## Resources

- [Schema.org Resort](https://schema.org/Resort)
- [Resort Properties](https://schema.org/Resort#properties)

## License

This documentation is based on Schema.org vocabulary, which is licensed under Creative Commons Attribution-ShareAlike License (version 3.0).
