#!/usr/bin/env tsx
/**
 * Build static site for GitHub Pages
 * Compiles MDX to HTML + generates JSON for search
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
  subClassOf?: string[]
  title: string
}

interface TypeData {
  metadata: TypeMetadata
  html: string
  slug: string
}

async function buildStaticSite() {
  const docsDir = path.join(process.cwd(), 'content/docs')
  const outDir = path.join(process.cwd(), 'out')
  
  // Clean output directory
  await fs.rm(outDir, { recursive: true, force: true })
  await fs.mkdir(outDir, { recursive: true })
  
  // Find all MDX files
  const files = await glob('*.mdx', { cwd: docsDir })
  console.log(`Found ${files.length} MDX files`)
  
  const types: TypeData[] = []
  
  // Process each MDX file
  for (const file of files) {
    const filePath = path.join(docsDir, file)
    const content = await fs.readFile(filePath, 'utf-8')
    const { data, content: mdxContent } = matter(content)
    
    const slug = file.replace('.mdx', '')
    
    // Simple MDX to HTML (just use the content as-is for now)
    const html = mdxContent
    
    types.push({
      metadata: data as TypeMetadata,
      html,
      slug
    })
    
    // Generate HTML page
    const htmlPage = generateHTMLPage(data as TypeMetadata, html, slug)
    await fs.writeFile(path.join(outDir, `${slug}.html`), htmlPage)
  }
  
  // Generate index.html
  const indexHTML = generateIndexPage(types)
  await fs.writeFile(path.join(outDir, 'index.html'), indexHTML)
  
  // Generate JSON API
  const apiData = types.map(t => ({
    slug: t.slug,
    name: t.metadata.name,
    description: t.metadata.description,
    subClassOf: t.metadata.subClassOf || []
  }))
  await fs.writeFile(
    path.join(outDir, 'api.json'),
    JSON.stringify(apiData, null, 2)
  )
  
  console.log(`✅ Generated ${types.length} pages`)
  console.log(`✅ Output: ${outDir}`)
}

function generateHTMLPage(metadata: TypeMetadata, content: string, slug: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${metadata.title || metadata.name} - schema.org.ai</title>
  <meta name="description" content="${metadata.description}">
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      max-width: 800px;
      margin: 0 auto;
      padding: 2rem;
      line-height: 1.6;
    }
    h1 { color: #333; }
    .metadata {
      background: #f5f5f5;
      padding: 1rem;
      border-radius: 4px;
      margin: 1rem 0;
    }
    .content {
      margin-top: 2rem;
    }
    pre {
      background: #f5f5f5;
      padding: 1rem;
      overflow-x: auto;
    }
  </style>
</head>
<body>
  <nav>
    <a href="/">← Home</a> | 
    <a href="Thing.html">Thing</a>
  </nav>
  
  <h1>${metadata.name}</h1>
  
  <div class="metadata">
    <p><strong>Type:</strong> ${metadata.$type}</p>
    <p><strong>ID:</strong> <code>${metadata.$id}</code></p>
    ${metadata.subClassOf ? `<p><strong>Subclass of:</strong> ${Array.isArray(metadata.subClassOf) ? metadata.subClassOf.map(c => `<a href="${c}.html">${c}</a>`).join(', ') : `<a href="${metadata.subClassOf}.html">${metadata.subClassOf}</a>`}</p>` : ''}
    <p>${metadata.description}</p>
  </div>
  
  <div class="content">
    <pre>${content}</pre>
  </div>
</body>
</html>`
}

function generateIndexPage(types: TypeData[]): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>schema.org.ai - Schema.org Types</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      max-width: 1200px;
      margin: 0 auto;
      padding: 2rem;
    }
    .search {
      margin: 2rem 0;
    }
    .search input {
      width: 100%;
      padding: 0.5rem;
      font-size: 1rem;
      border: 1px solid #ddd;
      border-radius: 4px;
    }
    .types {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
      gap: 1rem;
      margin-top: 2rem;
    }
    .type-card {
      border: 1px solid #ddd;
      padding: 1rem;
      border-radius: 4px;
    }
    .type-card h3 {
      margin: 0 0 0.5rem 0;
    }
    .type-card p {
      margin: 0;
      font-size: 0.9rem;
      color: #666;
    }
  </style>
</head>
<body>
  <h1>schema.org.ai</h1>
  <p>${types.length} Schema.org types</p>
  
  <div class="search">
    <input type="text" id="search" placeholder="Search types..." />
  </div>
  
  <div class="types" id="types">
    ${types.map(t => `
      <div class="type-card">
        <h3><a href="${t.slug}.html">${t.metadata.name}</a></h3>
        <p>${t.metadata.description?.substring(0, 100)}...</p>
      </div>
    `).join('\n')}
  </div>
  
  <script>
    const types = ${JSON.stringify(types.map(t => ({ slug: t.slug, name: t.metadata.name, description: t.metadata.description })))};
    
    document.getElementById('search').addEventListener('input', (e) => {
      const query = e.target.value.toLowerCase();
      const filtered = types.filter(t => 
        t.name.toLowerCase().includes(query) || 
        t.description?.toLowerCase().includes(query)
      );
      
      document.getElementById('types').innerHTML = filtered.map(t =>
        '<div class="type-card">' +
          '<h3><a href="' + t.slug + '.html">' + t.name + '</a></h3>' +
          '<p>' + (t.description?.substring(0, 100) || '') + '...</p>' +
        '</div>'
      ).join('');
    });
  </script>
</body>
</html>`
}

buildStaticSite().catch(console.error)
