const { createServer } = require('https');
const { parse } = require('url');
const fs = require('fs');
const path = require('path');
const next = require('next');
/**
 * @type {import('next').NextConfig}
 */
const nextConfig = {
  reactStrictMode: true,
  // Enable TypeScript for .js files
  typescript: {
    ignoreBuildErrors: false,
  },
  // Configure allowed image domains
  images: {
    domains: ['frontend-take-home.fetch.com'],
  },
  // Configure static generation to skip problematic pages
  staticPageGenerationTimeout: 120,
  // Disable static generation for dashboard page
  experimental: {
    // Prevent window errors during build by skipping prerendering for pages that use window
    disableOptimizedLoading: true
  }
};

module.exports = nextConfig;
