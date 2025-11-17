#!/usr/bin/env tsx
/**
 * Generate Fumadocs sidebar hierarchy from Schema.org types
 * Creates a hierarchical sidebar based on type inheritance
 */

import fs from 'fs/promises'
import path from 'path'
import matter from 'gray-matter'

interface TypeMetadata {
  name: string
  description: string
  subClassOf: string[]
}

interface SidebarItem {
  text: string
  url: string
  items?: SidebarItem[]
}

async function loadAllTypes(typesDir: string): Promise<Map<string, TypeMetadata>> {
  const types = new Map<string, TypeMetadata>()
  const files = await fs.readdir(typesDir)

  for (const file of files) {
    if (!file.endsWith('.mdx')) continue

    const filePath = path.join(typesDir, file)
    const content = await fs.readFile(filePath, 'utf-8')

    try {
      const { data } = matter(content)

      const typeName = file.replace('.mdx', '')
      types.set(typeName, {
        name: data.name || typeName,
        description: data.description || '',
        subClassOf: Array.isArray(data.subClassOf) ? data.subClassOf : []
      })
    } catch (error) {
      console.warn(`Warning: Could not parse frontmatter for ${file}, skipping...`)
      // Still add the type with minimal metadata
      const typeName = file.replace('.mdx', '')
      types.set(typeName, {
        name: typeName,
        description: '',
        subClassOf: []
      })
    }
  }

  return types
}

function getDirectChildren(parentName: string, types: Map<string, TypeMetadata>): string[] {
  const children: string[] = []

  for (const [typeName, metadata] of types) {
    if (metadata.subClassOf && metadata.subClassOf.includes(parentName)) {
      children.push(typeName)
    }
  }

  return children.sort()
}

function buildSidebarTree(
  typeName: string,
  types: Map<string, TypeMetadata>,
  depth: number = 0,
  maxDepth: number = 3
): SidebarItem | null {
  const metadata = types.get(typeName)
  if (!metadata) return null

  const children = getDirectChildren(typeName, types)

  const item: SidebarItem = {
    text: typeName,
    url: `/types/${typeName}`
  }

  // Only include children up to maxDepth to avoid overly nested sidebar
  if (children.length > 0 && depth < maxDepth) {
    item.items = children
      .map(child => buildSidebarTree(child, types, depth + 1, maxDepth))
      .filter((item): item is SidebarItem => item !== null)
  }

  return item
}

async function generateMetaJson(types: Map<string, TypeMetadata>, outputDir: string): Promise<void> {
  // Build hierarchy starting from Thing
  const rootChildren = getDirectChildren('Thing', types)

  // Create a simple meta.json with flat structure (Fumadocs will organize by folder)
  const pages = [
    'index',
    '---',
    'Thing'
  ]

  // Add all direct children of Thing
  for (const child of rootChildren) {
    pages.push(child)
  }

  // Add separator
  pages.push('---')

  // Add all other types (not Thing or its direct children)
  const allTypes = Array.from(types.keys()).sort()
  const topLevel = new Set(['Thing', ...rootChildren])

  for (const typeName of allTypes) {
    if (!topLevel.has(typeName)) {
      pages.push(typeName)
    }
  }

  const meta = {
    title: 'Types',
    pages
  }

  const metaPath = path.join(outputDir, 'meta.json')
  await fs.writeFile(metaPath, JSON.stringify(meta, null, 2), 'utf-8')

  console.log(`✅ Generated meta.json with ${pages.length} pages`)
}

async function generateSidebarConfig(types: Map<string, TypeMetadata>, outputPath: string): Promise<void> {
  const rootChildren = getDirectChildren('Thing', types)

  const sidebar: SidebarItem[] = [
    {
      text: 'Thing',
      url: '/types/Thing',
      items: rootChildren
        .map(child => buildSidebarTree(child, types, 1, 2))
        .filter((item): item is SidebarItem => item !== null)
    }
  ]

  await fs.writeFile(outputPath, JSON.stringify(sidebar, null, 2), 'utf-8')

  console.log(`✅ Generated sidebar config with hierarchy`)
}

async function main() {
  const typesDir = path.join(__dirname, '../content/docs/types')

  console.log('Loading all Schema.org types...')
  const types = await loadAllTypes(typesDir)
  console.log(`Loaded ${types.size} types`)

  console.log('\nGenerating meta.json...')
  await generateMetaJson(types, typesDir)

  console.log('\nGenerating sidebar hierarchy...')
  const sidebarPath = path.join(__dirname, '../lib/sidebar-types.json')
  await generateSidebarConfig(types, sidebarPath)

  console.log('\n✅ Done!')
  console.log('\nTypes loaded:')
  const rootChildren = getDirectChildren('Thing', types)
  console.log(`  - Thing (root)`)
  rootChildren.forEach(child => {
    const grandchildren = getDirectChildren(child, types)
    console.log(`    - ${child} (${grandchildren.length} subclasses)`)
  })
}

main().catch(console.error)
