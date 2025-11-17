import Link from 'next/link'
import { RiTwitterXFill } from 'react-icons/ri'
import { SiHuggingface, SiNpm } from 'react-icons/si'
import { MdArrowOutward } from 'react-icons/md'
import { Separator } from '@/components/ui/separator'

export interface FooterLink {
  name: string
  href: string
}

export interface FooterSection {
  title: string
  links: FooterLink[]
  columns?: number
}

export interface FooterProps {
  siteName?: string
  siteUrl?: string
  sections?: FooterSection[]
  legalLinks?: FooterLink[]
  socialLinks?: {
    twitter?: string
  }
  platformLinks?: {
    huggingface?: string
    npm?: string
  }
  className?: string
}

export function Footer({
  siteName = 'Schema.org.ai',
  siteUrl = '/',
  sections = [],
  legalLinks = [
    { name: 'License', href: '/docs/license' },
    { name: 'Attribution', href: '/docs/attribution' },
  ],
  socialLinks = {},
  platformLinks = {},
  className = ''
}: FooterProps) {
  const currentYear = new Date().getFullYear()

  return (
    <section className={`py-16 ${className}`}>
      <div className="container">
        <div className="max-w-7xl mx-auto">
          <footer>
            <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
              <Link href={siteUrl} className="text-xl font-semibold">
                {siteName}
              </Link>

              {(platformLinks.huggingface || platformLinks.npm) && (
                <div className="flex flex-col gap-4 md:flex-row md:items-center">
                  <p className="text-base">Explore more on <span className="font-semibold">Hugging Face</span> and <span className="font-semibold">NPM</span></p>
                  <div className="flex gap-2">
                    {platformLinks.huggingface && (
                      <a
                        href={platformLinks.huggingface}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-primary inline-flex items-center justify-center rounded-lg p-2 hover:bg-primary/90 transition-colors"
                        aria-label="Hugging Face"
                      >
                        <SiHuggingface className="text-background size-6" />
                      </a>
                    )}
                    {platformLinks.npm && (
                      <a
                        href={platformLinks.npm}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-primary inline-flex items-center justify-center rounded-lg p-2 hover:bg-primary/90 transition-colors"
                        aria-label="NPM"
                      >
                        <SiNpm className="text-background size-6" />
                      </a>
                    )}
                  </div>
                </div>
              )}
            </div>

            {sections.filter(s => s.columns === 6).length > 0 && (
              <>
                <Separator className="my-14" />
                <div className="grid gap-8 grid-cols-2 md:grid-cols-3 lg:grid-cols-6">
                  {sections.filter(s => s.columns === 6).map((section, sectionIdx) => (
                    <div key={sectionIdx}>
                      <h3 className="mb-4 font-bold">{section.title}</h3>
                      <ul className="text-muted-foreground space-y-4">
                        {section.links.map((link, linkIdx) => (
                          <li
                            key={linkIdx}
                            className="hover:text-primary font-medium group text-sm"
                          >
                            <Link href={link.href} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1">
                              {link.name}
                              <MdArrowOutward className="size-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </>
            )}

            {(sections.some(s => s.columns !== 6) || legalLinks.length > 0 || socialLinks.twitter) && (
              <>
                <Separator className="my-14" />
                <div className="grid gap-8 grid-cols-2 md:grid-cols-2 lg:grid-cols-6">
                  {sections.filter(s => s.columns !== 6).map((section, sectionIdx) => (
                    <div key={sectionIdx}>
                      <h3 className="mb-4 font-bold">{section.title}</h3>
                      <ul className="text-muted-foreground space-y-4">
                        {section.links.map((link, linkIdx) => (
                          <li
                            key={linkIdx}
                            className="hover:text-primary font-medium text-sm"
                          >
                            <Link href={link.href}>{link.name}</Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}

                  {legalLinks.length > 0 && (
                    <div>
                      <h3 className="mb-4 font-bold">Legal</h3>
                      <ul className="text-muted-foreground space-y-3">
                        {legalLinks.map((link, idx) => (
                          <li key={idx} className="hover:text-primary font-medium text-sm">
                            <Link href={link.href}>{link.name}</Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {socialLinks.twitter && (
                    <div>
                      <h3 className="mb-4 font-bold">Social</h3>
                      <ul className="text-muted-foreground flex items-center space-x-6">
                        <li className="hover:text-primary font-medium text-sm">
                          <a href={socialLinks.twitter} target="_blank" rel="noopener noreferrer" aria-label="Twitter/X">
                            <RiTwitterXFill className="size-6" />
                          </a>
                        </li>
                      </ul>
                    </div>
                  )}
                </div>
              </>
            )}

            <Separator className="my-14" />
            <div className="flex flex-col gap-2 items-center md:flex-row md:justify-between space-y-4 sm:space-y-0">
              <p className="text-muted-foreground text-sm">
                © {currentYear} {siteName}. All rights reserved.
              </p>
              <p className="text-muted-foreground text-sm">
                Brought to you by <span className="ml-1 font-semibold text-foreground/90 px-1 py-1.5 rounded-full bg-linear-to-r from-muted-foreground/10 to-background">.do</span>
              </p>
            </div>
          </footer>
        </div>
      </div>
    </section>
  )
}
