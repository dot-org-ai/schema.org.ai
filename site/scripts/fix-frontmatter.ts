#!/usr/bin/env tsx
/**
 * Fix frontmatter in MDX files - quote descriptions with colons
 */

import fs from 'fs/promises'
import path from 'path'

async function fixFrontmatter(filePath: string): Promise<boolean> {
  const content = await fs.readFile(filePath, 'utf-8')

  // Check if file has frontmatter
  if (!content.startsWith('---\n')) return false

  const lines = content.split('\n')
  let inFrontmatter = false
  let frontmatterEnd = -1
  let changed = false

  const fixedLines: string[] = []

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]

    if (line === '---') {
      fixedLines.push(line)
      if (i === 0) {
        inFrontmatter = true
      } else if (inFrontmatter) {
        frontmatterEnd = i
        inFrontmatter = false
      }
      continue
    }

    if (inFrontmatter && line.startsWith('description:')) {
      // Check if the description value contains a colon and isn't already quoted
      const match = line.match(/^description:\s*(.+)$/)
      if (match) {
        const value = match[1].trim()
        // If value contains colon and isn't already quoted
        if (value.includes(':') && !value.startsWith('"') && !value.startsWith("'")) {
          // Quote the value
          const quotedValue = `"${value.replace(/"/g, '\\"')}"`
          fixedLines.push(`description: ${quotedValue}`)
          changed = true
          continue
        }
      }
    }

    fixedLines.push(line)
  }

  if (changed) {
    await fs.writeFile(filePath, fixedLines.join('\n'), 'utf-8')
    return true
  }

  return false
}

async function main() {
  const typesDir = path.join(__dirname, '../content/docs')
  const files = await fs.readdir(typesDir)

  let fixedCount = 0
  let totalCount = 0

  for (const file of files) {
    if (!file.endsWith('.mdx')) continue

    totalCount++
    const filePath = path.join(typesDir, file)
    const wasFixed = await fixFrontmatter(filePath)

    if (wasFixed) {
      fixedCount++
      if (fixedCount % 50 === 0) {
        console.log(`Fixed ${fixedCount} files...`)
      }
    }
  }

  console.log(`\n✅ Fixed ${fixedCount} out of ${totalCount} MDX files`)
}

main().catch(console.error)
