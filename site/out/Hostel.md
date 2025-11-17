

# Hostel

A hostel - cheap accommodation, often in shared dormitories. 

 See also the dedicated document on the use of schema.org for marking up hotels and other forms of accommodations.

## Type Hierarchy

[Thing](Thing.mdx) > [Place](Place.mdx) > [LocalBusiness](LocalBusiness.mdx) > [LodgingBusiness](LodgingBusiness.mdx) > **Hostel**



## Properties

See [Schema.org Hostel properties](https://schema.org/Hostel#properties)

## Usage in Business-as-Code

```typescript
import { $ } from 'sdk.do'
import type { Hostel } from 'schema.org.ai'

// Create a Hostel
const item: Hostel = {
  $type: 'Hostel',
  name: 'Example Hostel'
}

// Use semantic patterns
await $.Hostel.create(item)
const result = await $.Hostel.get('item-id')
```

## Resources

- [Schema.org Hostel](https://schema.org/Hostel)
- [Hostel Properties](https://schema.org/Hostel#properties)

## License

This documentation is based on Schema.org vocabulary, which is licensed under Creative Commons Attribution-ShareAlike License (version 3.0).
