const path = require("path");
const webpack = require("webpack");
const HtmlWebpackPlugin = require("html-webpack-plugin");

module.exports = (env, { mode = "development" }) => {
  const config = {
    mode,
    entry: {
      app: "./src/index.tsx"
    },
    devtool: "",
    resolve: {
      extensions: [".js", ".jsx", ".ts", ".tsx"]
    },
    module: {
      rules: [
        {
          test: /\.(js|jsx|tsx|ts)$/,
          exclude: /node_modules/,
          use: {
            loader: "babel-loader",
            options: {
              presets: [
                "@babel/preset-env",
                "@babel/preset-typescript",
                "@babel/preset-react"
              ],
              plugins: [
                "@babel/plugin-proposal-class-properties",
                "@babel/plugin-proposal-object-rest-spread"
              ]
            }
          }
        },
        {
          test: /\.less$/,
          use: [
            {
              loader: "style-loader" // creates style nodes from JS strings
            },
            {
              loader: "css-loader" // translates CSS into CommonJS
            },
            {
              loader: "less-loader" // compiles Less to CSS
            }
          ]
        }
      ]
    },
    output: {
      path: path.resolve(__dirname, "dist"),
      filename: "index.js",
      libraryTarget: "umd",
      publicPath: "/dist/",
      umdNamedDefine: true
    },
    optimization: {
      mangleWasmImports: true,
      mergeDuplicateChunks: true,
      minimize: true,
      nodeEnv: "production"
    },
    plugins: [
      new webpack.DefinePlugin({
        "process.env.NODE_ENV": '"production"'
      })
    ]
  };

  /**
   * If in development mode adjust the config accordingly
   */
  if (mode === "development") {
    config.devtool = "source-map";
    config.output = {
      filename: "[name]/index.js"
    };
    config.module.rules.push({
      loader: "source-map-loader",
      test: /\.js$/,
      exclude: /node_modules/,
      enforce: "pre"
    });
    config.plugins = [
      new webpack.DefinePlugin({
        "process.env.NODE_ENV": '"development"'
      }),
      new HtmlWebpackPlugin({
        template: path.resolve(__dirname, "../../templates/base.html")
      }),
      new webpack.HotModuleReplacementPlugin()
    ];
    config.devServer = {
      contentBase: path.resolve(__dirname, "dist"),
      publicPath: "/",
      proxy: {
        "/api/": {
          target: "http://localhost:5000",
          secure: false,
          changeOrigin: true
        }
      },
      stats: {
        colors: true,
        hash: false,
        version: false,
        timings: true,
        assets: true,
        chunks: false,
        modules: false,
        reasons: false,
        children: false,
        source: false,
        errors: true,
        errorDetails: true,
        warnings: false,
        publicPath: false
      }
    };
    config.optimization = {
      mangleWasmImports: true,
      mergeDuplicateChunks: true,
      minimize: false,
      nodeEnv: "development"
    };
  }
  return config;
};
