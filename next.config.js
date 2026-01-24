/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  // Suprimir warning de webpack sobre strings grandes
  webpack: (config, { isServer }) => {
    config.infrastructureLogging = {
      level: 'error',
    }
    return config
  },
  // Optimizaciones para producción
  poweredByHeader: false, // Ocultar header X-Powered-By
  compress: true, // Habilitar compresión gzip
  // Output standalone para mejor rendimiento en producción
  output: 'standalone',
}

module.exports = nextConfig
