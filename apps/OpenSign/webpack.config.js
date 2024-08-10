const path = require("path");
const Dotenv = require("dotenv-webpack");
const { CleanWebpackPlugin } = require("clean-webpack-plugin"); //used to clean directory
const TerserPlugin = require("terser-webpack-plugin"); //used to minify and optimize JavaScript files
const MiniCssExtractPlugin = require("mini-css-extract-plugin"); //used to extract css file into separate files
const CopyPlugin = require("copy-webpack-plugin"); // CopyPlugin is a Webpack plugin used to copy files and directories from a source location to a destination location during the build process.
const JsonMinimizerPlugin = require("json-minimizer-webpack-plugin"); //It helps reduce the size of your JSON files by removing unnecessary whitespace, comments, and other redundant data.
const isProduction = process.env.NODE_ENV;
module.exports = {
  mode: isProduction ? "production" : "development",
  entry: "./src/script/PublicTemplate.js",
  output: {
    path: path.resolve(__dirname, "public/static/js"),
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
      },
      {
        test: /\.json$/i,
        include: path.resolve(__dirname, "public/locales"),
        type: "asset/resource",
        generator: {
          filename: "locales/[path][name][ext]"
        }
      }
    ]
  },
  resolve: {
    extensions: [".js", ".jsx", ".json"]
  },
  plugins: [
    new Dotenv(),
    new CleanWebpackPlugin(),
    ...(isProduction
      ? [
          new MiniCssExtractPlugin({
            filename: "public-template.bundle.css"
          })
        ]
      : []),
    new CopyPlugin({
      patterns: [
        {
          context: path.resolve(__dirname, "public/locales"),
          from: "**/*.json",
          to: path.resolve(__dirname, "public/static/locales/[path][name][ext]")
        }
      ]
    })
  ],
  optimization: {
    minimize: isProduction ? true : false,
    minimizer: [new TerserPlugin(), new JsonMinimizerPlugin()]
  },
  devtool: isProduction ? "source-map" : "inline-source-map"
};
