# Build Notes

## Memory Requirements

Building 878 static pages requires significant memory:

- **6GB**: Out of memory during static generation
- **12GB+**: Recommended for successful build

### Local Development

For local builds with your 96GB machine:

```bash
NODE_OPTIONS='--max-old-space-size=12288' pnpm build
```

### GitHub Actions

The workflow is configured to use `ubuntu-latest-8-cores` runner which provides:
- **8 CPU cores**
- **32GB RAM**
- **14GB SSD**

This should handle the build with 12GB memory allocation.

## Alternative: Incremental Build

If memory issues persist, consider these approaches:

### 1. Split by Top-Level Type

Build separate Fumadocs instances for each top-level category:
- `/types/action/` - All Action subclasses
- `/types/creative-work/` - All CreativeWork subclasses
- `/types/event/` - All Event subclasses
- etc.

### 2. Use App Router with ISR

Switch to Next.js App Router with Incremental Static Regeneration:
- Only generate popular pages at build time
- Generate others on-demand
- Cache with revalidation

### 3. Reduce Page Count

Start with just the top 2-3 levels of hierarchy:
- Thing → 10 direct children → ~50 grandchildren
- Defer deeper nesting to client-side navigation

## Current Status

✅ All 878 MDX files processed and cleaned
✅ Hierarchical navigation generated
✅ GitHub Actions workflow configured
❌ Local build OOM (needs 12GB+)
⏳ GitHub Actions build pending

## Testing Recommendation

Test with a subset first:

```bash
# Move most files temporarily
mkdir ../types-backup
mv content/docs/types/[B-Z]*.mdx ../types-backup/

# Build with ~100 files
pnpm build

# Check output
ls -lh out/types/
```

This will help verify the build process before committing to the full 878-page build.
