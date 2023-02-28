const { merge } = require('webpack-merge');
const webpack = require('webpack');
const { getRevision, getVersion } = require('./buildutils');
const common = require('./webpack.common');

module.exports = merge(common, {
  mode: 'development',
  plugins: [
    new webpack.DefinePlugin({
      assert: 'window.assert',
      abstract:
        'window.assert(false, "abstract method called of: " + (this.name || (this.constructor && this.constructor.name)))',
      // 什么环境
      G_APP_ENVIRONMENT: JSON.stringify('dev'),
      G_IS_DEV: 'true',
      G_IS_PROD: 'false',
      G_BUILD_TIME: `${new Date().getTime()}`,
      G_BUILD_COMMIT_HASH: JSON.stringify(getRevision()),
      G_BUILD_VERSION: JSON.stringify(getVersion()),
    }),
  ],
  watch: true,
});
