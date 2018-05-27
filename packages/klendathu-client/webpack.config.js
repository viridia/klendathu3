const webpack = require('webpack');
const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');
const path = require('path');

const debug = process.env.NODE_ENV !== 'production';

module.exports = {
  mode: debug ? 'development' : 'production',
  entry: {
    main: [ './src/index.tsx' ],
  },
  output: {
    path: path.resolve(__dirname, 'public'),
    publicPath: '/public/',
    filename: '[name].bundle.js',
    chunkFilename: '[name]-[chunkhash].js',
  },
  resolve: {
    extensions: ['.ts', '.tsx', '.js'],
  },
  plugins: [
    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: JSON.stringify(process.env.NODE_ENV),
      },
    }),
    new webpack.LoaderOptionsPlugin({ minimize: !debug, debug }),
    // new ForkTsCheckerWebpackPlugin({ tslint: path.resolve(__dirname, '../../tslint.json') }),
  ],
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        include: [
          path.resolve(__dirname, 'src'),
          path.resolve(__dirname, 'node_modules/factory-types'),
        ],
        use: [
          {
            loader: 'babel-loader',
            options: {
              babelrc: true,
              plugins: ['react-hot-loader/babel'],
            },
          },
          {
            loader: 'ts-loader',
            // options: { transpileOnly: true }
          }
        ]
      },
      {
        // SASS
        test: /\.scss$/,
        use: ['style-loader', 'css-loader', 'sass-loader']
      },
      {
        // CSS
        test: /\.css$/,
        loaders: [
          'style-loader',
          'css-loader',
        ],
      },
      {
        // Inline SVG icons
        include: path.join(__dirname, 'icons'),
        test: /\.svg$/i,
        loader: 'svg-react-loader',
      },
      {
        // PNG
        test: /\.png$/,
        loader: 'url-loader',
        options: {
          mimetype: 'image/png',
          limit: 4096,
        },
      },
    ],
  },
};
