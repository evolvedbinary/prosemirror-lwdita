const path = require('path');

module.exports = {
  target: 'node',
  entry: './src/server.ts',
  module: {
    rules: [
      {
        // NOTE(AR) the test is for any of: .mts, .mtsx, .ts, or .tsx
        test: /\.m?tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.mts', '.js'],
    extensionAlias: {
      // map import for .mjs file to .mts file
      '.mjs': ['.mts']
    }
  },
  output: {
    filename: 'server.bundle.js',
    path: path.resolve(__dirname, 'dist/bundle'),
    clean: true,
  },
};
