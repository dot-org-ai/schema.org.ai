#!/usr/bin/env tsx
/**
 * Clean HTML tags from MDX body content
 */

import fs from 'fs/promises'
import path from 'path'

async function cleanHtmlTags(filePath: string): Promise<boolean> {
  const content = await fs.readFile(filePath, 'utf-8')

  // Find frontmatter bounds
  if (!content.startsWith('---\n')) return false

  const secondDivider = content.indexOf('\n---\n', 4)
  if (secondDivider === -1) return false

  const frontmatter = content.substring(0, secondDivider + 5)
  let body = content.substring(secondDivider + 5)

  // Clean HTML tags from body
  const originalBody = body

  // Remove <br />, <br/>, <br>
  body = body.replace(/<br\s*\/?>/gi, '\n')

  // Remove <a href="...">text</a> - keep text
  body = body.replace(/<a\s+href="[^"]*">([^<]*)<\/a>/gi, '$1')

  // Remove any other HTML tags
  body = body.replace(/<[^>]+>/g, '')

  // Remove [[term]] markdown links - keep term
  body = body.replace(/\[\[([^\]]+)\]\]/g, '$1')

  if (body !== originalBody) {
    await fs.writeFile(filePath, frontmatter + body, 'utf-8')
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

    try {
      const wasFixed = await cleanHtmlTags(filePath)

      if (wasFixed) {
        fixedCount++
        if (fixedCount % 50 === 0) {
          console.log(`Cleaned ${fixedCount} files...`)
        }
      }
    } catch (error) {
      console.error(`Error cleaning ${file}:`, error)
    }
  }

  console.log(`\n✅ Cleaned HTML from ${fixedCount} out of ${totalCount} MDX files`)
}

main().catch(console.error)
