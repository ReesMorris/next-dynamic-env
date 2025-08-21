import { defineConfig } from 'tsup';

export default defineConfig(options => ({
  entry: ['src/index.ts'],
  format: ['cjs', 'esm'],
  splitting: false,
  clean: true,
  external: ['react', 'next'],
  ignoreWatch: ['**/*.test.ts', '**/*.test.tsx', '**/vitest.setup.ts'],
  tsconfig: './tsconfig.json',

  // Optimization settings
  treeshake: true,
  minify: !options.watch, // Only minify in production builds

  // Better output naming for ESM/CJS
  outExtension({ format }) {
    return {
      js: format === 'esm' ? '.mjs' : '.js'
    };
  },

  // Target modern environments for smaller output
  target: 'es2020',

  // Generate declaration maps for better IDE support
  dts: {
    resolve: true,
    entry: './src/index.ts',
    compilerOptions: {
      composite: false,
      incremental: false
    }
  },

  // Keep console.error for debugging
  pure: options.watch
    ? []
    : ['console.log', 'console.warn', 'console.info', 'console.debug'],

  // Don't bundle dependencies
  noExternal: [],

  // Better source maps for debugging
  sourcemap: options.watch ? 'inline' : true,

  esbuildOptions(options) {
    options.treeShaking = true;
    // Add legal comments (licenses)
    options.legalComments = 'inline';
    // Better minification in production
    options.minifyWhitespace = true;
    options.minifyIdentifiers = true;
    options.minifySyntax = true;
  },

  // Add banner for debugging
  banner: {
    js: '/* next-dynamic-env - https://github.com/reesmorris/next-dynamic-env */'
  }
}));
