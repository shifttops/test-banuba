const path = require("path");

module.exports = {
  mode: "production",
  entry: {
    main: './src/index.tsx',
  },
  node: { fs: 'empty' },
  target: 'web',
  resolve: {
    extensions: ['.ts', '.tsx', '.js', '.mjs'],
  },
  output: {
    path: path.join(__dirname, '../server/public/js'),
    filename: 'bundle.min.js',
  },
  cache: true,
  optimization: {
    splitChunks: {
      chunks: 'async',
    }
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        loader: 'awesome-typescript-loader',
      },
      {
        test: /\.mjs$/,
        include: /node_modules/,
        type: 'javascript/auto',
      },
      {
        test: /\.scss$/,
        exclude: /node_modules/,
        rules: [
          {
            use: [
              'style-loader',
              'css-loader',
              'sass-loader',
            ],
          },
        ],
      },
      {
        test: /\.css$/,
        rules: [
          {
            use: [
              'style-loader',
              'css-loader',
            ],
          },
          {
            test: /\.wasm$/,
            type: 'javascript/auto',
            loader: 'file-loader',
          },
        ],
      },
      {
        test: /\.(gif|svg|jpg|png)$/,
        loader: 'url-loader',
      },
    ],
  },
  devServer: {
    historyApiFallback: true,
    hot: true,
  },
};
