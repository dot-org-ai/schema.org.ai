#!/usr/bin/env tsx
/**
 * Generate meta.json files for Fumadocs hierarchical navigation
 * Creates sidebar structure based on Schema.org type inheritance
 */

import fs from 'fs/promises'
import path from 'path'
import matter from 'gray-matter'

interface TypeMetadata {
  name: string
  description: string
  $id: string
  subClassOf: string[]
}

interface MetaItem {
  title: string
  pages?: string[]
  type?: 'separator'
}

async function loadAllTypes(typesDir: string): Promise<Map<string, TypeMetadata>> {
  const types = new Map<string, TypeMetadata>()
  const files = await fs.readdir(typesDir)

  for (const file of files) {
    if (!file.endsWith('.mdx')) continue

    const filePath = path.join(typesDir, file)
    const content = await fs.readFile(filePath, 'utf-8')
    const { data } = matter(content)

    const typeName = file.replace('.mdx', '')
    types.set(typeName, {
      name: data.name || typeName,
      description: data.description || '',
      $id: data.$id || '',
      subClassOf: data.subClassOf || []
    })
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

  // Sort alphabetically
  return children.sort()
}

async function generateMetaForType(
  typeName: string,
  types: Map<string, TypeMetadata>,
  outputDir: string
): Promise<void> {
  const children = getDirectChildren(typeName, types)

  if (children.length === 0) {
    // Leaf node - no meta.json needed
    return
  }

  // Create directory for this type's children
  const typeDir = path.join(outputDir, typeName)
  await fs.mkdir(typeDir, { recursive: true })

  // Generate meta.json with children
  const meta: MetaItem[] = [
    {
      title: typeName,
      pages: [typeName] // Self-reference
    },
    {
      type: 'separator'
    }
  ]

  // Add direct children
  for (const child of children) {
    const childMetadata = types.get(child)
    if (childMetadata) {
      // Check if child has its own children
      const grandchildren = getDirectChildren(child, types)

      if (grandchildren.length > 0) {
        // Has children - will be a folder
        meta.push({
          title: child,
          pages: [`${typeName}/${child}`]
        })
      } else {
        // Leaf node - direct page
        meta.push({
          title: child,
          pages: [child]
        })
      }
    }
  }

  const metaPath = path.join(typeDir, 'meta.json')
  await fs.writeFile(metaPath, JSON.stringify(meta, null, 2), 'utf-8')

  console.log(`Generated meta.json for ${typeName} (${children.length} children)`)

  // Recursively generate meta.json for children with grandchildren
  for (const child of children) {
    const grandchildren = getDirectChildren(child, types)
    if (grandchildren.length > 0) {
      await generateMetaForType(child, types, typeDir)
    }
  }
}

async function generateRootMeta(types: Map<string, TypeMetadata>, outputDir: string): Promise<void> {
  const rootChildren = getDirectChildren('Thing', types)

  const meta: MetaItem[] = [
    {
      title: 'Types',
      pages: ['index']
    },
    {
      type: 'separator'
    },
    {
      title: 'Thing',
      pages: ['Thing']
    },
    {
      type: 'separator'
    }
  ]

  // Add direct children of Thing
  for (const child of rootChildren) {
    const childMetadata = types.get(child)
    if (childMetadata) {
      const grandchildren = getDirectChildren(child, types)

      if (grandchildren.length > 0) {
        meta.push({
          title: child,
          pages: [`Thing/${child}`]
        })
      } else {
        meta.push({
          title: child,
          pages: [child]
        })
      }
    }
  }

  const metaPath = path.join(outputDir, 'meta.json')
  await fs.writeFile(metaPath, JSON.stringify(meta, null, 2), 'utf-8')

  console.log(`Generated root meta.json with ${rootChildren.length} top-level types`)
}

async function main() {
  const typesDir = path.join(__dirname, '../content/docs')

  console.log('Loading all Schema.org types...')
  const types = await loadAllTypes(typesDir)
  console.log(`Loaded ${types.size} types`)

  console.log('\nGenerating root meta.json...')
  await generateRootMeta(types, typesDir)

  console.log('\nGenerating hierarchical meta.json files...')
  await generateMetaForType('Thing', types, typesDir)

  console.log('\n✅ Done! Generated meta.json files for hierarchical navigation')
}

main().catch(console.error)
