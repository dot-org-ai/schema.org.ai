import { NextRequest, NextResponse } from 'next/server'

export interface SearchResult {
  id: string
  type: 'Type' | 'Property' | 'Action'
  title: string
  description: string
  icon?: string
  path: string
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const query = searchParams.get('q')

  if (!query) {
    return NextResponse.json({ results: [] })
  }

  // TODO: Implement actual search logic
  // This is a placeholder - replace with your Elasticsearch/vector search
  const results = await searchSchemaEntities(query)

  return NextResponse.json({
    results,
    searchType: 'fulltext', // or 'semantic'
    totalResults: results.length
  })
}

async function searchSchemaEntities(query: string): Promise<SearchResult[]> {
  // Placeholder implementation
  // Replace with actual database/search query

  // Mock data for demonstration
  const mockData: SearchResult[] = [
    {
      id: 'Thing',
      type: 'Type',
      title: 'Thing',
      description: 'The most generic type of item.',
      icon: '🧩',
      path: '/docs/Thing'
    },
    {
      id: 'Person',
      type: 'Type',
      title: 'Person',
      description: 'A person (alive, dead, undead, or fictional).',
      icon: '👤',
      path: '/docs/Person'
    },
    {
      id: 'Organization',
      type: 'Type',
      title: 'Organization',
      description: 'An organization such as a school, NGO, corporation, club, etc.',
      icon: '🏢',
      path: '/docs/Organization'
    }
  ]

  // Simple filter for demo - replace with actual search
  return mockData.filter(item =>
    item.title.toLowerCase().includes(query.toLowerCase()) ||
    item.description.toLowerCase().includes(query.toLowerCase())
  )
}
