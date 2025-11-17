#!/usr/bin/env tsx
/**
 * Generate property MDX files from Schema.org CSV data
 */

import fs from 'fs/promises'
import path from 'path'
import { parse } from 'csv-parse/sync'

interface PropertyMetadata {
  id: string
  label: string
  comment: string
  domainIncludes: string[]
  rangeIncludes: string[]
  subPropertyOf: string
  inverseOf: string
  supersedes: string
  supersededBy: string
}

async function fetchPropertiesCSV(): Promise<string> {
  const response = await fetch('https://schema.org/version/latest/schemaorg-all-https-properties.csv')
  return await response.text()
}

function parseCSV(csv: string): PropertyMetadata[] {
  const records = parse(csv, {
    columns: true,
    skip_empty_lines: true,
    relax_quotes: true
  })

  const properties: PropertyMetadata[] = []

  for (const record of records) {
    const label = record.label
    if (!label) continue

    properties.push({
      id: record.id || '',
      label: label,
      comment: record.comment || '',
      domainIncludes: record.domainIncludes ? record.domainIncludes.split(', ').map((s: string) => s.replace('https://schema.org/', '')) : [],
      rangeIncludes: record.rangeIncludes ? record.rangeIncludes.split(', ').map((s: string) => s.replace('https://schema.org/', '')) : [],
      subPropertyOf: record.subPropertyOf ? record.subPropertyOf.replace('https://schema.org/', '') : '',
      inverseOf: record.inverseOf ? record.inverseOf.replace('https://schema.org/', '') : '',
      supersedes: record.supersedes ? record.supersedes.replace('https://schema.org/', '') : '',
      supersededBy: record.supersededBy ? record.supersededBy.replace('https://schema.org/', '') : ''
    })
  }

  return properties
}

function generatePropertyMDX(prop: PropertyMetadata): string {
  const slug = prop.label
  const title = prop.label
  // Clean description: remove HTML tags, limit length, escape for YAML
  const cleanDescription = prop.comment
    .replace(/<[^>]*>/g, '')  // Remove HTML tags
    .replace(/\r?\n/g, ' ')   // Replace newlines with spaces
    .replace(/\s+/g, ' ')     // Collapse multiple spaces
    .trim()
    .substring(0, 200)

  // Use JSON.stringify to properly escape the description for YAML
  const escapedDescription = JSON.stringify(cleanDescription)

  let frontmatter = `---
$id: ${prop.id}
$context: https://schema.org
$type: Property
name: ${prop.label}
description: ${escapedDescription}
title: ${title}
`

  if (prop.subPropertyOf) {
    frontmatter += `subPropertyOf: "${prop.subPropertyOf}"\n`
  }

  frontmatter += `---\n\n`

  let content = `# ${prop.label}\n\n${prop.comment}\n\n`

  if (prop.domainIncludes.length > 0) {
    content += `## Used on types\n\n`
    content += prop.domainIncludes.map(type => `- [${type}](${type}.html)`).join('\n')
    content += `\n\n`
  }

  if (prop.rangeIncludes.length > 0) {
    content += `## Expected types\n\n`
    content += prop.rangeIncludes.map(type => `- [${type}](${type}.html)`).join('\n')
    content += `\n\n`
  }

  if (prop.subPropertyOf) {
    content += `## Subproperty of\n\n[${prop.subPropertyOf}](${prop.subPropertyOf}.html)\n\n`
  }

  if (prop.inverseOf) {
    content += `## Inverse of\n\n[${prop.inverseOf}](${prop.inverseOf}.html)\n\n`
  }

  if (prop.supersedes) {
    content += `## Supersedes\n\n[${prop.supersedes}](${prop.supersedes}.html)\n\n`
  }

  if (prop.supersededBy) {
    content += `## Superseded by\n\n[${prop.supersededBy}](${prop.supersededBy}.html)\n\n`
  }

  content += `## Resources\n\n- [Schema.org ${prop.label}](https://schema.org/${prop.label})\n\n`

  return frontmatter + content
}

async function main() {
  console.log('Fetching Schema.org properties CSV...')
  const csv = await fetchPropertiesCSV()

  console.log('Parsing CSV...')
  const properties = parseCSV(csv)
  console.log(`Found ${properties.length} properties`)

  const outDir = path.join(process.cwd(), 'content/properties')
  await fs.mkdir(outDir, { recursive: true })

  console.log(`Generating MDX files in ${outDir}...`)
  for (const prop of properties) {
    const mdx = generatePropertyMDX(prop)
    const filename = `${prop.label}.mdx`
    await fs.writeFile(path.join(outDir, filename), mdx)
  }

  console.log(`✅ Generated ${properties.length} property MDX files`)
}

main().catch(console.error)
