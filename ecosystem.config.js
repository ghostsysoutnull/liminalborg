module.exports = {
  apps: [{
    name: 'telegram-bot',
    script: 'src/bot.js',
    instances: 1,
    exec_mode: 'fork',
    max_memory_restart: '200M',
    exp_backoff_restart_delay: 100,
    watch: false,
    env: {
      NODE_ENV: 'development',
    },
    env_production: {
      NODE_ENV: 'production',
    },
    error_file: 'data/logs/pm2.err.log',
    out_file: 'data/logs/pm2.out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss',
    merge_logs: true
  }]
};
