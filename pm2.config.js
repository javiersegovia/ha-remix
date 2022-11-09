/* eslint-disable prettier/prettier */
module.exports = {
  apps: [
    {
      name: "remix",
      script: "npm",
      args: "start",
      interpreter: "/bin/bash",
      env: {
        NODE_ENV: "production",
      },
    },
  ],

  deploy: {
    production: {
      key: "~/.ssh/id_rsa",
      user: "ubuntu",
      host: "ec2-3-225-58-178.compute-1.amazonaws.com",
      ref: "origin/master",
      repo: "git@github.com:javiersegovia/ha-remix.git",
      path: "/var/www/remix_app",
      "post-deploy": "npm install && npm run generate:schema && npm run build && npm run migrate:deploy && pm2 restart remix",
    },
  },
};
