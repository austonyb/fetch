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
  
  typescript: {
    ignoreBuildErrors: false,
  },
  
  images: {
    domains: ['frontend-take-home.fetch.com'],
  },
  
  staticPageGenerationTimeout: 120,
  
  experimental: {
    
    disableOptimizedLoading: true
  }
};

module.exports = nextConfig;
