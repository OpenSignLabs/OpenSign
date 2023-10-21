const { dependencies } = require("./package.json");

module.exports = {
  name: "shell_app", // change me
  filename: "remoteEntry.js",
  exposes: {},
  remotes: {},
  shared: {
    ...dependencies,
    react: {
      singleton: true,
      import: "react", // fallback is also react
      shareScope: "default",
      requiredVersion: dependencies.react
    },
    "react-dom": {
      singleton: true,
      requiredVersion: dependencies["react-dom"]
    },
    "react-router-dom": {
      singleton: true,
      requiredVersion: dependencies["react-router-dom"]
    },
    "rjsf-conditionals": {
      singleton: true,
      requiredVersion: dependencies["rjsf-conditionals"]
    }
  }
};
