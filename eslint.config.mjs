import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { FlatCompat } from '@eslint/eslintrc';

const compat = new FlatCompat({ baseDirectory: dirname(fileURLToPath(import.meta.url)) });

export default [
  { ignores: ['.next/**', 'node_modules/**', 'docs/**'] },
  ...compat.extends('next/core-web-vitals', 'next/typescript'),
  { rules: { '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_', varsIgnorePattern: '^_', ignoreRestSiblings: true }] } },
  // vignettes du back-office servies par /media : l'optimisation next/image n'apporte rien ici
  { files: ['src/app/admin/**', 'src/components/admin/**'], rules: { '@next/next/no-img-element': 'off' } },
];
