import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export interface LicenseProps {
  licenseName?: string
  licenseUrl?: string
  licenseImageUrl?: string
  description?: string
  licenseDocsHref?: string
  attributionDocsHref?: string
  className?: string
}

export function License({
  licenseName = 'CC BY-SA 4.0',
  licenseUrl = 'https://creativecommons.org/licenses/by-sa/4.0/',
  licenseImageUrl = '/images/cc-by.svg',
  description = 'All data is free to use under',
  licenseDocsHref = '/docs/license',
  attributionDocsHref = '/docs/attribution',
  className = ''
}: LicenseProps) {
  return (
    <section className={`container py-16 ${className}`}>
      <div className="max-w-7xl mx-auto">
        <Card>
          <CardContent className="py-12 text-center">
            <div className="flex justify-center mb-4">
              <img
                src={licenseImageUrl}
                alt={`${licenseName} License`}
                className="h-16 sm:h-12"
              />
            </div>
            <p className="text-lg mb-8">
              {description}{' '}
              <a
                href={licenseUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline font-medium"
              >
                {licenseName}
              </a>
            </p>
            <div className="flex flex-col md:flex-row gap-2 sm:gap-4 justify-center w-full md:w-auto">
              <Link href={attributionDocsHref} className="w-full md:w-auto">
                <Button variant="default" size="lg" className="w-full">How to Attribute</Button>
              </Link>
              <Link href={licenseDocsHref} className="w-full md:w-auto">
                <Button variant="outline" size="lg" className="w-full">View License</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  )
}
