

# FMRadioChannel

A radio channel that uses FM.

## Type Hierarchy

**FMRadioChannel**



## Properties

See [Schema.org FMRadioChannel properties](https://schema.org/FMRadioChannel#properties)

## Usage in Business-as-Code

```typescript
import { $ } from 'sdk.do'
import type { FMRadioChannel } from 'schema.org.ai'

// Create a FMRadioChannel
const item: FMRadioChannel = {
  $type: 'FMRadioChannel',
  name: 'Example FMRadioChannel'
}

// Use semantic patterns
await $.FMRadioChannel.create(item)
const result = await $.FMRadioChannel.get('item-id')
```

## Resources

- [Schema.org FMRadioChannel](https://schema.org/FMRadioChannel)
- [FMRadioChannel Properties](https://schema.org/FMRadioChannel#properties)

## License

This documentation is based on Schema.org vocabulary, which is licensed under Creative Commons Attribution-ShareAlike License (version 3.0).
