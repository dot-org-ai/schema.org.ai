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

async function buildSite() {
  const docsDir = path.join(process.cwd(), 'content/docs')
  const outDir = path.join(process.cwd(), 'out')

  // Clean and create output directory
  await fs.rm(outDir, { recursive: true, force: true })
  await fs.mkdir(outDir, { recursive: true })

  // Copy shared custom CSS (minimal overrides for Pico CSS)
  const customCSS = `
/* Custom overrides for Pico CSS */
.metadata {
  background: var(--pico-card-background-color);
  padding: 1.5rem;
  border-radius: var(--pico-border-radius);
  margin: 2rem 0;
  border-left: 4px solid var(--pico-primary);
}
.metadata p {
  margin: 0.5rem 0;
}
.type-card {
  background: var(--pico-card-background-color);
  border: 1px solid var(--pico-muted-border-color);
  padding: 1.5rem;
  border-radius: var(--pico-border-radius);
  transition: box-shadow 0.2s;
}
.type-card:hover {
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
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
`

  await fs.writeFile(path.join(outDir, 'custom.css'), customCSS)

  // Find all MDX files
  const files = await glob('*.mdx', { cwd: docsDir })
  console.log(`Found ${files.length} MDX files`)

  const allTypes: any[] = []

  // Process each file
  for (const file of files) {
    const filePath = path.join(docsDir, file)
    const content = await fs.readFile(filePath, 'utf-8')
    const { data, content: mdContent } = matter(content)

    const slug = file.replace('.mdx', '')
    const metadata = data as TypeMetadata

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

    // Save HTML
    const html = generateHTML(metadata, mdContent, slug)
    await fs.writeFile(
      path.join(outDir, `${slug}.html`),
      html
    )

    allTypes.push({
      slug,
      name: metadata.name,
      description: metadata.description,
      subClassOf: metadata.subClassOf
    })
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

function generateHTML(metadata: TypeMetadata, markdown: string, slug: string): string {
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
  <main class="container">
    <nav>
      <ul>
        <li><strong>schema.org.ai</strong></li>
      </ul>
      <ul>
        <li><a href="index.html">Home</a></li>
        <li><a href="Thing.html">Thing</a></li>
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
  </main>
</body>
</html>`
}

function generateIndex(types: any[]): string {
  const typeCards = types.map(t => `
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
      const allTypes = ${JSON.stringify(types)};

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
