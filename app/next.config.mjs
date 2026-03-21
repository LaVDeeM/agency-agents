import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    // Include the parent marketing/ directory in the Vercel deployment bundle
    // so agent .md files are available to API routes at runtime
    outputFileTracingRoot: path.join(__dirname, '../'),
  },
}

export default nextConfig
