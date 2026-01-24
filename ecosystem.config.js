module.exports = {
  apps: [{
    name: 'mundial2026',
    // Usar el servidor standalone de Next.js (más eficiente)
    script: '.next/standalone/server.js',
    cwd: '/home/mundial2026/mundial2026-app',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 3000,
      HOSTNAME: '0.0.0.0'
    },
    // Configuración de logs
    error_file: '/home/mundial2026/logs/error.log',
    out_file: '/home/mundial2026/logs/output.log',
    log_file: '/home/mundial2026/logs/combined.log',
    time: true,
    // Reinicio automático
    max_memory_restart: '500M',
    restart_delay: 3000,
    max_restarts: 10,
    // Watch (desactivado en producción)
    watch: false,
    ignore_watch: ['node_modules', '.git', 'logs']
  }]
}
