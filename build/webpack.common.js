const path = require("path");
const webpack = require("webpack");
const CircularDependencyPlugin = require("circular-dependency-plugin");
const { getRevision, getVersion } = require("./buildutils");
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin')

module.exports = {
  mode: "development",
  devtool: "cheap-source-map",
  entry: {
    main: './main.js',
  },
  context: path.resolve(__dirname, "../"),
  // 将打包文件输出到dist文件夹
  output: {
    filename: '[name]-dev.js',
    path: path.resolve(__dirname, '..', 'dist'),
  },
  plugins: [
    // 防止相互导入文件
    new CircularDependencyPlugin({
      exclude: /node_modules/,
      failOnError: true,
      allowAsyncCycles: false,
      cwd: path.join(__dirname, "src"),
    }),

    new CleanWebpackPlugin(),

    new HtmlWebpackPlugin({
      version: getVersion(),
      template: './index.html',
      filename: './index.html',
      // inject: false,
      minify: {
        collapseWhitespace: true,
        removeComments: true
      },
    })
  ],
  module: {
    rules: [
      // json文件被压缩
      {
        test: /\.json$/,
        enforce: "pre",
        use: ["./loader.compressjson"],
        type: "javascript/auto",
      },
      // js文件
      {
        test: /\.js$/,
        enforce: "pre",
        exclude: /node_modules/,
        use: [
          {
            // 删除注释代码
            loader: "webpack-strip-block",
            options: {
              // 自定义注释的开始结尾
              start: "typehints:start",
              end: "typehints:end",
            },
          },
        ],
      },
      // 将这个worker.js改成worker文件，可以使用多线程，线程间可以互相通信
      {
        test: /\.worker\.js$/,
        use: {
          loader: "worker-loader",
          options: {
            inline: "fallback",
          },
        },
      },
    ],
  },
};