'use client'

import Link from 'next/link'
import { IconType } from 'react-icons'
import { SiHuggingface, SiNpm, SiClaude } from 'react-icons/si'
import { TbApi } from 'react-icons/tb'

export interface AccessMethod {
  name: string
  icon: IconType
  href: string
  external?: boolean
}

export interface AccessMethodsProps {
  title?: string
  description?: string
  methods?: AccessMethod[]
  className?: string
}

const defaultAccessMethods: AccessMethod[] = [
  {
    name: 'Hugging Face',
    icon: SiHuggingface,
    href: 'https://huggingface.co/datasets/dotdo/schema-org-ai',
    external: true,
  },
  {
    name: 'NPM Package',
    icon: SiNpm,
    href: 'https://npmjs.com/package/schema.org.ai',
    external: true,
  },
  {
    name: 'REST API',
    icon: TbApi,
    href: '/docs/api',
    external: false,
  },
  {
    name: 'MCP Server',
    icon: SiClaude,
    href: '/docs/mcp',
    external: false,
  },
]

export function AccessMethods({
  title = 'Access Your Way',
  description = 'Choose how you want to integrate into your workflow',
  methods = defaultAccessMethods,
  className = ''
}: AccessMethodsProps) {
  return (
    <section className={`container py-16 md:py-32 border-t ${className}`}>
      <div className="max-w-7xl mx-auto space-y-12">
        {/* Header */}
        <div className="flex flex-col gap-4 text-center">
          <h2 className="text-[28px] leading-[38px] sm:text-[35px] sm:leading-[42px] tracking-[-0.025em] font-medium">
            {title}
          </h2>
          <span className="opacity-70 text-[17px] md:text-xl tracking-[-0.16px] text-muted-foreground">
            {description}
          </span>
        </div>

        {/* Icons Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10 lg:gap-12 max-w-4xl mx-auto">
          {methods.map((method) => {
            const Icon = method.icon
            const Component = method.external ? 'a' : Link
            const props = method.external
              ? { href: method.href, target: '_blank', rel: 'noopener noreferrer' }
              : { href: method.href }

            return (
              <Component
                key={method.name}
                {...props}
                className="flex flex-col items-center justify-center gap-3 group"
              >
                <div className="flex items-center w-20 h-20 shrink-0 justify-center bg-linear-to-b dark:from-zinc-800 dark:to-zinc-950 from-zinc-100 to-zinc-200 rounded-[18px] shadow-[0px_32px_64px_-16px_transparent,0px_16px_32px_-8px_transparent,0px_8px_16px_-4px_transparent,0px_4px_8px_-2px_transparent,0px_-8px_16px_-1px_transparent,0px_2px_4px_-1px_transparent,0px_0px_0px_1px_transparent,inset_0px_0px_0px_1px_rgba(255,255,255,0.1),inset_0px_1px_0px_rgb(255,255,255,0.15)] transition-transform group-hover:scale-105">
                  <Icon className="w-10 h-10 text-foreground/90 group-hover:text-foreground transition-colors" />
                </div>
                <span className="opacity-90 font-[460] tracking-tight text-base text-muted-foreground group-hover:text-foreground transition-colors">
                  {method.name}
                </span>
              </Component>
            )
          })}
        </div>
      </div>
    </section>
  )
}
