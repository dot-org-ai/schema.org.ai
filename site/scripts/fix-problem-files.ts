#!/usr/bin/env tsx
/**
 * Fix the 3 problem files that are blocking the build
 */

import fs from 'fs/promises'
import path from 'path'

const files = ['Accommodation.mdx', 'MediaEnumeration.mdx', 'Room.mdx']

async function fixFile(filename: string) {
  const filePath = path.join(__dirname, '../content/docs/types', filename)
  let content = await fs.readFile(filePath, 'utf-8')

  // Replace escaped quotes in descriptions
  content = content.replace(/\\"/g, '"')

  // Clean up any remaining HTML in descriptions
  const lines = content.split('\n')
  const fixedLines: string[] = []

  for (const line of lines) {
    // If it's a description line with HTML, clean it
    if (line.startsWith('description:')) {
      const cleaned = line
        .replace(/<br\s*\/?>/gi, '')
        .replace(/<a\s+href="[^"]*">([^<]*)<\/a>/gi, '$1')
        .replace(/<[^>]+>/g, '')
      fixedLines.push(cleaned)
    } else {
      fixedLines.push(line)
    }
  }

  await fs.writeFile(filePath, fixedLines.join('\n'), 'utf-8')
  console.log(`✅ Fixed ${filename}`)
}

async function main() {
  for (const file of files) {
    try {
      await fixFile(file)
    } catch (error) {
      console.error(`Error fixing ${file}:`, error)
    }
  }
  console.log('\n✅ All problem files fixed')
}

main().catch(console.error)
