#!/usr/bin/env tsx
/**
 * Comprehensive frontmatter fix for all MDX files
 * - Adds title from name
 * - Properly quotes descriptions with special characters
 * - Handles multiline descriptions
 */

import fs from 'fs/promises'
import path from 'path'
import { dump } from 'js-yaml'

interface Frontmatter {
  [key: string]: any
}

async function fixFrontmatter(filePath: string): Promise<boolean> {
  const content = await fs.readFile(filePath, 'utf-8')

  // Check if file has frontmatter
  if (!content.startsWith('---\n')) return false

  // Find frontmatter bounds
  const secondDivider = content.indexOf('\n---\n', 4)
  if (secondDivider === -1) return false

  const frontmatterRaw = content.substring(4, secondDivider)
  const body = content.substring(secondDivider + 5)

  // Parse frontmatter manually (to avoid YAML errors)
  const lines = frontmatterRaw.split('\n')
  const fm: Frontmatter = {}

  let currentKey = ''
  let currentValue = ''

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]

    // Skip empty lines
    if (!line.trim()) continue

    // Check if it's a key: value line
    const keyMatch = line.match(/^([a-zA-Z_$][a-zA-Z0-9_$]*):(.*)$/)

    if (keyMatch) {
      // Save previous key if exists
      if (currentKey) {
        fm[currentKey] = parseValue(currentValue.trim())
      }

      currentKey = keyMatch[1]
      currentValue = keyMatch[2]
    } else {
      // Continuation of previous value
      currentValue += '\n' + line
    }
  }

  // Save last key
  if (currentKey) {
    fm[currentKey] = parseValue(currentValue.trim())
  }

  // Add title from name if missing
  if (!fm.title && fm.name) {
    fm.title = fm.name
  }

  // Clean description - remove markdown links like [[Term]]
  if (fm.description && typeof fm.description === 'string') {
    fm.description = fm.description.replace(/\[\[([^\]]+)\]\]/g, '$1')
  }

  // Generate clean YAML frontmatter
  const yamlContent = dump(fm, {
    lineWidth: -1, // Don't wrap lines
    noRefs: true,
    quotingType: '"',
    forceQuotes: false
  }).trim()

  const newContent = `---\n${yamlContent}\n---\n\n${body}`

  await fs.writeFile(filePath, newContent, 'utf-8')
  return true
}

function parseValue(value: string): any {
  // Remove quotes if present
  if ((value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))) {
    return value.slice(1, -1)
  }

  // Parse arrays
  if (value.startsWith('[') && value.endsWith(']')) {
    try {
      return JSON.parse(value)
    } catch {
      return value
    }
  }

  // Return as is
  return value
}

async function main() {
  const typesDir = path.join(__dirname, '../content/docs/types')
  const files = await fs.readdir(typesDir)

  let fixedCount = 0
  let totalCount = 0

  for (const file of files) {
    if (!file.endsWith('.mdx')) continue

    totalCount++
    const filePath = path.join(typesDir, file)

    try {
      const wasFixed = await fixFrontmatter(filePath)

      if (wasFixed) {
        fixedCount++
        if (fixedCount % 100 === 0) {
          console.log(`Fixed ${fixedCount} files...`)
        }
      }
    } catch (error) {
      console.error(`Error fixing ${file}:`, error)
    }
  }

  console.log(`\n✅ Fixed ${fixedCount} out of ${totalCount} MDX files`)
}

main().catch(console.error)
