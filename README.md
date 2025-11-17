# schema.org.ai

[![License: CC BY-SA 4.0](https://img.shields.io/badge/License-CC%20BY--SA%204.0-lightgrey.svg)](https://creativecommons.org/licenses/by-sa/4.0/)

Schema.org vocabulary ontology with 871 types for Business-as-Code.

## Overview

This repository contains MDX documentation for all Schema.org types, organized hierarchically from Thing through all subclasses, **plus schema.org.ai extensions** for AI-native Business-as-Code.

**Data Source**: [Schema.org](https://schema.org) (CC BY-SA 3.0) + schema.org.ai extensions

## Extensions to Schema.org

schema.org.ai extends the base Schema.org vocabulary with modern AI, web, and digital concepts:

### Digital Scoring Property

- **`digital`** (0.0-1.0) - Quantifies the digital maturity or digital-first nature of any Thing
  - `0.0` = Purely physical/analog
  - `1.0` = Fully digital/autonomous
  - Example: A traditional bank branch might be `0.3`, while a neobank is `0.95`

### AI & Autonomous Agent Types

- **`Agent`** - Autonomous AI agents that can perform actions and make decisions
- **`Tool`** - Tools that agents can use (APIs, functions, services)
- **`Prompt`** - AI prompts and prompt templates
- **`Model`** - AI/ML models (LLMs, vision models, etc.)
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

- **`DigitalWorker`** - Autonomous digital workers/agents in business processes
- **`APIEndpoint`** - RESTful API endpoints and services
- **`WebhookEndpoint`** - Webhook receivers for event-driven architecture
- **`MCPServer`** - Model Context Protocol servers
- **`SDKPackage`** - Software Development Kit packages

These extensions enable schema.org.ai to fully support autonomous business operations, AI-native applications, and modern digital experiences while remaining compatible with the base Schema.org vocabulary.

## Structure

```
schema.org.ai/
├── things/          # 871 MDX files (Thing.mdx, Action.mdx, etc.)
├── scripts/         # Generation scripts
├── site/            # Future: Fumadocs documentation site
└── package/         # Future: NPM package
```

## Generated Content

- **871 MDX files** with complete type hierarchy
- Breadcrumb navigation (Thing > Action > CreateAction)
- Direct subclasses listing with links
- Business-as-Code usage examples
- Schema.org resource links

## License

This work is licensed under [Creative Commons Attribution-ShareAlike 4.0 International](LICENSE) (CC BY-SA 4.0).

**Data Attribution**: Based on Schema.org vocabulary (https://schema.org) licensed under CC BY-SA 3.0.

See [ATTRIBUTION.md](ATTRIBUTION.md) for complete data source details.

## Usage

```
Based on schema.org.ai (https://schema.org.ai)
Data sourced from Schema.org (https://schema.org)
Licensed under CC BY-SA 4.0
```

## Links

- Website: https://schema.org.ai
- GitHub: https://github.com/dot-org-ai/schema.org.ai
- Original Source: https://schema.org
- .org.ai Ecosystem: https://github.com/dot-org-ai
