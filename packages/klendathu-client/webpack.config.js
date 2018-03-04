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
    path: path.resolve(__dirname, '../public'),
    publicPath: '/public/',
    filename: '[name].bundle.js',
    chunkFilename: '[name]-[chunkhash].js',
  },
  resolve: {
    // alias: {
    //   common: path.resolve(__dirname, 'common/'),
    // },
    extensions: ['.ts', '.tsx', '.js'],
  },
  plugins: [
    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: JSON.stringify(process.env.NODE_ENV),
      },
    }),
    new webpack.LoaderOptionsPlugin({ minimize: !debug, debug }),
    // new ExtractTextPlugin('style.css'), // doesn't work with react-hot-loader
    new ForkTsCheckerWebpackPlugin({ tslint: path.resolve(__dirname, '../../tslint.json') }),
  ],
  devtool: debug ? 'cheap-eval-source-map' : 'source-map',
  module: {
    rules: [
      {
        // All files with a '.ts' or '.tsx' extension.
        test: /\.tsx?$/,
        include: [
          path.resolve(__dirname, 'src'),
          // path.resolve(__dirname, '../types'),
          // path.resolve(__dirname, 'common'),
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
            options: {
              transpileOnly: true
            }
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
        },
      },
    ],
  },
};
