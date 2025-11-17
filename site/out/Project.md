

# Project

An enterprise (potentially individual but typically collaborative), planned to achieve a particular aim. Use properties from Organization, subOrganization/parentOrganization to indicate project sub-structures.

## Type Hierarchy

[Thing](Thing.mdx) > [Organization](Organization.mdx) > **Project**

## Direct Subclasses

- **[FundingAgency](FundingAgency.mdx)**: A FundingAgency is an organization that implements one or more FundingSchemes and manages the granting process (via Grants, typically MonetaryGrants)
- **[ResearchProject](ResearchProject.mdx)**: A Research project

## Properties

See [Schema.org Project properties](https://schema.org/Project#properties)

## Usage in Business-as-Code

```typescript
import { $ } from 'sdk.do'
import type { Project } from 'schema.org.ai'

// Create a Project
const item: Project = {
  $type: 'Project',
  name: 'Example Project'
}

// Use semantic patterns
await $.Project.create(item)
const result = await $.Project.get('item-id')
```

## Resources

- [Schema.org Project](https://schema.org/Project)
- [Project Properties](https://schema.org/Project#properties)

## License

This documentation is based on Schema.org vocabulary, which is licensed under Creative Commons Attribution-ShareAlike License (version 3.0).
