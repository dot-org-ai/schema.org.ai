import { ArrowRight } from 'lucide-react'

export interface AboutColumn {
  title: string
  content: string | React.ReactNode
}

export interface AboutProps {
  title?: string
  domain?: string
  introduction?: string | string[]
  columns?: AboutColumn[]
  ctaText?: string
  ctaHref?: string
  className?: string
}

export function About({
  title,
  domain,
  introduction,
  columns = [],
  ctaText = 'Explore the Documentation',
  ctaHref = '/docs',
  className = ''
}: AboutProps) {
  const renderIntroduction = () => {
    if (!introduction) return null

    if (Array.isArray(introduction)) {
      return (
        <div className="max-w-3xl mx-auto space-y-4 mb-12">
          {introduction.map((paragraph, index) => (
            <p key={index} className="text-lg text-muted-foreground text-center leading-relaxed">
              {paragraph}
            </p>
          ))}
        </div>
      )
    }

    return (
      <div className="max-w-3xl mx-auto mb-12">
        <p className="text-lg text-muted-foreground text-center leading-relaxed">
          {introduction}
        </p>
      </div>
    )
  }

  return (
    <section className={`container py-16 md:py-24 border-t ${className}`}>
      <div className="max-w-7xl mx-auto">
        {/* Section Title */}
        <h2 className="text-3xl font-medium text-left mb-8 md:mb-12">
          {title ? (
            title
          ) : domain ? (
            <>
              What is <span className="text-primary font-semibold">{domain}</span>?
            </>
          ) : (
            'About'
          )}
        </h2>

        {/* Introductory Prose */}
        {renderIntroduction()}

        {/* Two Column Layout */}
        {columns.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 mb-12">
            {columns.map((column, index) => (
              <div key={index} className="space-y-4">
                <div className="text-muted-foreground leading-relaxed">
                  {typeof column.content === 'string' ? (
                    <p>{column.content}</p>
                  ) : (
                    column.content
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* CTA Button */}
        <div className="flex justify-start">
          <a
            href={ctaHref}
            className="group inline-flex items-center gap-2 text-base font-medium text-foreground hover:text-primary transition-colors"
          >
            {ctaText}
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </a>
        </div>
      </div>
    </section>
  )
}
