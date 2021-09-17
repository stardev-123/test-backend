module.exports = {
  apps: [{
    name: 'OnrampServer',
    script: 'npm',
    args: 'run deploy-dev',
    instances: 1,
    autorestart: true,
    watch: true,
    max_memory_restart: '2G'
  }],
  deploy: {
    development: {
      key: '~/.ssh/id_rsa.pub',
      user: 'ubuntu',
      host: '52.33.44.171',
      ref: 'origin/dev',
      repo: 'git@github.com:greycats/realityshares-backend.git',
      path: '/home/ubuntu/onramp',
      'post-deploy': 'pm2 reload ecosystem-dev.config.js',
      env: {
        NODE_PORT: 3000,
        NODE_ENV: 'dev'
      }
    }
  }
}
