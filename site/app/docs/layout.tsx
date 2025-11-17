import { source } from '@/lib/source';
import { DocsLayout } from 'fumadocs-ui/layouts/docs';
import { baseOptions } from '@/lib/layout.shared';

export default function Layout({ children }: LayoutProps<'/docs'>) {
  const options = baseOptions();
  // Remove the docs link from the docs layout since we're already in docs
  const { links, ...restOptions } = options;

  return (
    <DocsLayout tree={source.pageTree} {...restOptions}>
      {children}
    </DocsLayout>
  );
}
