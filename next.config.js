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
};

module.exports = nextConfig;
