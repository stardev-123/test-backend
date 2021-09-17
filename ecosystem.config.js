module.exports = {
  apps: [{
    name: 'OnrampServer',
    script: 'npm',
    args: 'run deploy-qa',
    instances: 1,
    autorestart: true,
    watch: true,
    max_memory_restart: '2G'
  }],
  deploy: {
    staging: {
      key: '~/.ssh/id_rsa.pub',
      user: 'ubuntu',
      host: '54.218.85.237',
      port: '62323',
      ref: 'origin/staging',
      repo: 'git@github.com:greycats/realityshares-backend.git',
      path: '/home/ubuntu/onramp',
      'post-deploy': 'pm2 reload ecosystem.config.js',
      env: {
        NODE_PORT: 3000,
        NODE_ENV: 'qa'
      }
    }
  }
}
