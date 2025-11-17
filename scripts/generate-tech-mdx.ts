#!/usr/bin/env tsx

/**
 * Generate Technology MDX files from Zapier services data
 *
 * Reads events-cleaned.json and creates individual [Tech].mdx files
 * for each service with TitleCase naming convention.
 */

import fs from 'fs/promises'
import path from 'path'

// File paths
const EVENTS_FILE = path.join(
  process.env.HOME!,
  'projects/.org.ai/platform/packages/integrations/data/zapier/events-cleaned.json'
)
const OUTPUT_DIR = path.join(
  process.env.HOME!,
  'projects/.org.ai/schema/things/tech'
)

// URL mappings for common services
const urlMappings: Record<string, { url: string; provider: string; category: string }> = {
  // Google Services
  'google-sheets': { url: 'sheets.google.com', provider: 'Google', category: 'Productivity Software' },
  'google-calendar': { url: 'calendar.google.com', provider: 'Google', category: 'Productivity Software' },
  'google-drive': { url: 'drive.google.com', provider: 'Google', category: 'Storage Software' },
  'google-contacts': { url: 'contacts.google.com', provider: 'Google', category: 'Productivity Software' },
  'gmail': { url: 'gmail.com', provider: 'Google', category: 'Communication Software' },
  'google-docs': { url: 'docs.google.com', provider: 'Google', category: 'Productivity Software' },
  'google-forms': { url: 'forms.google.com', provider: 'Google', category: 'Productivity Software' },
  'google-meet': { url: 'meet.google.com', provider: 'Google', category: 'Communication Software' },
  'google-analytics': { url: 'analytics.google.com', provider: 'Google', category: 'Analytics Software' },

  // Microsoft Services
  'microsoft-outlook': { url: 'outlook.com', provider: 'Microsoft', category: 'Communication Software' },
  'microsoft-teams': { url: 'teams.microsoft.com', provider: 'Microsoft', category: 'Communication Software' },
  'microsoft-excel': { url: 'office.com/excel', provider: 'Microsoft', category: 'Productivity Software' },
  'microsoft-onedrive': { url: 'onedrive.com', provider: 'Microsoft', category: 'Storage Software' },
  'office-365': { url: 'office.com', provider: 'Microsoft', category: 'Productivity Software' },
  'microsoft-dynamics-crm': { url: 'dynamics.microsoft.com', provider: 'Microsoft', category: 'CRM Software' },
  'microsoft-exchange': { url: 'office.com/exchange', provider: 'Microsoft', category: 'Communication Software' },

  // CRM Platforms
  'hubspot': { url: 'hubspot.com', provider: 'HubSpot', category: 'CRM Software' },
  'hubspot-crm': { url: 'hubspot.com', provider: 'HubSpot', category: 'CRM Software' },
  'salesforce': { url: 'salesforce.com', provider: 'Salesforce', category: 'CRM Software' },
  'zoho-crm': { url: 'zoho.com/crm', provider: 'Zoho', category: 'CRM Software' },
  'pipedrive': { url: 'pipedrive.com', provider: 'Pipedrive', category: 'CRM Software' },
  'zendesk': { url: 'zendesk.com', provider: 'Zendesk', category: 'Customer Support Software' },
  'zendesk-sell': { url: 'zendesk.com/sell', provider: 'Zendesk', category: 'CRM Software' },
  'freshsales-suite': { url: 'freshworks.com/crm', provider: 'Freshworks', category: 'CRM Software' },
  'activecampaign': { url: 'activecampaign.com', provider: 'ActiveCampaign', category: 'Marketing Software' },
  'close': { url: 'close.com', provider: 'Close', category: 'CRM Software' },
  'keap': { url: 'keap.com', provider: 'Keap', category: 'CRM Software' },

  // Communication
  'slack': { url: 'slack.com', provider: 'Slack', category: 'Communication Software' },
  'discord': { url: 'discord.com', provider: 'Discord', category: 'Communication Software' },
  'zoom': { url: 'zoom.us', provider: 'Zoom', category: 'Communication Software' },
  'twilio': { url: 'twilio.com', provider: 'Twilio', category: 'Communication Software' },
  'mailchimp': { url: 'mailchimp.com', provider: 'Intuit Mailchimp', category: 'Marketing Software' },

  // Project Management
  'trello': { url: 'trello.com', provider: 'Atlassian', category: 'Project Management Software' },
  'asana': { url: 'asana.com', provider: 'Asana', category: 'Project Management Software' },
  'monday': { url: 'monday.com', provider: 'monday.com', category: 'Project Management Software' },
  'clickup': { url: 'clickup.com', provider: 'ClickUp', category: 'Project Management Software' },
  'jira': { url: 'atlassian.com/software/jira', provider: 'Atlassian', category: 'Project Management Software' },
  'basecamp': { url: 'basecamp.com', provider: 'Basecamp', category: 'Project Management Software' },

  // Accounting
  'quickbooks': { url: 'quickbooks.intuit.com', provider: 'Intuit', category: 'Accounting Software' },
  'xero': { url: 'xero.com', provider: 'Xero', category: 'Accounting Software' },
  'freshbooks': { url: 'freshbooks.com', provider: 'FreshBooks', category: 'Accounting Software' },
  'stripe': { url: 'stripe.com', provider: 'Stripe', category: 'Payment Processing Software' },
  'paypal': { url: 'paypal.com', provider: 'PayPal', category: 'Payment Processing Software' },

  // E-commerce
  'shopify': { url: 'shopify.com', provider: 'Shopify', category: 'E-commerce Software' },
  'woocommerce': { url: 'woocommerce.com', provider: 'Automattic', category: 'E-commerce Software' },
  'squarespace': { url: 'squarespace.com', provider: 'Squarespace', category: 'Website Builder' },

  // Storage & Files
  'dropbox': { url: 'dropbox.com', provider: 'Dropbox', category: 'Storage Software' },
  'box': { url: 'box.com', provider: 'Box', category: 'Storage Software' },

  // Developer Tools
  'github': { url: 'github.com', provider: 'GitHub', category: 'Developer Tools' },
  'gitlab': { url: 'gitlab.com', provider: 'GitLab', category: 'Developer Tools' },
  'bitbucket': { url: 'bitbucket.org', provider: 'Atlassian', category: 'Developer Tools' },

  // Misc
  'notion': { url: 'notion.so', provider: 'Notion', category: 'Productivity Software' },
  'airtable': { url: 'airtable.com', provider: 'Airtable', category: 'Database Software' },
  'typeform': { url: 'typeform.com', provider: 'Typeform', category: 'Form Software' },
  'calendly': { url: 'calendly.com', provider: 'Calendly', category: 'Scheduling Software' },
  'docusign': { url: 'docusign.com', provider: 'DocuSign', category: 'Document Management Software' },
}

// Category inference from noun patterns
const categoryPatterns: Record<string, string> = {
  'crm': 'CRM Software',
  'calendar': 'Productivity Software',
  'email': 'Communication Software',
  'chat': 'Communication Software',
  'spreadsheet': 'Productivity Software',
  'form': 'Form Software',
  'payment': 'Payment Processing Software',
  'invoice': 'Accounting Software',
  'accounting': 'Accounting Software',
  'project': 'Project Management Software',
  'task': 'Project Management Software',
  'storage': 'Storage Software',
  'analytics': 'Analytics Software',
  'marketing': 'Marketing Software',
  'commerce': 'E-commerce Software',
  'shop': 'E-commerce Software',
  'video': 'Communication Software',
  'meeting': 'Communication Software',
  'document': 'Document Management Software',
  'helpdesk': 'Customer Support Software',
  'support': 'Customer Support Software',
  'database': 'Database Software',
}

interface EventData {
  event: string
  noun: string
  verb: string
  count: number
  services: string[]
}

interface ServiceMetadata {
  slug: string
  name: string
  url: string
  provider: string
  category: string
  events: string[]
  eventCount: number
}

/**
 * Convert slug to TitleCase name
 * Examples:
 *   google-sheets -> GoogleSheets
 *   hubspot-crm -> HubSpotCrm
 *   microsoft-dynamics-crm -> MicrosoftDynamicsCrm
 */
function slugToTitleCase(slug: string): string {
  return slug
    .split('-')
    .map(word => {
      // Handle special cases
      if (word.toLowerCase() === 'crm') return 'CRM'
      if (word.toLowerCase() === 'ai') return 'AI'
      if (word.toLowerCase() === 'api') return 'API'
      if (word.toLowerCase() === 'sms') return 'SMS'
      if (word.toLowerCase() === 'hr') return 'HR'
      if (word.toLowerCase() === 'iot') return 'IoT'
      if (word.toLowerCase() === 'pos') return 'POS'
      if (word.toLowerCase() === 'erp') return 'ERP'

      // Normal title case
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
    })
    .join('')
}

/**
 * Convert slug to human-readable name
 * Examples:
 *   google-sheets -> Google Sheets
 *   hubspot-crm -> HubSpot CRM
 */
function slugToHumanName(slug: string): string {
  return slug
    .split('-')
    .map(word => {
      // Handle special cases
      if (word.toLowerCase() === 'crm') return 'CRM'
      if (word.toLowerCase() === 'ai') return 'AI'
      if (word.toLowerCase() === 'api') return 'API'
      if (word.toLowerCase() === 'sms') return 'SMS'
      if (word.toLowerCase() === 'hr') return 'HR'
      if (word.toLowerCase() === 'iot') return 'IoT'
      if (word.toLowerCase() === 'pos') return 'POS'
      if (word.toLowerCase() === 'erp') return 'ERP'

      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
    })
    .join(' ')
}

/**
 * Infer service metadata from slug and events
 */
function inferMetadata(slug: string, events: string[]): Partial<ServiceMetadata> {
  const mapped = urlMappings[slug]

  if (mapped) {
    return {
      url: `https://${mapped.url}`,
      provider: mapped.provider,
      category: mapped.category,
    }
  }

  // Infer from slug patterns
  let category = 'Business Software'
  for (const [pattern, cat] of Object.entries(categoryPatterns)) {
    if (slug.includes(pattern)) {
      category = cat
      break
    }
  }

  // Infer from event patterns
  const eventNouns = events.map(e => e.split('.')[0].toLowerCase())
  for (const noun of eventNouns) {
    if (categoryPatterns[noun]) {
      category = categoryPatterns[noun]
      break
    }
  }

  // Generate default URL
  const url = `https://${slug.replace(/-/g, '')}.com`
  const provider = slugToHumanName(slug)

  return { url, provider, category }
}

/**
 * Generate MDX content for a technology service
 */
function generateMDX(service: ServiceMetadata): string {
  const titleCaseName = slugToTitleCase(service.slug)
  const humanName = service.name

  // Group events by noun
  const eventsByNoun: Record<string, string[]> = {}
  for (const event of service.events) {
    const [noun, verb] = event.split('.')
    if (!eventsByNoun[noun]) {
      eventsByNoun[noun] = []
    }
    eventsByNoun[noun].push(verb)
  }

  // Generate event list
  const eventList = Object.entries(eventsByNoun)
    .map(([noun, verbs]) => {
      return verbs.map(verb => `- ${noun}.${verb}`).join('\n')
    })
    .join('\n')

  const content = `---
$id: https://tech.org.ai/${titleCaseName}
$context: https://schema.org.ai
$type: Technology
name: ${humanName}
description: ${service.category.replace(' Software', '')} platform for business automation
url: ${service.url}
applicationCategory: ${service.category}
provider:
  $type: Organization
  name: ${service.provider}
  url: ${service.url}
zapierSlug: ${service.slug}
digital: 1.0
---

[Thing](../Thing.mdx) > [CreativeWork](../CreativeWork.mdx) > [SoftwareApplication](../SoftwareApplication.mdx) > [Technology](../Technology.mdx)

# ${humanName}

${service.category.replace(' Software', '')} platform for business automation and workflow integration.

## Properties

| Property | Type | Description | Inherited From |
|----------|------|-------------|----------------|
| \`$type\` | Text | Always "Technology" | - |
| \`$id\` | URL | Unique identifier | Thing |
| \`name\` | Text | Service name | Thing |
| \`description\` | Text | Service description | Thing |
| \`url\` | URL | Service website | Thing |
| \`provider\` | Organization | Service provider | SoftwareApplication |
| \`applicationCategory\` | Text | Software category | SoftwareApplication |
| \`zapierSlug\` | Text | Zapier identifier | Technology |
| \`events\` | Event[] | Available events | Technology |
| \`actions\` | Action[] | Available actions | Technology |

## Available Events

${eventList || '- Contact.created\n- Contact.updated'}

## Available Actions

- Create record
- Update record
- Find record
- Delete record

## Usage in Business-as-Code

\`\`\`typescript
import { $ } from 'sdk.do'

const ${service.slug.replace(/-/g, '')} = {
  $type: 'Technology',
  name: '${humanName}',
  url: '${service.url}'
}

await $.Technology.create(${service.slug.replace(/-/g, '')})
\`\`\`

## Resources

- [${humanName}](${service.url})
- [Zapier Integration](https://zapier.com/apps/${service.slug}/integrations)

## License

This documentation is based on Schema.org vocabulary, which is licensed under Creative Commons Attribution-ShareAlike License (version 3.0).
`

  return content
}

/**
 * Main execution
 */
async function main() {
  console.log('🚀 Generating Technology MDX files from Zapier data...\n')

  // Read events data
  console.log('📖 Reading events-cleaned.json...')
  const eventsData: EventData[] = JSON.parse(
    await fs.readFile(EVENTS_FILE, 'utf-8')
  )

  // Aggregate services with their events
  console.log('🔍 Aggregating service metadata...')
  const serviceMap = new Map<string, ServiceMetadata>()

  for (const eventData of eventsData) {
    for (const serviceSlug of eventData.services) {
      if (!serviceMap.has(serviceSlug)) {
        const metadata = inferMetadata(serviceSlug, [eventData.event])
        serviceMap.set(serviceSlug, {
          slug: serviceSlug,
          name: slugToHumanName(serviceSlug),
          url: metadata.url || `https://${serviceSlug.replace(/-/g, '')}.com`,
          provider: metadata.provider || slugToHumanName(serviceSlug),
          category: metadata.category || 'Business Software',
          events: [],
          eventCount: 0,
        })
      }

      const service = serviceMap.get(serviceSlug)!
      service.events.push(eventData.event)
      service.eventCount++
    }
  }

  console.log(`✅ Found ${serviceMap.size} unique services\n`)

  // Sort services by event count
  const services = Array.from(serviceMap.values())
    .sort((a, b) => b.eventCount - a.eventCount)

  // Show stats
  console.log('📊 Service Statistics:')
  console.log(`   Total services: ${services.length}`)
  console.log(`   Top service: ${services[0].name} (${services[0].eventCount} events)`)
  console.log(`   Services with >10 events: ${services.filter(s => s.eventCount > 10).length}`)
  console.log(`   Services with known URLs: ${services.filter(s => urlMappings[s.slug]).length}\n`)

  // Create output directory
  console.log(`📁 Creating output directory: ${OUTPUT_DIR}`)
  await fs.mkdir(OUTPUT_DIR, { recursive: true })

  // Generate MDX files (limit to first 100 for initial run)
  const limit = parseInt(process.env.LIMIT || '100')
  console.log(`\n📝 Generating MDX files (limit: ${limit})...\n`)

  let generated = 0
  for (const service of services.slice(0, limit)) {
    const titleCaseName = slugToTitleCase(service.slug)
    const filename = `${titleCaseName}.mdx`
    const filepath = path.join(OUTPUT_DIR, filename)

    const mdx = generateMDX(service)
    await fs.writeFile(filepath, mdx, 'utf-8')

    generated++
    if (generated <= 10 || generated % 10 === 0) {
      console.log(`   ✓ ${filename} (${service.eventCount} events)`)
    }
  }

  console.log(`\n✅ Generated ${generated} Technology MDX files`)
  console.log(`📂 Output directory: ${OUTPUT_DIR}`)

  // Generate index file
  console.log('\n📋 Generating index...')
  const indexContent = services.slice(0, limit).map(s => {
    const titleCaseName = slugToTitleCase(s.slug)
    return `- [${s.name}](${titleCaseName}.mdx) - ${s.eventCount} events`
  }).join('\n')

  await fs.writeFile(
    path.join(OUTPUT_DIR, 'README.md'),
    `# Technology Services\n\nGenerated from Zapier integration data.\n\n## Services (${generated}/${services.length})\n\n${indexContent}\n`,
    'utf-8'
  )

  console.log('✅ Index generated: README.md')

  console.log('\n🎉 Done!')
  console.log(`\n💡 To generate all ${services.length} services, run:`)
  console.log(`   LIMIT=${services.length} tsx ${__filename}`)
}

// Run
main().catch(console.error)
