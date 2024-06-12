module.exports = {
    apps: [
      {
        name: 'mouzl-backend',
        script: './index.js',
        instances: 'max',
        watch: false,
        exec_mode: 'cluster',
        env: {
          NODE_ENV: 'development',
        },
        env_production: {
          NODE_ENV: 'production',
        },
      },
    ],
  };
  