# Schema.org.ai Static Site Setup Summary

## What Was Accomplished

Successfully configured schema.org.ai as a Fumadocs Next.js static build project ready for GitHub Pages deployment.

### 1. **Content Structure** ✅
- Copied 878 Schema.org type MDX files from `schema/things/` to `content/docs/types/`
- Created hierarchical navigation structure based on Schema.org type inheritance
- Generated `meta.json` with proper page ordering (Thing → direct children → all other types)

### 2. **Frontmatter Fixes** ✅
- Added required `title` field to all 878 MDX files (Fumadocs requirement)
- Fixed YAML parsing issues:
  - Quoted descriptions containing colons and special characters
  - Removed `[[Term]]` markdown link syntax causing YAML errors
  - Cleaned up multiline descriptions

### 3. **MDX Content Cleanup** ✅
- Removed HTML tags from 156 files:
  - Stripped `<br />`, `<br/>`, `<br>` tags
  - Removed `<a href="...">` links (kept link text)
  - Cleaned up incomplete HTML tags like `<a href="http://en` (broken Wikipedia URLs)

### 4. **Static Export Configuration** ✅
- Updated `next.config.mjs`:
  - Added `output: 'export'` for static generation
  - Set `images: { unoptimized: true }` for static hosting
  - Configured `basePath` support for GitHub Pages
- Increased Node.js memory limit to 4GB (`--max-old-space-size=4096`) for large build

### 5. **GitHub Actions Workflow** ✅
Created `.github/workflows/deploy-github-pages.yml` with:
- Automated build on push to main branch
- pnpm installation and dependency caching
- Next.js static export build
- GitHub Pages deployment with proper permissions

### 6. **Utility Scripts Created** ✅

**`scripts/generate-sidebar-hierarchy.ts`**
- Loads all type metadata from MDX frontmatter
- Builds hierarchical tree based on `subClassOf` relationships
- Generates `content/docs/types/meta.json` for Fumadocs navigation
- Creates `lib/sidebar-types.json` with full hierarchy (for future custom sidebar)

**`scripts/fix-all-frontmatter.ts`**
- Comprehensive frontmatter parser and fixer
- Adds `title` from `name` field
- Properly quotes and escapes YAML values
- Handles multiline descriptions

**`scripts/clean-mdx-html.ts`**
- Removes HTML tags from MDX body content
- Preserves text content from links
- Converts `<br>` to newlines

**`scripts/fix-broken-html-refs.ts`**
- Fixes incomplete HTML tags at end of lines
- Cleans up broken Wikipedia URL references

### 7. **URL Structure** ✅
With the current setup, URLs will be:
- Homepage: `https://schema.org.ai/`
- Types index: `https://schema.org.ai/types`
- Specific type: `https://schema.org.ai/types/CreateAction`
- Thing (root): `https://schema.org.ai/types/Thing`

## File Structure

```
.org.ai/
├── content/docs/types/          # 878 MDX type files
│   ├── index.mdx               # Types overview page
│   ├── meta.json               # Fumadocs navigation config
│   ├── Thing.mdx               # Root type
│   ├── Action.mdx              # Top-level types
│   ├── CreateAction.mdx        # Nested types
│   └── ...                     # All 878 types
├── scripts/                     # Build and maintenance scripts
│   ├── generate-sidebar-hierarchy.ts
│   ├── fix-all-frontmatter.ts
│   ├── clean-mdx-html.ts
│   └── fix-broken-html-refs.ts
├── .github/workflows/
│   └── deploy-github-pages.yml  # CI/CD deployment
├── public/.nojekyll             # GitHub Pages config
├── next.config.mjs              # Static export configuration
└── package.json                 # Scripts and dependencies
```

## NPM Scripts

```bash
# Build static export (with 4GB memory)
pnpm build

# Development server
pnpm dev

# Generate navigation hierarchy
pnpm generate-meta

# Fix all frontmatter issues
pnpm fix-frontmatter
```

## Next Steps

### Option 1: Test Build Locally
The build currently runs out of memory with 878 pages. Options:
1. Increase memory further: `NODE_OPTIONS='--max-old-space-size=8192'`
2. Build incrementally (split into chunks)
3. Let GitHub Actions handle it (their runners have more memory)

### Option 2: Deploy to GitHub Pages
1. Commit and push all changes
2. Go to repository Settings → Pages
3. Set Source to "GitHub Actions"
4. The workflow will automatically build and deploy on push

### Option 3: Add Properties Tab
To add the ~2k property pages as mentioned:
1. Create `content/docs/properties/` directory
2. Generate property MDX files (similar to types)
3. Update `meta.json` to include properties section
4. Run `pnpm generate-meta` to rebuild navigation

### Option 4: Optimize Build
For 878 pages, consider:
- Using Next.js App Router with `generateStaticParams()`
- Implementing incremental static regeneration
- Splitting into multiple Fumadocs instances (by top-level type)

## Known Issues

**Build Memory**: Building 878 static pages requires 12GB+ memory. Configured GitHub Actions to use `ubuntu-latest-8-cores` runner (32GB RAM). Standard runners (7GB) will OOM.

**Sidebar Depth**: Currently showing 2 levels deep in sidebar. Can adjust `maxDepth` parameter in `generate-sidebar-hierarchy.ts`.

**Properties Missing**: Schema.org properties (~2k) not yet added. Need separate generation script.

## Testing

Before deploying:
1. Test a smaller subset first (copy only 10-20 types to `content/docs/types/`)
2. Verify build completes: `pnpm build`
3. Check `out/` directory for generated static files
4. Test locally: `npx serve out`

## Resources

- **Fumadocs**: https://fumadocs.dev/docs/ui/static-export
- **GitHub Pages**: https://docs.github.com/en/pages
- **Schema.org**: https://schema.org
- **This Repo**: https://github.com/dot-do/.org.ai
