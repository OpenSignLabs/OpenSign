const path = require("path");
const Dotenv = require("dotenv-webpack");
const { CleanWebpackPlugin } = require("clean-webpack-plugin"); //used to clean directory
const TerserPlugin = require("terser-webpack-plugin"); //used to minify and optimize JavaScript files
const MiniCssExtractPlugin = require("mini-css-extract-plugin"); //used to extract css file into separate files

const isProduction = process.env.NODE_ENV;
module.exports = {
  mode: isProduction ? "production" : "development",
  entry: "./src/script/PublicTemplate.js",
  output: {
    path: path.resolve(__dirname, "public", "static", "js"),
    filename: "public-template.bundle.js",
    libraryTarget: "umd",
    umdNamedDefine: true,
    library: "PublicTemplate",
    globalObject: "this"
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader",
          options: {
            presets: ["@babel/preset-react"]
          }
        }
      },
      {
        test: /\.css$/,
        use: [
          isProduction ? MiniCssExtractPlugin.loader : "style-loader",
          "css-loader",
          "postcss-loader"
        ]
      },
      {
        test: /\.(png|jpe?g|gif|svg)$/i,
        use: [
          {
            loader: "file-loader",
            options: {
              name: "assets/images/[name].[hash].[ext]"
            }
          }
        ]
      }
    ]
  },
  resolve: {
    extensions: [".js", ".jsx"]
  },
  plugins: [
    new Dotenv(),
    new CleanWebpackPlugin(),
    ...(isProduction
      ? [
          new MiniCssExtractPlugin({
            filename: "[name].[contenthash].css"
          })
        ]
      : [])
  ],
  optimization: {
    minimize: isProduction ? true : false,
    minimizer: [new TerserPlugin()]
  },
  devtool: isProduction ? "source-map" : "inline-source-map"
};
