const webpack = require("webpack");
const path = require('path'); 

const HtmlWebpackPlugin = require('html-webpack-plugin');
const HtmlWebpackPluginConfig = new HtmlWebpackPlugin({
  template: 'index.html',
  filename: 'index.html',
  inject: 'body'
})

const config = {
  entry: "./js/main.js",
  output: {
    path: path.resolve('dist'), 
    filename: "bundle.js",
  },
  resolve: {
    extensions: [".js", ".css"],
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: "babel-loader",
      },
    ],
  },
  plugins: [HtmlWebpackPluginConfig]
};
module.exports = config;
