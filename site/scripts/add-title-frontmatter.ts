#!/usr/bin/env tsx
/**
 * Add title field to frontmatter from name field
 */

import fs from 'fs/promises'
import path from 'path'

async function addTitleField(filePath: string): Promise<boolean> {
  const content = await fs.readFile(filePath, 'utf-8')

  // Check if file has frontmatter
  if (!content.startsWith('---\n')) return false

  const lines = content.split('\n')
  let inFrontmatter = false
  let frontmatterEnd = -1
  let hasTitle = false
  let nameValue = ''

  const fixedLines: string[] = []

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]

    if (line === '---') {
      if (i === 0) {
        fixedLines.push(line)
        inFrontmatter = true
        continue
      } else if (inFrontmatter) {
        // Add title if we found name but no title
        if (!hasTitle && nameValue) {
          fixedLines.push(`title: ${nameValue}`)
        }
        fixedLines.push(line)
        frontmatterEnd = i
        inFrontmatter = false
        continue
      }
    }

    if (inFrontmatter) {
      if (line.startsWith('title:')) {
        hasTitle = true
      } else if (line.startsWith('name:')) {
        const match = line.match(/^name:\s*(.+)$/)
        if (match) {
          nameValue = match[1].trim()
        }
      }
    }

    fixedLines.push(line)
  }

  if (!hasTitle && nameValue) {
    await fs.writeFile(filePath, fixedLines.join('\n'), 'utf-8')
    return true
  }

  return false
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
    const wasFixed = await addTitleField(filePath)

    if (wasFixed) {
      fixedCount++
      if (fixedCount % 100 === 0) {
        console.log(`Fixed ${fixedCount} files...`)
      }
    }
  }

  console.log(`\n✅ Added title to ${fixedCount} out of ${totalCount} MDX files`)
}

main().catch(console.error)
