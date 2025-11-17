---
$id: https://schema.org.ai
$context: https://schema.org
$type: SoftwareSourceCode
name: schema.org.ai
description: Schema.org vocabulary with 920 types plus AI-native extensions for Business-as-Code
programmingLanguage: TypeScript
license: CC-BY-SA-4.0
author:
  $type: Organization
  name: .do Platform Team
  url: https://platform.do
sourceOrganization:
  $type: Organization
  name: Schema.org Community
  url: https://schema.org
version: 1.0.0
datePublished: 2025-01-17
---

# schema.org.ai

[![License: CC BY-SA 4.0](https://img.shields.io/badge/License-CC%20BY--SA%204.0-lightgrey.svg)](https://creativecommons.org/licenses/by-sa/4.0/)

Schema.org vocabulary ontology with 871 types for Business-as-Code.

## Overview

This repository contains MDX documentation for all Schema.org types, organized hierarchically from Thing through all subclasses, **plus schema.org.ai extensions** for AI-native Business-as-Code.

**Data Source**: [Schema.org](https://schema.org) (CC BY-SA 3.0)

## Extensions to Schema.org

schema.org.ai extends the base Schema.org vocabulary with modern AI, web, and digital concepts:

### Digital Scoring Property

- **`digital`** (0.0-1.0) - Quantifies the digital maturity or digital-first nature of any Thing

### AI & Autonomous Agent Types

- **`Agent`** - Autonomous AI agents
- **`Tool`** - Tools that agents can use
- **`Prompt`** - AI prompts and prompt templates
- **`Model`** - AI/ML models
- **`Workflow`** - Autonomous workflow definitions
- **`Capability`** - Agent capabilities and skills

### Modern Web & Landing Page Types

- **`LandingPage`** - Marketing landing pages optimized for conversion
- **`HeroSection`** - Hero sections with prominent CTAs
- **`WPHero`** - WordPress hero sections/blocks
- **`FeatureSection`** - Product/service feature highlights
- **`CTASection`** - Call-to-action sections
- **`TestimonialSection`** - Customer testimonials and social proof
- **`PricingSection`** - Pricing tables and plans

### Business-as-Code Concepts

- **`API`** - RESTful API endpoints and services
- **`Webhook`** - Webhook receivers for event-driven architecture
- **`MCP`** - Model Context Protocol servers
- **`SDK`** - Software Development Kit packages
- **`CLI`** - Command-line interface tools

## Structure

```
schema.org.ai/
├── things/          # 871 MDX files
├── scripts/         # Generation and transformation scripts
├── site/            # Fumadocs documentation site
└── package/         # NPM package with mdxe build
```

## Features

- **871 MDX files** with complete type hierarchy
- Breadcrumb navigation (Thing > Action > CreateAction)
- Direct subclasses listing with links
- Business-as-Code usage examples
- Schema.org resource links
- AI-native extensions (Agent, Tool, Model, etc.)
- Digital scoring property (0.0-1.0)

## License

This work is licensed under [Creative Commons Attribution-ShareAlike 4.0 International](LICENSE) (CC BY-SA 4.0).

**Data Attribution**: Based on Schema.org (https://schema.org) licensed under CC BY-SA 3.0.

See [ATTRIBUTION.md](ATTRIBUTION.md) for complete data source details.

## Required Attribution

```
Based on schema.org.ai (https://schema.org.ai)
Data sourced from Schema.org (https://schema.org)
Licensed under CC BY-SA 4.0
```

## Installation

```bash
npm install schema.org.ai
# or
pnpm add schema.org.ai
# or
yarn add schema.org.ai
```

## Usage

```typescript
import {{ $ }} from 'sdk.do'
import type {{ Thing }} from 'schema.org.ai'

// Semantic patterns
const item = await $.Thing.create({{
  $type: 'Thing',
  name: 'Example'
}})

const result = await $.Thing.get('item-id')
```

## Links

- **Website**: https://schema.org.ai
- **GitHub**: https://github.com/dot-org-ai/schema.org.ai
- **Package**: https://www.npmjs.com/package/schema.org.ai
- **Original Source**: https://schema.org
- **.org.ai Ecosystem**: https://github.com/dot-org-ai

## Related Ontologies

- [schema.org.ai](https://schema.org.ai) - Schema.org vocabulary
- [verbs.org.ai](https://verbs.org.ai) - Business verbs and actions
- [process.org.ai](https://process.org.ai) - Business processes
- [graph.org.ai](https://graph.org.ai) - Semantic graph database

## Community

- **Issues**: https://github.com/dot-org-ai/schema.org.ai/issues
- **Discussions**: https://github.com/dot-org-ai/community/discussions
- **Discord**: https://discord.gg/dotdo
