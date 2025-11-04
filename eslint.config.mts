import { FlatCompat } from '@eslint/eslintrc';
import path from 'node:path';

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

export default [
  {
    ignores: ['**/dist/**', '**/node_modules/**'],
  },
  ...[
    "./packages/prosemirror-lwdita-localization/eslint.config.mts",
    "./packages/prosemirror-lwdita/eslint.config.mts",
    "./packages/prosemirror-lwdita-demo/eslint.config.mts",
    "./packages/prosemirror-lwdita-backend/eslint.config.mts",
  ].map((p) => ({
    files: [path.join(p, '**/*.{ts,js,mts,cts}')],
    extends: [import(p)],
  })),
];