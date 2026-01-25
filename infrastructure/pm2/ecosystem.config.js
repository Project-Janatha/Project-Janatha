/**
 * PM2 Ecosystem Configuration
 * Om Sri Cinmaya Sadgurave Namaha. Om Sri Gurubyo Namaha.
 *
 * This configuration is used inside the Docker container
 * to manage the Node.js backend process.
 */

module.exports = {
  apps: [
    {
      name: 'janatha-backend',
      script: './packages/backend/centralSequence.js',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production',
        PORT: 8008,
      },
      error_file: '/var/log/pm2/janatha-error.log',
      out_file: '/var/log/pm2/janatha-out.log',
      log_file: '/var/log/pm2/janatha-combined.log',
      time: true,
      merge_logs: true,
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    },
  ],
}
