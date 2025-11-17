

# BedAndBreakfast

Bed and breakfast. 

 See also the dedicated document on the use of schema.org for marking up hotels and other forms of accommodations.

## Type Hierarchy

[Thing](Thing.mdx) > [Place](Place.mdx) > [LocalBusiness](LocalBusiness.mdx) > [LodgingBusiness](LodgingBusiness.mdx) > **BedAndBreakfast**



## Properties

See [Schema.org BedAndBreakfast properties](https://schema.org/BedAndBreakfast#properties)

## Usage in Business-as-Code

```typescript
import { $ } from 'sdk.do'
import type { BedAndBreakfast } from 'schema.org.ai'

// Create a BedAndBreakfast
const item: BedAndBreakfast = {
  $type: 'BedAndBreakfast',
  name: 'Example BedAndBreakfast'
}

// Use semantic patterns
await $.BedAndBreakfast.create(item)
const result = await $.BedAndBreakfast.get('item-id')
```

## Resources

- [Schema.org BedAndBreakfast](https://schema.org/BedAndBreakfast)
- [BedAndBreakfast Properties](https://schema.org/BedAndBreakfast#properties)

## License

This documentation is based on Schema.org vocabulary, which is licensed under Creative Commons Attribution-ShareAlike License (version 3.0).
