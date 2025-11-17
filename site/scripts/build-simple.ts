#!/usr/bin/env tsx
/**
 * Simple static site generator for GitHub Pages
 * Outputs: .html, .md, .json for each type
 */

import fs from 'fs/promises'
import path from 'path'
import matter from 'gray-matter'
import { glob } from 'glob'

interface TypeMetadata {
  $id: string
  $type: string
  name: string
  description: string
  subClassOf?: string | string[]
  title: string
}

interface TypeNode {
  name: string
  slug: string
  children: TypeNode[]
}

function buildHierarchy(types: any[]): TypeNode {
  const typeMap = new Map<string, TypeNode>()

  // First pass: create all nodes
  types.forEach(t => {
    typeMap.set(t.name, {
      name: t.name,
      slug: t.slug,
      children: []
    })
  })

  // Create root node for Thing
  const root: TypeNode = typeMap.get('Thing') || { name: 'Thing', slug: 'Thing', children: [] }

  // Second pass: build parent-child relationships
  types.forEach(t => {
    if (t.name === 'Thing') return // Skip root

    const node = typeMap.get(t.name)
    if (!node) return

    // Get parent (first subClassOf if array)
    const parentName = Array.isArray(t.subClassOf) ? t.subClassOf[0] : t.subClassOf

    if (parentName) {
      const parent = typeMap.get(parentName)
      if (parent) {
        parent.children.push(node)
      }
    }
  })

  // Sort children alphabetically at each level
  function sortChildren(node: TypeNode) {
    node.children.sort((a, b) => a.name.localeCompare(b.name))
    node.children.forEach(sortChildren)
  }
  sortChildren(root)

  return root
}

function generateSidebarHTML(node: TypeNode, currentSlug: string, ancestorSlugs: Set<string>, level: number = 0): string {
  const isCurrentPage = node.slug === currentSlug
  const hasChildren = node.children.length > 0
  const shouldBeOpen = ancestorSlugs.has(node.slug)

  if (!hasChildren) {
    // Leaf node - just a link
    return `
      <li>
        <a href="${node.slug}.html"${isCurrentPage ? ' aria-current="page"' : ''}>${node.name}</a>
      </li>`
  }

  // Node with children - use details element
  return `
    <li>
      <details${shouldBeOpen ? ' open' : ''}>
        <summary>
          <a href="${node.slug}.html"${isCurrentPage ? ' aria-current="page"' : ''}>${node.name}</a>
        </summary>
        <ul>
          ${node.children.map(child => generateSidebarHTML(child, currentSlug, ancestorSlugs, level + 1)).join('')}
        </ul>
      </details>
    </li>`
}

function getAncestorSlugs(types: any[], currentSlug: string): Set<string> {
  const ancestors = new Set<string>()
  const typeMap = new Map(types.map(t => [t.name, t]))

  let current = types.find(t => t.slug === currentSlug)
  while (current) {
    const parentName = Array.isArray(current.subClassOf) ? current.subClassOf[0] : current.subClassOf
    if (!parentName) break

    ancestors.add(parentName)
    current = typeMap.get(parentName)
  }

  return ancestors
}

async function buildSite() {
  const docsDir = path.join(process.cwd(), 'content/docs')
  const outDir = path.join(process.cwd(), 'out')

  // Clean and create output directory
  await fs.rm(outDir, { recursive: true, force: true })
  await fs.mkdir(outDir, { recursive: true })

  // Copy shared custom CSS (minimal overrides for Pico CSS)
  const customCSS = `
/* Pico CSS Documentation Layout */

/* Main Grid Layout - inspired by Pico CSS docs */
main {
  display: grid;
  grid-template-rows: 1fr;
  grid-template-columns: 1fr;
  grid-template-areas: "body";
  gap: 2rem;
}

/* Documentation Menu (Sidebar) */
aside#documentation-menu {
  grid-area: menu;
  position: sticky;
  top: 0;
  align-self: start;
  height: 100vh;
  overflow-y: auto;
  padding: var(--pico-block-spacing-vertical) 0;
  border-right: 1px solid var(--pico-muted-border-color);
}

aside#documentation-menu nav {
  padding-right: var(--pico-block-spacing-horizontal);
}

aside#documentation-menu nav > ul {
  padding: 0;
  margin: 0;
  list-style: none;
}

aside#documentation-menu li {
  margin-bottom: 0;
}

aside#documentation-menu details {
  margin-bottom: 0.5rem;
}

aside#documentation-menu summary {
  padding: 0.5rem 0;
  cursor: pointer;
  list-style: none;
  user-select: none;
  font-weight: 600;
  display: flex;
  align-items: center;
}

aside#documentation-menu summary::-webkit-details-marker {
  display: none;
}

aside#documentation-menu summary::before {
  content: '▶';
  display: inline-block;
  width: 1rem;
  margin-right: 0.5rem;
  font-size: 0.75rem;
  transition: transform 0.2s ease;
  flex-shrink: 0;
}

aside#documentation-menu details[open] > summary::before {
  transform: rotate(90deg);
}

aside#documentation-menu a {
  display: block;
  padding: 0.5rem 0 0.5rem 1.5rem;
  text-decoration: none;
  color: var(--pico-color);
  transition: background-color 0.2s ease;
  border-radius: var(--pico-border-radius);
  margin: 0.125rem 0;
}

aside#documentation-menu a:hover {
  background-color: var(--pico-secondary-hover);
}

aside#documentation-menu a[aria-current="page"] {
  background-color: var(--pico-primary);
  color: var(--pico-primary-inverse);
  font-weight: 600;
}

aside#documentation-menu ul ul {
  padding-left: 0;
  margin-top: 0.25rem;
  margin-bottom: 0.5rem;
}

aside#documentation-menu header {
  padding: 0 var(--pico-block-spacing-horizontal) var(--pico-block-spacing-vertical);
  border-bottom: 1px solid var(--pico-muted-border-color);
  margin-bottom: var(--pico-block-spacing-vertical);
}

aside#documentation-menu header h2 {
  margin: 0;
  font-size: 1.25rem;
}

aside#documentation-menu header p {
  margin: 0;
  font-size: 0.875rem;
  color: var(--pico-muted-color);
}

/* Main Content Area */
#main-body {
  grid-area: body;
  padding: var(--pico-block-spacing-vertical) var(--pico-block-spacing-horizontal);
  max-width: 65ch;
}

#main-body nav {
  margin-bottom: var(--pico-block-spacing-vertical);
}

/* Metadata Card */
.metadata {
  background: var(--pico-card-background-color);
  padding: var(--pico-block-spacing-vertical) var(--pico-block-spacing-horizontal);
  border-radius: var(--pico-border-radius);
  margin: var(--pico-block-spacing-vertical) 0;
  border-left: 4px solid var(--pico-primary);
}

.metadata p {
  margin: 0.5rem 0;
}

/* Type Cards for Index Page */
.types {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
  margin-top: 2rem;
}

.type-card {
  background: var(--pico-card-background-color);
  border: 1px solid var(--pico-muted-border-color);
  padding: var(--pico-block-spacing-vertical) var(--pico-block-spacing-horizontal);
  border-radius: var(--pico-border-radius);
  transition: box-shadow 0.2s ease;
}

.type-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.type-card h3 {
  margin: 0 0 0.5rem 0;
}

.type-card p {
  margin: 0 0 1rem 0;
  font-size: 0.9rem;
  color: var(--pico-muted-color);
}

.links {
  font-size: 0.85rem;
  color: var(--pico-muted-color);
}

/* Large screens (≥1024px) - Two column layout with sidebar */
@media (min-width: 1024px) {
  main {
    grid-template-columns: 16rem 1fr;
    grid-template-areas:
      "menu body";
    gap: 3rem;
  }
}

/* Extra large screens (≥1280px) - Wider gaps */
@media (min-width: 1280px) {
  main {
    grid-template-columns: 18rem 1fr;
    gap: 4rem;
  }
}

/* Mobile - Stack vertically */
@media (max-width: 1023px) {
  aside#documentation-menu {
    position: relative;
    height: auto;
    border-right: none;
    border-bottom: 1px solid var(--pico-muted-border-color);
    padding-bottom: var(--pico-block-spacing-vertical);
  }

  #main-body {
    max-width: 100%;
  }
}
`

  await fs.writeFile(path.join(outDir, 'custom.css'), customCSS)

  // Find all MDX files
  const files = await glob('*.mdx', { cwd: docsDir })
  console.log(`Found ${files.length} MDX files`)

  const allTypes: any[] = []
  const typeData = new Map<string, { metadata: TypeMetadata, mdContent: string }>()

  // First pass: collect all types
  for (const file of files) {
    const filePath = path.join(docsDir, file)
    const content = await fs.readFile(filePath, 'utf-8')
    const { data, content: mdContent } = matter(content)

    const slug = file.replace('.mdx', '')
    const metadata = data as TypeMetadata

    typeData.set(slug, { metadata, mdContent })

    allTypes.push({
      slug,
      name: metadata.name,
      description: metadata.description,
      subClassOf: metadata.subClassOf
    })
  }

  // Build hierarchy
  const hierarchy = buildHierarchy(allTypes)

  // Second pass: generate all output files with sidebar
  for (const [slug, { metadata, mdContent }] of typeData) {
    // Save JSON
    await fs.writeFile(
      path.join(outDir, `${slug}.json`),
      JSON.stringify(metadata, null, 2)
    )

    // Save MD (clean markdown)
    await fs.writeFile(
      path.join(outDir, `${slug}.md`),
      mdContent
    )

    // Save HTML with sidebar
    const ancestorSlugs = getAncestorSlugs(allTypes, slug)
    const sidebarHTML = generateSidebarHTML(hierarchy, slug, ancestorSlugs)
    const html = generateHTML(metadata, mdContent, slug, sidebarHTML)
    await fs.writeFile(
      path.join(outDir, `${slug}.html`),
      html
    )
  }

  // Generate index page
  const indexHTML = generateIndex(allTypes)
  await fs.writeFile(path.join(outDir, 'index.html'), indexHTML)

  // Save types.json for search
  await fs.writeFile(
    path.join(outDir, 'types.json'),
    JSON.stringify(allTypes, null, 2)
  )

  console.log(`✅ Generated ${files.length} types`)
  console.log(`   - ${files.length} HTML files`)
  console.log(`   - ${files.length} MD files`)
  console.log(`   - ${files.length} JSON files`)
  console.log(`✅ Output directory: ${outDir}`)
}

function generateHTML(metadata: TypeMetadata, markdown: string, slug: string, sidebarHTML: string): string {
  const subClassOfHTML = metadata.subClassOf
    ? Array.isArray(metadata.subClassOf)
      ? metadata.subClassOf.map(c => `<a href="${c}.html">${c}</a>`).join(', ')
      : `<a href="${metadata.subClassOf}.html">${metadata.subClassOf}</a>`
    : 'None'

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${metadata.title || metadata.name} - schema.org.ai</title>
  <meta name="description" content="${metadata.description}">
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@picocss/pico@2/css/pico.min.css">
  <link rel="stylesheet" href="custom.css">
</head>
<body>
  <main class="container-fluid">
    <aside id="documentation-menu">
      <header>
        <h2><a href="index.html" style="text-decoration: none; color: inherit;">schema.org.ai</a></h2>
        <p>Schema.org Types</p>
      </header>
      <nav>
        <ul>
          ${sidebarHTML}
        </ul>
      </nav>
    </aside>

    <section id="main-body">
      <nav aria-label="breadcrumb">
        <ul>
          <li><a href="index.html">Home</a></li>
          <li><a href="${slug}.json">JSON</a></li>
          <li><a href="${slug}.md">Markdown</a></li>
        </ul>
      </nav>

      <h1>${metadata.name}</h1>

      <article class="metadata">
        <p><strong>Type:</strong> ${metadata.$type}</p>
        <p><strong>ID:</strong> <code>${metadata.$id}</code></p>
        <p><strong>Subclass of:</strong> ${subClassOfHTML}</p>
        <p><strong>Description:</strong> ${metadata.description}</p>
      </article>

      <article class="content">
        <h2>Details</h2>
        <pre><code>${markdown}</code></pre>
      </article>
    </section>
  </main>
</body>
</html>`
}

function generateIndex(types: any[]): string {
  // Sort types alphabetically
  const sortedTypes = [...types].sort((a, b) => a.name.localeCompare(b.name))

  const typeCards = sortedTypes.map(t => `
    <article class="type-card">
      <h3><a href="${t.slug}.html">${t.name}</a></h3>
      <p>${t.description?.substring(0, 120) || ''}...</p>
      <footer class="links">
        <a href="${t.slug}.html">HTML</a> |
        <a href="${t.slug}.json">JSON</a> |
        <a href="${t.slug}.md">MD</a>
      </footer>
    </article>
  `).join('\n')

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>schema.org.ai - Schema.org Types</title>
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@picocss/pico@2/css/pico.min.css">
  <link rel="stylesheet" href="custom.css">
  <style>
    .types {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: 1.5rem;
      margin-top: 2rem;
    }
  </style>
</head>
<body>
  <main class="container">
    <h1>schema.org.ai</h1>
    <p>${types.length} Schema.org Types | <a href="types.json">Download JSON</a></p>

    <input type="search" id="search" placeholder="Search types by name or description..." />

    <div class="types" id="types">
      ${typeCards}
    </div>

    <script>
      const allTypes = ${JSON.stringify(sortedTypes)};

      document.getElementById('search').addEventListener('input', (e) => {
        const query = e.target.value.toLowerCase();
        const filtered = query
          ? allTypes.filter(t =>
              t.name.toLowerCase().includes(query) ||
              (t.description || '').toLowerCase().includes(query)
            )
          : allTypes;

        document.getElementById('types').innerHTML = filtered.map(t =>
          '<article class="type-card">' +
            '<h3><a href="' + t.slug + '.html">' + t.name + '</a></h3>' +
            '<p>' + ((t.description || '').substring(0, 120) || '') + '...</p>' +
            '<footer class="links">' +
              '<a href="' + t.slug + '.html">HTML</a> | ' +
              '<a href="' + t.slug + '.json">JSON</a> | ' +
              '<a href="' + t.slug + '.md">MD</a>' +
            '</footer>' +
          '</article>'
        ).join('');
      });
    </script>
  </main>
</body>
</html>`
}

buildSite().catch(console.error)
