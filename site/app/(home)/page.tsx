import { Hero } from '@/components/hero';
import { About } from '@/components/about';
import { AccessMethods } from '@/components/access/access';
import { Faq } from '@/components/faq';
import { License } from '@/components/license';
import { Footer } from '@/components/footer';

const quickActions = [
  { id: 'Thing', label: 'Thing' },
  { id: 'Person', label: 'Person' },
  { id: 'Place', label: 'Place' },
  { id: 'Organization', label: 'Organization' },
  { id: 'Event', label: 'Event' },
  { id: 'Action', label: 'Action' },
  { id: 'Website', label: 'Website' },
  { id: 'Product', label: 'Product' },
  { id: 'CreativeWork', label: 'CreativeWork' },
  { id: 'BlogPosting', label: 'BlogPosting' },
];

export default function HomePage() {
  return (
    <div className="flex flex-col flex-1">
      <Hero
        title="Schema.org.ai"
        description="Structured data vocabulary powering semantic markup across the web—extended with AI-native primitives for agents, tools, and digital scoring."
        stats={{
          types: 817,
          properties: 1518,
          actions: 27
        }}
        searchPlaceholder="Search types and properties..."
        searchApiEndpoint="/api/search/schema"
        quickActions={quickActions}
        showSearch={true}
      />

      <About
        domain="Schema.org.ai"
        columns={[
          {
            title: "Semantic Web Foundation",
            content: "Built on Schema.org's proven vocabulary system, enabling machines to understand and process information about people, places, organizations, products, and events in a standardized way."
          },
          {
            title: "AI-Native Extensions",
            content: "New types and properties designed for autonomous agents, tool interactions, and digital reputation scoring—bridging traditional web semantics with modern AI capabilities."
          }
        ]}
      />

      <AccessMethods />

      <Faq
        categories={[
          {
            title: "Overview",
            items: [
              {
                question: "What is Schema.org.ai?",
                answer: "Schema.org.ai extends the Schema.org vocabulary with AI-native types and properties for autonomous agents, tool interactions, and digital reputation scoring. It provides structured data semantics designed specifically for AI systems and autonomous operations."
              },
              {
                question: "Which schema.org types, properties, and actions are included?",
                answer: "Schema.org.ai includes all core Schema.org types (817 types, 1,518 properties, 27 actions), plus pending and extension vocabularies. We also add AI-specific extensions for Agent, Tool, DigitalScore, and autonomous action types."
              },
              {
                question: "How often is the data synced and updated?",
                answer: "Our data is synchronized with the official Schema.org repository weekly. AI-native extensions are updated as they're developed and validated by the community, with changes documented in our changelog."
              }
            ]
          },
          {
            title: "Access, API & Tooling",
            items: [
              {
                question: "Do I need an account to browse the documentation?",
                answer: "No account is required to browse the documentation, search types and properties, or view examples. All content is freely accessible to everyone."
              },
              {
                question: "How do I access the API, MCP, or SDK?",
                answer: "Our API is publicly available with documented endpoints at /api/docs. The MCP (Model Context Protocol) server and SDK are available on GitHub. Rate limits are set at 1,000 requests per hour for unauthenticated access and 10,000 for authenticated users."
              },
              {
                question: "Are embeddings and datasets available on Hugging Face?",
                answer: "Yes! We publish vector embeddings, JSON-LD datasets, and fine-tuned models on Hugging Face. Available formats include Parquet, JSON-LD, and JSONL. Visit huggingface.co/schema-org-ai for all datasets and models."
              }
            ]
          },
          {
            title: "Licensing & Attribution",
            items: [
              {
                question: "Is Schema.org.ai free for commercial use?",
                answer: "Yes, Schema.org.ai is licensed under Creative Commons Attribution-ShareAlike 4.0 (CC BY-SA 4.0), allowing free commercial use with proper attribution. You can use, modify, and distribute the vocabulary in commercial products."
              },
              {
                question: "What license applies and what attribution is required?",
                answer: "All content is licensed under CC BY-SA 4.0. Required attribution: Include 'Based on Schema.org.ai (schema.org.ai), licensed under CC BY-SA 4.0' in your documentation or application. For web implementations, link back to schema.org.ai."
              },
              {
                question: "How should I attribute Schema.org.ai in my project?",
                answer: "Web: Add a footer link like 'Structured data powered by Schema.org.ai'. Documentation: Include 'This project uses Schema.org.ai vocabulary, licensed under CC BY-SA 4.0'. Code: Add attribution in README or LICENSE files. See our brand guidelines for logo usage and examples."
              },
              {
                question: "Can I bulk download or redistribute the vocabulary?",
                answer: "Yes, under CC BY-SA 4.0 terms. You may download, mirror, or redistribute the entire vocabulary with proper attribution. Derivatives must use the same CC BY-SA 4.0 license. We provide bulk exports in JSON-LD, Turtle, and RDF/XML formats."
              }
            ]
          }
        ]}
      />

      <License />

      <Footer
        siteName="Schema.org.ai"
        siteUrl="/"
        platformLinks={{
          huggingface: "https://huggingface.co/schema-org-ai",
          npm: "https://www.npmjs.com/package/@schema-org-ai/core"
        }}
        sections={[
          {
            title: "Business & Industry",
            links: [
              { name: 'business.org.ai', href: 'https://business.org.ai' },
              { name: 'enterprises.org.ai', href: 'https://enterprises.org.ai' },
              { name: 'startups.org.ai', href: 'https://startups.org.ai' },
              { name: 'companies.org.ai', href: 'https://companies.org.ai' },
              { name: 'vc.org.ai', href: 'https://vc.org.ai' },
              { name: 'industries.org.ai', href: 'https://industries.org.ai' },
              { name: 'manufacturing.org.ai', href: 'https://manufacturing.org.ai' },
              { name: 'retail.org.ai', href: 'https://retail.org.ai' },
              { name: 'automotive.org.ai', href: 'https://automotive.org.ai' },
              { name: 'consulting.org.ai', href: 'https://consulting.org.ai' },
              { name: 'hospitality.org.ai', href: 'https://hospitality.org.ai' },
              { name: 'logistics.org.ai', href: 'https://logistics.org.ai' },
              { name: 'transport.org.ai', href: 'https://transport.org.ai' },
              { name: 'finance.org.ai', href: 'https://finance.org.ai' },
              { name: 'insurance.org.ai', href: 'https://insurance.org.ai' },
              { name: 'law.org.ai', href: 'https://law.org.ai' },
              { name: 'legal.org.ai', href: 'https://legal.org.ai' },
              { name: 'services.org.ai', href: 'https://services.org.ai' },
              { name: 'process.org.ai', href: 'https://process.org.ai' },
              { name: 'apqc.org.ai', href: 'https://apqc.org.ai' },
              { name: 'management.org.ai', href: 'https://management.org.ai' },
              { name: 'engineering.org.ai', href: 'https://engineering.org.ai' },
              { name: 'organizations.org.ai', href: 'https://organizations.org.ai' },
            ],
            columns: 6
          },
          {
            title: "Tech & Development",
            links: [
              { name: 'code.org.ai', href: 'https://code.org.ai' },
              { name: 'ops.org.ai', href: 'https://ops.org.ai' },
              { name: 'tech.org.ai', href: 'https://tech.org.ai' },
              { name: 'apis.org.ai', href: 'https://apis.org.ai' },
              { name: 'mcp.org.ai', href: 'https://mcp.org.ai' },
              { name: 'agents.org.ai', href: 'https://agents.org.ai' },
              { name: 'functions.org.ai', href: 'https://functions.org.ai' },
              { name: 'workflows.org.ai', href: 'https://workflows.org.ai' },
              { name: 'tools.org.ai', href: 'https://tools.org.ai' },
              { name: 'robotics.org.ai', href: 'https://robotics.org.ai' },
              { name: 'agi.org.ai', href: 'https://agi.org.ai' },
              { name: 'models.org.ai', href: 'https://models.org.ai' },
              { name: 'datasets.org.ai', href: 'https://datasets.org.ai' },
              { name: 'primitives.org.ai', href: 'https://primitives.org.ai' },
              { name: 'actions.org.ai', href: 'https://actions.org.ai' },
              { name: 'triggers.org.ai', href: 'https://triggers.org.ai' },
              { name: 'design.org.ai', href: 'https://design.org.ai' },
              { name: 'security.org.ai', href: 'https://security.org.ai' },
            ],
            columns: 6
          },
          {
            title: "Knowledge & Data",
            links: [
              { name: 'schema.org.ai', href: 'https://schema.org.ai' },
              { name: 'semantics.org.ai', href: 'https://semantics.org.ai' },
              { name: 'wikipedia.org.ai', href: 'https://wikipedia.org.ai' },
              { name: 'wiki.org.ai', href: 'https://wiki.org.ai' },
              { name: 'knowledge.org.ai', href: 'https://knowledge.org.ai' },
              { name: 'context.org.ai', href: 'https://context.org.ai' },
              { name: 'types.org.ai', href: 'https://types.org.ai' },
              { name: 'properties.org.ai', href: 'https://properties.org.ai' },
              { name: 'graph.org.ai', href: 'https://graph.org.ai' },
              { name: 'ideas.org.ai', href: 'https://ideas.org.ai' },
              { name: 'searches.org.ai', href: 'https://searches.org.ai' },
              { name: 'units.org.ai', href: 'https://units.org.ai' },
              { name: 'naics.org.ai', href: 'https://naics.org.ai' },
              { name: 'soc.org.ai', href: 'https://soc.org.ai' },
              { name: 'onet.org.ai', href: 'https://onet.org.ai' },
              { name: 'gs1.org.ai', href: 'https://gs1.org.ai' },
              { name: 'gdpval.org.ai', href: 'https://gdpval.org.ai' },
              { name: 'education.org.ai', href: 'https://education.org.ai' },
              { name: 'courses.org.ai', href: 'https://courses.org.ai' },
            ],
            columns: 6
          },
          {
            title: "Content & Media",
            links: [
              { name: 'content.org.ai', href: 'https://content.org.ai' },
              { name: 'mdx.org.ai', href: 'https://mdx.org.ai' },
              { name: 'markdown.org.ai', href: 'https://markdown.org.ai' },
              { name: 'md.org.ai', href: 'https://md.org.ai' },
              { name: 'media.org.ai', href: 'https://media.org.ai' },
              { name: 'news.org.ai', href: 'https://news.org.ai' },
              { name: 'blog.org.ai', href: 'https://blog.org.ai' },
              { name: 'creative.org.ai', href: 'https://creative.org.ai' },
              { name: 'images.org.ai', href: 'https://images.org.ai' },
              { name: 'video.org.ai', href: 'https://video.org.ai' },
              { name: 'reports.org.ai', href: 'https://reports.org.ai' },
              { name: 'language.org.ai', href: 'https://language.org.ai' },
              { name: 'events.org.ai', href: 'https://events.org.ai' },
              { name: 'do.org.ai', href: 'https://do.org.ai' },
            ],
            columns: 6
          },
          {
            title: "Science & Research",
            links: [
              { name: 'science.org.ai', href: 'https://science.org.ai' },
              { name: 'research.org.ai', href: 'https://research.org.ai' },
              { name: 'health.org.ai', href: 'https://health.org.ai' },
              { name: 'chemicals.org.ai', href: 'https://chemicals.org.ai' },
              { name: 'molecules.org.ai', href: 'https://molecules.org.ai' },
              { name: 'genes.org.ai', href: 'https://genes.org.ai' },
              { name: 'species.org.ai', href: 'https://species.org.ai' },
              { name: 'elements.org.ai', href: 'https://elements.org.ai' },
              { name: 'materials.org.ai', href: 'https://materials.org.ai' },
              { name: 'energy.org.ai', href: 'https://energy.org.ai' },
              { name: 'instruments.org.ai', href: 'https://instruments.org.ai' },
              { name: 'equipment.org.ai', href: 'https://equipment.org.ai' },
              { name: 'vehicles.org.ai', href: 'https://vehicles.org.ai' },
              { name: 'places.org.ai', href: 'https://places.org.ai' },
              { name: 'things.org.ai', href: 'https://things.org.ai' },
            ],
            columns: 6
          },
          {
            title: "Work & People",
            links: [
              { name: 'people.org.ai', href: 'https://people.org.ai' },
              { name: 'roles.org.ai', href: 'https://roles.org.ai' },
              { name: 'work.org.ai', href: 'https://work.org.ai' },
              { name: 'jobs.org.ai', href: 'https://jobs.org.ai' },
              { name: 'skills.org.ai', href: 'https://skills.org.ai' },
              { name: 'tasks.org.ai', href: 'https://tasks.org.ai' },
              { name: 'activities.org.ai', href: 'https://activities.org.ai' },
              { name: 'contracts.org.ai', href: 'https://contracts.org.ai' },
              { name: 'schedules.org.ai', href: 'https://schedules.org.ai' },
              { name: 'offers.org.ai', href: 'https://offers.org.ai' },
              { name: 'payments.org.ai', href: 'https://payments.org.ai' },
              { name: 'products.org.ai', href: 'https://products.org.ai' },
              { name: 'safety.org.ai', href: 'https://safety.org.ai' },
            ],
            columns: 6
          },
          {
            title: "Properties",
            links: [
              { name: 'Enterprises', href: 'https://do.enterprise' },
              { name: 'Platform', href: 'https://platform.do' },
              { name: 'Startups', href: 'https://startups.do' },
              { name: 'Industries', href: 'https://do.industries' },
              
            ]
          },
          {
            title: "Resources",
            links: [
              { name: 'API', href: '/docs/api' },
              { name: 'CLI', href: '/docs/cli' },
              { name: 'MCP', href: '/docs/mcp' },
              { name: 'SDK', href: '/docs/sdk' },
            ]
          }
        ]}
        legalLinks={[
          { name: 'License', href: '/docs/license' },
          { name: 'Attribution', href: '/docs/attribution' },
          { name: 'Terms', href: '/docs/terms' },
          { name: 'Privacy', href: '/docs/privacy' },
        ]}
      />
    </div>
  );
}
