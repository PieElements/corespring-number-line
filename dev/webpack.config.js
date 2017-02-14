module.exports = {
  entry: './entry.jsx',
  context: __dirname,
  output: {
    filename: 'bundle.js',
    path: __dirname
  },
  module: {
    rules: [
      {
        test: /\.jsx$/, use: [{
          loader: 'babel-loader',
          options: {
            babelrc: false,
            presets: [
              'babel-preset-react'
            ]

          }
        }]
      }
    ]
  },
  resolve: {
    extensions: [
      ".js",
      ".jsx"
    ]
  }
}