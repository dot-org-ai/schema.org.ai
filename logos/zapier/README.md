# Zapier Service Logos

This directory contains PNG logos for Zapier services, downloaded from the Zapier CDN.

## Directory Structure

```
zapier/
├── README.md              # This file
├── manifest.json          # Download metadata and manifest
├── priority/              # Top 100 most popular services
│   ├── Gmail.png
│   ├── Slack.png
│   ├── HubSpot.png
│   └── ...
└── all/                   # All remaining services
    ├── Airtable.png
    ├── Notion.png
    └── ...
```

## Naming Convention

Logos are named using TitleCase format for easy reference:
- `google-sheets` → `GoogleSheets.png`
- `microsoft-outlook` → `MicrosoftOutlook.png`
- `hubspot-crm` → `HubspotCrm.png`

## Download Script

Location: `/Users/nathanclevenger/projects/.org.ai/schema/scripts/download-zapier-logos.ts`

### Usage

```bash
# Download all logos with default settings
./download-zapier-logos.ts

# Download only priority services (top 100)
./download-zapier-logos.ts --priority-only

# Adjust batch size and rate limiting
./download-zapier-logos.ts --batch-size=25 --rate-limit=200

# Combination
./download-zapier-logos.ts --priority-only --batch-size=10 --rate-limit=500
```

### Options

- `--batch-size=N` - Download N logos per batch (default: 50)
- `--rate-limit=MS` - Wait MS milliseconds between batches (default: 100)
- `--priority-only` - Only download priority services (default: false)

### Features

- ✅ **Resume capability** - Skips already downloaded logos
- ✅ **Rate limiting** - Respects Zapier CDN with configurable delays
- ✅ **Error handling** - Retries failed downloads up to 3 times
- ✅ **Progress tracking** - Real-time progress with size information
- ✅ **Manifest generation** - Creates detailed metadata file
- ✅ **Priority sorting** - Downloads popular services first
- ✅ **Timeout protection** - 30-second timeout per download

## Manifest Format

The `manifest.json` file contains:

```json
{
  "downloaded": "2025-11-17",
  "totalServices": 7155,
  "successfulDownloads": 6890,
  "failed": 265,
  "priorityDownloads": 100,
  "estimatedSize": "145.2 MB",
  "logos": [
    {
      "service": "Gmail",
      "zapierSlug": "gmail",
      "filename": "Gmail.png",
      "size": "32.5 KB",
      "dimensions": "256x256",
      "url": "https://cdn.zapier.com/storage/services/...",
      "category": "Email",
      "isPriority": true
    }
  ],
  "errors": [
    {
      "service": "OldService",
      "zapierSlug": "old-service",
      "url": "https://cdn.zapier.com/...",
      "error": "HTTP 404"
    }
  ]
}
```

## Data Sources

The script uses multiple data sources to compile the service list:

1. **apps.json** - Has icon URLs for 16+ popular apps
   - Location: `/Users/nathanclevenger/projects/.org.ai/platform/sites/integrations.org.ai/data/apps.json`
   - Contains: App metadata with Zapier CDN icon URLs

2. **nouns-cleaned.json** - Service slugs from Zapier vocabulary
   - Location: `/Users/nathanclevenger/projects/.org.ai/platform/packages/integrations/data/zapier/nouns-cleaned.json`
   - Contains: 9,334 unique service slugs

3. **Priority list** - Top 100 curated popular services
   - Hardcoded in script configuration
   - Based on Zapier directory and SimpleIcons coverage

## Limitations

1. **Logo URL Discovery**
   - Only ~16 apps have confirmed icon URLs in apps.json
   - The remaining 9,300+ services need logo URL discovery
   - Zapier CDN uses hashed filenames, not predictable slugs

2. **Missing Logo URLs**
   - Services without URLs in apps.json won't be downloaded
   - May need to scrape Zapier directory or use Zapier API

3. **Rate Limiting**
   - Default settings are conservative (100ms between batches)
   - Adjust based on your needs and Zapier CDN tolerance

## Recommendations for Execution

### Phase 1: Test Run (Priority Only)
```bash
./download-zapier-logos.ts --priority-only --batch-size=10
```
- Downloads: ~16 logos (services with known URLs)
- Time: ~2-3 minutes
- Size: ~500 KB - 1 MB
- Purpose: Verify script works correctly

### Phase 2: Full Download (If URLs Available)
```bash
./download-zapier-logos.ts --batch-size=50 --rate-limit=100
```
- Downloads: All services with icon URLs
- Time: Depends on URL availability
- Size: Unknown (need URL discovery first)
- Purpose: Download all available logos

### Phase 3: URL Discovery (Needed)
To download all 9,334 services, you'll need to:

1. **Scrape Zapier Directory**
   - Visit zapier.com/apps
   - Extract logo URLs from app pages
   - Map slugs to CDN URLs

2. **Use Zapier Platform API**
   - API endpoint: `https://api.zapier.com/v1/apps`
   - Requires API key
   - Returns app metadata including icons

3. **Reverse Engineer CDN Pattern**
   - Zapier uses hashed filenames
   - Pattern: `https://cdn.zapier.com/storage/services/{hash}.png`
   - May need to extract hashes from directory HTML

## Next Steps

1. ✅ **Script created** - Ready to download logos with known URLs
2. ⏳ **URL discovery needed** - Expand coverage beyond 16 apps
3. ⏳ **Test execution** - Run with `--priority-only` first
4. ⏳ **Full download** - After URL discovery is complete
5. ⏳ **Manifest review** - Check for errors and missing logos

## Related Files

- Download script: `/Users/nathanclevenger/projects/.org.ai/schema/scripts/download-zapier-logos.ts`
- Apps data: `/Users/nathanclevenger/projects/.org.ai/platform/sites/integrations.org.ai/data/apps.json`
- Services data: `/Users/nathanclevenger/projects/.org.ai/platform/packages/integrations/data/zapier/nouns-cleaned.json`
- Zapier utilities: `/Users/nathanclevenger/projects/.org.ai/platform/packages/integrations/data/zapier/zapier-utilities.json`

## License

Zapier logos are property of their respective service providers. Use in accordance with Zapier's terms of service and for integration/development purposes only.
