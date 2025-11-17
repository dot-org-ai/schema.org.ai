#!/usr/bin/env tsx
/**
 * Fix broken HTML references like: <a href="http://en
 */

import fs from 'fs/promises'
import path from 'path'

async function fixBrokenHtml(filePath: string): Promise<boolean> {
  let content = await fs.readFile(filePath, 'utf-8')
  const original = content

  // Fix incomplete <a href tags
  content = content.replace(/<a\s+href="[^"]*$/gm, '')

  // Fix any other incomplete HTML tags
  content = content.replace(/<[^>]*$/gm, '')

  if (content !== original) {
    await fs.writeFile(filePath, content, 'utf-8')
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

    try {
      const wasFixed = await fixBrokenHtml(filePath)

      if (wasFixed) {
        fixedCount++
      }
    } catch (error) {
      console.error(`Error fixing ${file}:`, error)
    }
  }

  console.log(`✅ Fixed ${fixedCount} out of ${totalCount} MDX files with broken HTML`)
}

main().catch(console.error)
