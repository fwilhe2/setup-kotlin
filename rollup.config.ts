// rollup.config.ts
import commonjs from '@rollup/plugin-commonjs'
import nodeResolve from '@rollup/plugin-node-resolve'
import typescript from '@rollup/plugin-typescript'

const config = {
  input: 'src/main.ts',
  output: {
    file: 'dist/index.js',
    format: 'es',
    sourcemap: true,
    inlineDynamicImports: true
  },
  // Ensure 'external' is empty or doesn't include action dependencies
  external: [],
  plugins: [
    typescript(),
    nodeResolve({
      preferBuiltins: true,
      exportConditions: ['node'] // Helps resolve node-specific ESM packages
    }),
    commonjs()
  ]
}

export default config
