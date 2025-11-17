'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Search, X } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useDebounce } from '@/lib/hooks/use-debounce'

export interface QuickAction {
  id: string
  label: string
  href?: string
}

export interface SearchResult {
  id: string
  type: 'Type' | 'Property' | 'Action'
  title: string
  description: string
  icon?: string
  path: string
}

export interface HeroStats {
  types?: number
  properties?: number
  actions?: number
  customStats?: Array<{ label: string; value: number | string }>
}

export interface HeroProps {
  title: string
  description: string
  stats?: HeroStats
  searchPlaceholder?: string
  searchApiEndpoint?: string
  quickActions?: QuickAction[]
  onSearchResultClick?: (result: SearchResult) => void
  showSearch?: boolean
  className?: string
}

export function Hero({
  title,
  description,
  stats,
  searchPlaceholder = 'Search...',
  searchApiEndpoint = '/api/search/schema',
  quickActions = [],
  onSearchResultClick,
  showSearch = true,
  className = ''
}: HeroProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<SearchResult[]>([])
  const [showDropdown, setShowDropdown] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const debouncedQuery = useDebounce(searchQuery, 300)

  useEffect(() => {
    async function search() {
      if (debouncedQuery.length > 0) {
        setIsLoading(true)
        try {
          const response = await fetch(`${searchApiEndpoint}?q=${encodeURIComponent(debouncedQuery)}`)
          const data = await response.json() as { results?: SearchResult[] }
          setSearchResults(data.results || [])
          setShowDropdown(true)
        } catch (error) {
          console.error('Search error:', error)
          setSearchResults([])
        } finally {
          setIsLoading(false)
        }
      } else {
        setSearchResults([])
        setShowDropdown(false)
      }
    }
    search()
  }, [debouncedQuery, searchApiEndpoint])

  const handleResultClick = (result: SearchResult) => {
    setShowDropdown(false)
    setSearchQuery('')
    onSearchResultClick?.(result)
  }

  const handleClearSearch = () => {
    setSearchQuery('')
    setShowDropdown(false)
  }

  const renderStats = () => {
    if (!stats) return null

    const statItems: string[] = []

    if (stats.types) statItems.push(`${stats.types} types`)
    if (stats.properties) statItems.push(`${stats.properties} properties`)
    if (stats.actions) statItems.push(`${stats.actions} actions`)

    if (stats.customStats) {
      stats.customStats.forEach(stat => {
        statItems.push(`${stat.value} ${stat.label}`)
      })
    }

    // Add fixed stats
    statItems.push('JSON-LD Ready')
    statItems.push('Open Source')

    return statItems.map((item, index) => (
      <span key={index}>
        {item}
        {index < statItems.length - 1 && (
          <span className="text-muted-foreground/40 mx-2">•</span>
        )}
      </span>
    ))
  }

  return (
    <section className={`container py-16 md:py-32 min-h-[80vh] flex items-center ${className}`}>
      <div className="flex flex-col items-center text-center max-w-5xl mx-auto w-full">
        {/* Title */}
        <h1 className="text-5xl md:text-6xl font-semibold mb-3">
          {title}
        </h1>

        {/* Description */}
        <p className="text-lg text-muted-foreground mb-8 text-balance max-w-3xl mx-auto">
          {description}
        </p>

        {/* Stats */}
        {/* {stats && (
          <div className="relative mb-8">
            <div className="absolute inset-0 bg-linear-to-r from-background via-muted/20 to-background" />
            <p className="relative text-sm dark:text-muted-foreground/60 text-muted-foreground font-mono px-4 py-2">
              {renderStats()}
            </p>
          </div>
        )} */}

        {/* Search */}
        {showSearch && (
          <div className="relative w-full max-w-2xl mb-8">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              type="text"
              placeholder={searchPlaceholder}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-12 pl-10 pr-10 text-base shadow-lg"
              aria-label="Search"
            />
            {searchQuery && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClearSearch}
                className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 p-0"
                aria-label="Clear search"
              >
                <X className="h-4 w-4" />
              </Button>
            )}

            {/* Search Dropdown */}
            {showDropdown && (
              <div className="absolute top-full mt-2 w-full bg-card border rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto">
                {isLoading ? (
                  <div className="p-4 text-center text-muted-foreground">
                    Loading...
                  </div>
                ) : searchResults.length > 0 ? (
                  searchResults.map((result) => (
                    <Link
                      key={result.id}
                      href={result.path}
                      className="group flex items-start gap-3 p-3 hover:bg-accent/40 transition-colors border-b last:border-b-0"
                      onClick={() => handleResultClick(result)}
                    >
                      <div className="flex-1 min-w-0 text-left">
                        <div className="font-medium pb-1 text-base">{result.title}</div>
                        <div className="text-xs text-muted-foreground/80 truncate">
                          {result.description}
                        </div>
                      </div>
                      <Badge variant="secondary" className="text-xs group-hover:bg-background/80 group-hover:border group-hover:border-background transition-colors">
                        {result.type}
                      </Badge>
                    </Link>
                  ))
                ) : (
                  <div className="p-4 text-center text-muted-foreground">
                    No results found
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Quick Actions */}
        {quickActions.length > 0 && (
          <div className="flex flex-wrap items-center justify-center gap-2 max-w-2xl">
            {quickActions.map((action) => (
              <Link key={action.id} href={action.href || `/docs/${action.id}`} className="group">
                <Badge
                  variant="secondary"
                  className="px-4 py-1.5 text-sm text-foreground/60 cursor-pointer bg-linear-to-b dark:from-zinc-800 dark:to-zinc-950 from-zinc-100 to-zinc-200 rounded-[18px] shadow-[0px_32px_64px_-16px_transparent,0px_16px_32px_-8px_transparent,0px_8px_16px_-4px_transparent,0px_4px_8px_-2px_transparent,0px_-8px_16px_-1px_transparent,0px_2px_4px_-1px_transparent,0px_0px_0px_1px_transparent,inset_0px_0px_0px_1px_rgba(255,255,255,0.1),inset_0px_1px_0px_rgb(255,255,255,0.15)] border-none! dark:ring-1 dark:ring-white/10 ring-1 ring-black/10 group-hover:text-foreground dark:group-hover:ring-white/30 group-hover:ring-black/30 transition-all duration-200"
                >
                  {action.label}
                </Badge>
              </Link>
            ))}
          </div>
        )}

        {/* Stats */}
        {stats && (
          <div className="relative mt-8">
            <div className="absolute inset-0 bg-linear-to-r from-background via-muted/10 to-background" />
            <p className="relative text-sm dark:text-muted-foreground/60 text-muted-foreground font-mono px-4 py-2">
              {renderStats()}
            </p>
          </div>
        )}

      </div>
    </section>
  )
}
