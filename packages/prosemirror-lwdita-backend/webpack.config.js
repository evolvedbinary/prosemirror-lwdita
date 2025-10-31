/*!
Copyright (C) 2020 Evolved Binary

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU Affero General Public License as
published by the Free Software Foundation, either version 3 of the
License, or (at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU Affero General Public License for more details.

You should have received a copy of the GNU Affero General Public License
along with this program.  If not, see <https://www.gnu.org/licenses/>.
*/


// eslint-disable-next-line @typescript-eslint/no-require-imports
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
