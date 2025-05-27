const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const UglifyJSPlugin = require('uglifyjs-webpack-plugin');
const WebpackShellPlugin = require('webpack-shell-plugin');
const Dotenv = require('dotenv-webpack');

const ENV = process.env.APP_ENV;
const isTest = ENV === 'test'
const isProd = ENV === 'prod';

function setDevTool() {
  if (isTest) {
    return 'inline-source-map';
  } else if (isProd) {
    return 'source-map';
  } else {
    return 'eval-source-map';
  }
}

const config = {
  devtool: setDevTool(),
  entry: __dirname + "/src/app/index.jsx",
  output: {
    path: __dirname + '/dist',
    filename: 'bundle.js',
    publicPath: '/'
  },
  resolve : {
    extensions: ['.js', '.jsx', '.json'],
    alias: {
      'onebusaway-sdk': __dirname + '/node_modules/onebusaway-sdk/dist/onebusaway-sdk.js',
      'react': __dirname + '/node_modules/react',
      'react-dom': __dirname + '/node_modules/react-dom'
    }
  },
  module: {
    rules: [
      {
        test: /\.jpe?g$|\.ico$|\.gif$|\.png$|\.woff$|\.ttf$|\.wav$|\.mp3$|\.webmanifest$|\.xml$/,
        use: [
          {
            loader: 'file-loader',
            options: {
              limit: 1000,
              name : '[name].[ext]'
            }
          }
        ],
      },
      {
        test: /apple-app-site-association$/,
        use: [
          {
            loader: 'file-loader',
            options: {
              limit: 1000,
              name : '[name]'
            }
          }
        ],
      },
      {
        test: /\.js[x]?$/,
        use: 'babel-loader',
        exclude: [
          /node_modules/  // Transpile onebusaway-sdk but exclude other node_modules
        ]
      },
      {
        test: /\.(sass|scss)$/,
        use: [{
          loader: "style-loader"
        }, {
          loader: "css-loader"
        }, {
          loader: "sass-loader"
        }]
      },
      {
        test: /\.css$/i,
        use: ['style-loader', 'css-loader'],
      },
      {
        test: /\.svg$/,
        use: ['@svgr/webpack'],
      },
    ]
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: __dirname + "/src/public/index.html",
      inject: 'body'
    }),
    new Dotenv()
  ],
  devServer: {
    contentBase: './src/public',
    port: 7700,
    disableHostCheck: true,
  },
};

// Minify and copy assets in production
if(isProd) {
  config.plugins.push(
    new UglifyJSPlugin(),
    new CopyWebpackPlugin([{
      from: __dirname + '/src/public'
    }])
  );
};

module.exports = config;