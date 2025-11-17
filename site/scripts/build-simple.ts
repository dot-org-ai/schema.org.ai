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

  // Copy shared assets
  const sharedCSS = `
body {
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  max-width: 900px;
  margin: 0 auto;
  padding: 2rem;
  line-height: 1.6;
  color: #333;
}
h1 { margin-top: 0; }
nav {
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #ddd;
}
nav a {
  margin-right: 1rem;
  text-decoration: none;
  color: #0066cc;
}
.metadata {
  background: #f8f9fa;
  padding: 1.5rem;
  border-radius: 8px;
  margin: 2rem 0;
  border-left: 4px solid #0066cc;
}
.metadata p {
  margin: 0.5rem 0;
}
code {
  background: #f0f0f0;
  padding: 0.2rem 0.4rem;
  border-radius: 3px;
  font-size: 0.9em;
}
pre {
  background: #f5f5f5;
  padding: 1rem;
  border-radius: 4px;
  overflow-x: auto;
}
`

  await fs.writeFile(path.join(outDir, 'style.css'), sharedCSS)

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
  <link rel="stylesheet" href="style.css">
</head>
<body>
  <nav>
    <a href="index.html">Home</a>
    <a href="Thing.html">Thing</a>
    <a href="${slug}.json">JSON</a>
    <a href="${slug}.md">Markdown</a>
  </nav>

  <h1>${metadata.name}</h1>

  <div class="metadata">
    <p><strong>Type:</strong> ${metadata.$type}</p>
    <p><strong>ID:</strong> <code>${metadata.$id}</code></p>
    <p><strong>Subclass of:</strong> ${subClassOfHTML}</p>
    <p><strong>Description:</strong> ${metadata.description}</p>
  </div>

  <div class="content">
    <h2>Details</h2>
    <pre>${markdown}</pre>
  </div>
</body>
</html>`
}

function generateIndex(types: any[]): string {
  const typeCards = types.map(t => `
    <div class="type-card">
      <h3><a href="${t.slug}.html">${t.name}</a></h3>
      <p>${t.description?.substring(0, 120) || ''}...</p>
      <div class="links">
        <a href="${t.slug}.html">HTML</a> |
        <a href="${t.slug}.json">JSON</a> |
        <a href="${t.slug}.md">MD</a>
      </div>
    </div>
  `).join('\n')

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>schema.org.ai - Schema.org Types</title>
  <link rel="stylesheet" href="style.css">
  <style>
    .search {
      margin: 2rem 0;
      width: 100%;
    }
    .search input {
      width: 100%;
      padding: 0.75rem;
      font-size: 1.1rem;
      border: 2px solid #ddd;
      border-radius: 8px;
    }
    .search input:focus {
      outline: none;
      border-color: #0066cc;
    }
    .types {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: 1.5rem;
      margin-top: 2rem;
    }
    .type-card {
      border: 1px solid #ddd;
      padding: 1.5rem;
      border-radius: 8px;
      transition: box-shadow 0.2s;
    }
    .type-card:hover {
      box-shadow: 0 4px 12px rgba(0,0,0,0.1);
    }
    .type-card h3 {
      margin: 0 0 0.5rem 0;
    }
    .type-card h3 a {
      text-decoration: none;
      color: #0066cc;
    }
    .type-card p {
      margin: 0 0 1rem 0;
      font-size: 0.9rem;
      color: #666;
    }
    .links {
      font-size: 0.85rem;
      color: #999;
    }
    .links a {
      color: #0066cc;
      text-decoration: none;
    }
  </style>
</head>
<body>
  <h1>schema.org.ai</h1>
  <p>${types.length} Schema.org Types | <a href="types.json">Download JSON</a></p>

  <div class="search">
    <input type="text" id="search" placeholder="Search types by name or description..." />
  </div>

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
        '<div class="type-card">' +
          '<h3><a href="' + t.slug + '.html">' + t.name + '</a></h3>' +
          '<p>' + ((t.description || '').substring(0, 120) || '') + '...</p>' +
          '<div class="links">' +
            '<a href="' + t.slug + '.html">HTML</a> | ' +
            '<a href="' + t.slug + '.json">JSON</a> | ' +
            '<a href="' + t.slug + '.md">MD</a>' +
          '</div>' +
        '</div>'
      ).join('');
    });
  </script>
</body>
</html>`
}

buildSite().catch(console.error)
