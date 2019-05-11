const HTMLWebpackPlugin = require('html-webpack-plugin');
const path = require('path');

module.exports = {
  entry: path.resolve(__dirname, 'src/index.js'),
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'bundle.js'
  },
  resolve: {
    alias: {
      src: path.resolve(__dirname, 'src/'),
      data: path.resolve(__dirname, 'data/')
    }
  },
  module: {
    rules:  [{
      test: /\.js$/i,
      exclude: /node_modules/,
      use: {
        loader: 'babel-loader',
        options: {
          presets: [
            '@babel/preset-env'
          ],
          plugins: [
            '@babel/plugin-transform-regenerator',
            '@babel/plugin-proposal-object-rest-spread',
            '@babel/plugin-proposal-class-properties'
          ]
        }
      }
    }, {
      test: /\.bvh$/i,
      use: 'file-loader'
    }, {
      test: /\.pegjs$/i,
      loader: 'pegjs-loader'
    }]
  },
  plugins: [
    new HTMLWebpackPlugin({
      title: 'BVH Viewer',
      template: require('html-webpack-template'),
      inject: false,
      appMountId: 'app'
    })
  ],
  devtool: process.env.NODE_ENV === 'production' ? '' : 'source-map'
};
