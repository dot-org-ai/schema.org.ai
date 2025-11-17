# Technology MDX Generation Summary

## Overview

Successfully created a script to generate Technology MDX files from Zapier integration data using the [Tech].mdx layout convention with TitleCase naming.

## Files Created

### 1. Base Type Definition
**Path:** `/Users/nathanclevenger/projects/.org.ai/schema/things/Technology.mdx`

Defines the Technology type that extends SoftwareApplication with integration-specific properties:
- `zapierSlug`: Zapier service identifier
- `events`: Available webhook events
- `actions`: Available API actions
- `integrations`: Available integrations

### 2. Generation Script
**Path:** `/Users/nathanclevenger/projects/.org.ai/schema/scripts/generate-tech-mdx.ts`

TypeScript script that:
- Reads Zapier events data from `events-cleaned.json`
- Aggregates 7,155 unique services with their events
- Converts slugs to TitleCase (google-sheets → GoogleSheets)
- Maps common services to real URLs and providers
- Generates MDX files with semantic structure
- Creates searchable index

### 3. Generated Files
**Output Directory:** `/Users/nathanclevenger/projects/.org.ai/schema/things/tech/`

Currently generated: 100 services (top by event count)

## Data Statistics

- **Total Services:** 7,155 unique technology services
- **Services with >10 events:** 405
- **Services with known URLs:** 51 (expandable)
- **Top service:** Megaventory (78 events)
- **Well-known services included:** HubSpot, QuickBooks, DocuSign, Salesforce, Slack, Microsoft, Google, etc.

## Sample Generated Files

### Example 1: HubSpot (Well-known CRM)
- **File:** `Hubspot.mdx`
- **URL:** `https://hubspot.com` (mapped)
- **Provider:** HubSpot (mapped)
- **Category:** CRM Software (inferred)
- **Events:** 25 events (Contact.created, Deal.updated, etc.)

### Example 2: QuickBooks (Accounting Software)
- **File:** `Quickbooks.mdx`
- **URL:** `https://quickbooks.intuit.com` (mapped)
- **Provider:** Intuit (mapped)
- **Category:** Accounting Software (inferred)
- **Events:** 30 events (Invoice.created, Payment.created, etc.)

### Example 3: DocuSign (Document Management)
- **File:** `Docusign.mdx`
- **URL:** `https://docusign.com` (mapped)
- **Provider:** DocuSign (mapped)
- **Category:** Document Management Software (inferred)
- **Events:** 33 events (Envelope.unknown, Template.unknown, etc.)

## MDX File Structure

Each generated file follows this pattern:

```mdx
---
$id: https://tech.org.ai/[TitleCase]
$context: https://schema.org.ai
$type: Technology
name: [Human Name]
description: [Category] platform for business automation
url: [Service URL]
applicationCategory: [Category] Software
provider:
  $type: Organization
  name: [Provider]
  url: [URL]
zapierSlug: [slug]
digital: 1.0
---

[Breadcrumb navigation]

# [Human Name]

[Description]

## Properties
[Property table]

## Available Events
[Event list grouped by noun]

## Available Actions
[Action list]

## Usage in Business-as-Code
[TypeScript example]

## Resources
[Links to service and Zapier integration]
```

## Naming Conventions

### Slug to TitleCase
- `google-sheets` → `GoogleSheets`
- `hubspot-crm` → `HubSpotCRM`
- `microsoft-dynamics-crm` → `MicrosoftDynamicsCRM`

### Special Acronym Handling
- CRM, API, AI, SMS, HR, IoT, POS, ERP remain uppercase

### Human-Readable Names
- `google-sheets` → `Google Sheets`
- `hubspot-crm` → `HubSpot CRM`
- `docusign` → `Docusign`

## URL Mappings

### Google Services
- `google-sheets` → `sheets.google.com`
- `google-calendar` → `calendar.google.com`
- `google-drive` → `drive.google.com`

### Microsoft Services
- `microsoft-outlook` → `outlook.com`
- `microsoft-teams` → `teams.microsoft.com`
- `office-365` → `office.com`

### CRM Platforms
- `hubspot` → `hubspot.com`
- `salesforce` → `salesforce.com`
- `zoho-crm` → `zoho.com/crm`

### Accounting
- `quickbooks` → `quickbooks.intuit.com`
- `xero` → `xero.com`
- `stripe` → `stripe.com`

## Category Inference

Categories are inferred from:
1. **Explicit mappings** for known services
2. **Slug patterns** (contains "crm", "calendar", "invoice", etc.)
3. **Event patterns** (Customer.created → CRM, Invoice.created → Accounting)

### Common Categories
- CRM Software
- Productivity Software
- Communication Software
- Accounting Software
- Marketing Software
- E-commerce Software
- Project Management Software
- Developer Tools
- Analytics Software
- Storage Software
- Document Management Software
- Payment Processing Software

## Usage

### Generate Top 100 Services
```bash
cd ~/projects/.org.ai/schema
LIMIT=100 tsx scripts/generate-tech-mdx.ts
```

### Generate All 7,155 Services
```bash
cd ~/projects/.org.ai/schema
LIMIT=7155 tsx scripts/generate-tech-mdx.ts
```

### Generate Specific Amount
```bash
cd ~/projects/.org.ai/schema
LIMIT=500 tsx scripts/generate-tech-mdx.ts
```

## Output Structure

```
~/projects/.org.ai/schema/things/tech/
├── README.md (index of all services)
├── Megaventory.mdx
├── Hubspot.mdx
├── Quickbooks.mdx
├── Docusign.mdx
├── GoogleSheets.mdx
├── Salesforce.mdx
└── ... (7,155 total)
```

## Estimated Generation Time

- **100 services:** ~2 seconds
- **500 services:** ~8 seconds
- **1,000 services:** ~15 seconds
- **7,155 services:** ~90 seconds (estimated)

## Future Enhancements

1. **Add actions data** from `actions-cleaned.json`
2. **SimpleIcons integration** for service logos
3. **Provider organization types** (expand provider data)
4. **API documentation links** (add official API docs)
5. **Integration examples** (add real-world usage patterns)
6. **Event/Action schemas** (add typed schemas for each event/action)
7. **tech.org.ai submodule** (move to dedicated repository)

## Notes

- **tech.org.ai submodule** does not exist yet
- Files currently generated in: `schema/things/tech/`
- When tech.org.ai submodule is created, move to: `~/projects/.org.ai/tech/things/`
- Script is ready to run for all services when needed
- URL mappings can be expanded as needed

## Related Files

- **Events data:** `~/projects/.org.ai/platform/packages/integrations/data/zapier/events-cleaned.json`
- **Actions data:** `~/projects/.org.ai/platform/packages/integrations/data/zapier/actions-cleaned.json` (if exists)
- **Base type:** `~/projects/.org.ai/schema/things/Technology.mdx`
- **Parent types:** `Thing.mdx`, `CreativeWork.mdx`, `SoftwareApplication.mdx`

## License

Generated documentation is based on Schema.org vocabulary, licensed under Creative Commons Attribution-ShareAlike License (version 3.0).
