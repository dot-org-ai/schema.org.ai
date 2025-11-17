

# Motel

A motel. 

 See also the dedicated document on the use of schema.org for marking up hotels and other forms of accommodations.

## Type Hierarchy

[Thing](Thing.mdx) > [Place](Place.mdx) > [LocalBusiness](LocalBusiness.mdx) > [LodgingBusiness](LodgingBusiness.mdx) > **Motel**



## Properties

See [Schema.org Motel properties](https://schema.org/Motel#properties)

## Usage in Business-as-Code

```typescript
import { $ } from 'sdk.do'
import type { Motel } from 'schema.org.ai'

// Create a Motel
const item: Motel = {
  $type: 'Motel',
  name: 'Example Motel'
}

// Use semantic patterns
await $.Motel.create(item)
const result = await $.Motel.get('item-id')
```

## Resources

- [Schema.org Motel](https://schema.org/Motel)
- [Motel Properties](https://schema.org/Motel#properties)

## License

This documentation is based on Schema.org vocabulary, which is licensed under Creative Commons Attribution-ShareAlike License (version 3.0).
