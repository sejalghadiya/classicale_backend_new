module.exports = {
  apps: [
    {
      name: "classical",
      script: "./index.js",
      env: {
        NODE_ENV: "dev",
      },
      env_production: {
        NODE_ENV: "prod",
      },
    },
  ],
};
