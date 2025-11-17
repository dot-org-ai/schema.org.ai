

# DrugPrescriptionStatus

Indicates whether this drug is available by prescription or over-the-counter.

## Type Hierarchy

**DrugPrescriptionStatus**



## Properties

See [Schema.org DrugPrescriptionStatus properties](https://schema.org/DrugPrescriptionStatus#properties)

## Usage in Business-as-Code

```typescript
import { $ } from 'sdk.do'
import type { DrugPrescriptionStatus } from 'schema.org.ai'

// Create a DrugPrescriptionStatus
const item: DrugPrescriptionStatus = {
  $type: 'DrugPrescriptionStatus',
  name: 'Example DrugPrescriptionStatus'
}

// Use semantic patterns
await $.DrugPrescriptionStatus.create(item)
const result = await $.DrugPrescriptionStatus.get('item-id')
```

## Resources

- [Schema.org DrugPrescriptionStatus](https://schema.org/DrugPrescriptionStatus)
- [DrugPrescriptionStatus Properties](https://schema.org/DrugPrescriptionStatus#properties)

## License

This documentation is based on Schema.org vocabulary, which is licensed under Creative Commons Attribution-ShareAlike License (version 3.0).
