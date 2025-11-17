import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { Badge } from '@/components/ui/badge'

export interface FaqItem {
  question: string
  answer: string
}

export interface FaqCategory {
  title: string
  items: FaqItem[]
}

export interface FaqProps {
  title?: string
  categories: FaqCategory[]
  className?: string
}

export function Faq({
  title = 'Frequently asked questions',
  categories,
  className = ''
}: FaqProps) {
  return (
    <section className={`container py-16 md:py-24 border-t ${className}`}>
      <div className="max-w-7xl mx-auto">
        <h2 className="text-3xl font-medium text-left mb-8 md:mb-12">
          {title}
        </h2>
        {categories.map((category, categoryIndex) => (
          <div
            key={categoryIndex}
            className={`grid gap-4 border-t border-border/40 pt-4 md:grid-cols-3 md:gap-10 ${
              categoryIndex > 0 ? 'mt-10' : ''
            }`}
          >
            <div>
              <Badge variant="secondary" className="text-sm font-medium px-2 py-1">
                {category.title}
              </Badge>
            </div>
            <Accordion type="multiple" className="md:col-span-2">
              {category.items.map((faq, index) => (
                <AccordionItem
                  key={index}
                  value={`item-${categoryIndex}-${index}`}
                  className="border-b border-border/40 last:border-b-0"
                >
                  <AccordionTrigger className="text-left text-base">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground leading-relaxed text-base">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        ))}
      </div>
    </section>
  )
}
