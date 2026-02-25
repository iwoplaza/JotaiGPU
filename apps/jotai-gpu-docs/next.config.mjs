import { createMDX } from 'fumadocs-mdx/next';
import TypeGPU from 'unplugin-typegpu/webpack';

const withMDX = createMDX();

/** @type {import('next').NextConfig} */
const config = {
  serverExternalPackages: ['@takumi-rs/image-response'],
  output: 'export',
  reactStrictMode: true,
  turbopack(config) {
    config.plugins.push(TypeGPU({}));
    return config;
  },
};

export default withMDX(config);
