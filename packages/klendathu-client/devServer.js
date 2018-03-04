const webpack = require('webpack');
const WebpackDevServer = require('webpack-dev-server');
const config = require('./webpack.config.js');

const CLIENT_PORT = 8180;
const SERVER_PORT = 8181;
const DEEPSTREAM_PORT = 6020;

// Adjust the config for hot reloading.
config.entry = [
  `webpack-dev-server/client?http://127.0.0.1:${CLIENT_PORT}`,
  'webpack/hot/only-dev-server', // "only" prevents reload on syntax errors
  './src/index.tsx', // Your appʼs entry point
];
config.plugins.push(new webpack.HotModuleReplacementPlugin());
config.plugins.push(new webpack.NamedModulesPlugin());

const compiler = webpack(config);
const server = new WebpackDevServer(compiler, {
  contentBase: __dirname,
  historyApiFallback: true,
  stats: 'minimal',
  hot: true,
  publicPath: '/public/',
  watchOptions: { poll: 1000 },
  proxy: {
    '/api': {
      target: `http://localhost:${SERVER_PORT}`,
      secure: false
    },
    '/auth': {
      target: `http://localhost:${SERVER_PORT}`,
      secure: false
    },
    '/deepstream': {
      target: `http://localhost:${DEEPSTREAM_PORT}`,
      ws: true,
      secure: false
    }
  }
});
server.listen(CLIENT_PORT, 'localhost');
