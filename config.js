/** @type {import('next').NextConfig} */
const nextConfig = {
  // Configure static generation to exclude pages that use window
  staticPageGenerationTimeout: 120,
  // Other config...
}

module.exports = nextConfig
