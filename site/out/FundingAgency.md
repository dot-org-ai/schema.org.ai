

# FundingAgency

A FundingAgency is an organization that implements one or more FundingSchemes and manages the granting process (via Grants, typically MonetaryGrants). A funding agency is not always required for grant funding, e.g. philanthropic giving, corporate sponsorship etc. Examples of funding agencies include ERC, REA, NIH, Bill and Melinda Gates Foundation, ...

## Type Hierarchy

[Thing](Thing.mdx) > [Organization](Organization.mdx) > [Project](Project.mdx) > **FundingAgency**



## Properties

See [Schema.org FundingAgency properties](https://schema.org/FundingAgency#properties)

## Usage in Business-as-Code

```typescript
import { $ } from 'sdk.do'
import type { FundingAgency } from 'schema.org.ai'

// Create a FundingAgency
const item: FundingAgency = {
  $type: 'FundingAgency',
  name: 'Example FundingAgency'
}

// Use semantic patterns
await $.FundingAgency.create(item)
const result = await $.FundingAgency.get('item-id')
```

## Resources

- [Schema.org FundingAgency](https://schema.org/FundingAgency)
- [FundingAgency Properties](https://schema.org/FundingAgency#properties)

## License

This documentation is based on Schema.org vocabulary, which is licensed under Creative Commons Attribution-ShareAlike License (version 3.0).
