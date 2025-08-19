import { aliasPath } from 'esbuild-plugin-alias-path';
import path from 'path';
import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['cjs', 'esm'],
  dts: true,
  splitting: false,
  sourcemap: true,
  clean: true,
  external: ['react', 'next'],
  ignoreWatch: ['**/*.test.ts', '**/*.test.tsx', '**/vitest.setup.ts'],
  tsconfig: './tsconfig.json',
  esbuildPlugins: [
    aliasPath({
      alias: {
        '@': path.resolve(__dirname, './src')
      }
    })
  ]
});
