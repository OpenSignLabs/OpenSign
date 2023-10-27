const { dependencies } = require("./package.json");

module.exports = {
  name: "signmicroapp", // change me
  filename: "remoteEntry.js",
  exposes: {
    // key e.g"./AppRoutes" is path which will use as moduletoload in host app
    // value e.g"./src/Routes" is path which will as a bind path to load
     
    "./AppRoutes": "./src/Routes",
  },
  shared: {
    ...dependencies,
    react: {
      singleton: true,
      import: "react", // fallback is also react
      shareScope: "default",
      requiredVersion: dependencies.react,
    },
    "react-dom": {
      singleton: true,
      requiredVersion: dependencies["react-dom"],
    },
    "react-router-dom": {
      singleton: true,
      requiredVersion: dependencies["react-router-dom"],
    },
  },
};
