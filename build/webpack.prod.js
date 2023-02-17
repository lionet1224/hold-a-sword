const { merge } = require('webpack-merge')
const common = require('./webpack.common')
// 压缩js的插件
const TerserJSPlugin = require('terser-webpack-plugin')
const { getRevision, getVersion } = require('./buildutils')
const webpack = require("webpack");
const CircularDependencyPlugin = require("circular-dependency-plugin");
const path = require("path");
const HtmlWebpackPlugin = require('html-webpack-plugin')
const { CleanWebpackPlugin } = require('clean-webpack-plugin');

module.exports = merge(common, {
  mode: 'production',
  optimization: {
    minimizer: [new TerserJSPlugin({})]
  },
  // 将打包文件输出到dist文件夹
  output: {
    filename: '[name]-prod-' + getVersion() + '.js',
    path: path.resolve(__dirname, '..', 'dist'),
  },
  plugins: [
    new webpack.DefinePlugin({
      assert: "window.assert",
      abstract:
        'window.assert(false, "abstract method called of: " + (this.name || (this.constructor && this.constructor.name)))',
      // 什么环境
      G_APP_ENVIRONMENT: JSON.stringify("prod"),
      G_IS_DEV: "false",
      G_IS_PROD: "true",
      G_BUILD_TIME: "" + new Date().getTime(),
      G_BUILD_COMMIT_HASH: JSON.stringify(getRevision()),
      G_BUILD_VERSION: JSON.stringify(getVersion()),
    }),
  ],
})
