import { createMDX } from 'fumadocs-mdx/next';

const withMDX = createMDX();

/** @type {import('next').NextConfig} */
const config = {
  reactStrictMode: true,
  output: 'export',
  images: {
    unoptimized: true,
  },
  // GitHub Pages requires trailing slashes
  trailingSlash: false,
  // Base path for GitHub Pages deployment (will be set in GitHub Actions)
  basePath: process.env.NEXT_PUBLIC_BASE_PATH || '',
};

export default withMDX(config);
