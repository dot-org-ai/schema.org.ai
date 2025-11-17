

# ItemAvailability

A list of possible product availability options.

## Type Hierarchy

**ItemAvailability**



## Properties

See [Schema.org ItemAvailability properties](https://schema.org/ItemAvailability#properties)

## Usage in Business-as-Code

```typescript
import { $ } from 'sdk.do'
import type { ItemAvailability } from 'schema.org.ai'

// Create a ItemAvailability
const item: ItemAvailability = {
  $type: 'ItemAvailability',
  name: 'Example ItemAvailability'
}

// Use semantic patterns
await $.ItemAvailability.create(item)
const result = await $.ItemAvailability.get('item-id')
```

## Resources

- [Schema.org ItemAvailability](https://schema.org/ItemAvailability)
- [ItemAvailability Properties](https://schema.org/ItemAvailability#properties)

## License

This documentation is based on Schema.org vocabulary, which is licensed under Creative Commons Attribution-ShareAlike License (version 3.0).
